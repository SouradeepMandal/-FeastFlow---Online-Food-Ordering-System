import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OnboardingRequest from '../models/OnboardingRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { validateDocumentsWithGemini, generateCredentialsWithGemini } from '../services/geminiService.js';
import { sendCredentialsEmail } from '../services/emailService.js';

// @desc    Trigger Restaurant Owner Onboarding
// @route   POST /api/onboarding/trigger
// @access  Private (Logged in customer)
export const triggerOnboarding = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if there is already an active request
    const existingRequest = await OnboardingRequest.findOne({ userId, status: { $ne: 'rejected' } });
    if (existingRequest && existingRequest.status !== 'completed') {
      return res.status(400).json({ message: 'You already have a pending onboarding request.' });
    }

    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot request to become a restaurant owner.' });
    }

    // Generate unique token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const onboardingReq = await OnboardingRequest.create({
      userId,
      status: 'requested',
      registrationTokenHash: hashedToken,
      tokenExpiresAt: expiresAt,
    });

    // Deliver link to Inbox (Notification)
    const registrationLink = `/owner-onboarding?token=${rawToken}&id=${onboardingReq._id}`;
    
    await Notification.create({
      userId,
      type: 'owner_registration_link',
      message: 'You requested to become a Restaurant Owner! Click here to submit your documents and complete onboarding.',
      link: registrationLink,
    });

    res.status(201).json({ message: 'Onboarding triggered successfully. Please check your inbox for the registration link.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit Onboarding Documents
// @route   POST /api/onboarding/submit
// @access  Private (Must have token)
export const submitDocuments = async (req, res) => {
  try {
    const { token, requestId, restaurantDetails } = req.body;
    // req.files would contain the uploaded files (multer)
    // For simplicity in this controller, we assume files are handled and their URLs are passed in body
    const { documents } = req.body; 

    const onboardingReq = await OnboardingRequest.findById(requestId);
    if (!onboardingReq || onboardingReq.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (onboardingReq.registrationTokenHash !== hashedToken || onboardingReq.tokenExpiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    onboardingReq.status = 'submitted';
    onboardingReq.restaurantDetails = restaurantDetails;
    onboardingReq.documents = documents.map(doc => ({
      docType: doc.type,
      fileUrl: doc.url,
      aiVerdict: 'pending',
    }));
    await onboardingReq.save();

    // Step 4: AI Document Validation
    onboardingReq.status = 'ai_review';
    await onboardingReq.save();

    try {
      const aiResult = await validateDocumentsWithGemini(onboardingReq.documents, onboardingReq.restaurantDetails);
      
      onboardingReq.geminiConfidenceScore = aiResult.geminiConfidenceScore;
      
      let allPass = true;
      aiResult.verdicts.forEach(verdict => {
        const doc = onboardingReq.documents.find(d => d.docType === verdict.docType);
        if (doc) {
          doc.aiVerdict = verdict.aiVerdict;
          doc.confidence = verdict.confidence;
          if (verdict.aiVerdict !== 'pass' || verdict.confidence < 80) {
            allPass = false;
          }
        }
      });

      if (allPass && aiResult.geminiConfidenceScore >= 80) {
        // Proceed automatically
        onboardingReq.status = 'approved';
        await onboardingReq.save();
        
        // Trigger Backend Loop Check asynchronously
        processApproval(onboardingReq._id, aiResult.feedback).catch(console.error);
        
        return res.status(200).json({ message: 'Documents submitted and automatically verified! Generating credentials...' });
      } else {
        // Step 5: Human in the loop
        onboardingReq.status = 'manual_review';
        await onboardingReq.save();
        
        await Notification.create({
          userId: onboardingReq.userId,
          type: 'onboarding_review',
          message: `Your application is pending manual review. AI Feedback: ${aiResult.feedback || 'We found some inconsistencies in the documents provided.'}`,
        });
        
        return res.status(200).json({ message: 'Documents submitted. Pending manual review by an admin.' });
      }
    } catch (aiError) {
      console.error(aiError);
      onboardingReq.status = 'manual_review'; // Fallback
      await onboardingReq.save();
      
      await Notification.create({
        userId: onboardingReq.userId,
        type: 'onboarding_review',
        message: 'Your documents were submitted. Pending manual review (AI unavailable).',
      });
      
      return res.status(200).json({ message: 'Documents submitted. Pending manual review (AI unavailable).' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 6-9: The Backend Loop Check (Safe Credential Generation)
export const processApproval = async (requestId, aiFeedback = '') => {
  const reqDoc = await OnboardingRequest.findById(requestId).populate('userId');
  if (!reqDoc || reqDoc.status !== 'approved') return;

  const user = reqDoc.userId;
  const restaurantName = reqDoc.restaurantDetails.name;
  let uniqueUsername = null;
  let generatedPassword = null;
  let isNewOwner = user.role !== 'restaurant_owner';

  if (isNewOwner) {
    const maxRetries = 5;
    let attempt = 0;
    let previousCollisions = [];

    while (attempt < maxRetries && !uniqueUsername) {
      attempt++;
      try {
        const aiCreds = await generateCredentialsWithGemini(restaurantName, previousCollisions);
        
        const candidateUsername = aiCreds.username;
        const collision = await User.findOne({ email: `${candidateUsername}@feastflow.owner` });
        
        if (collision) {
          previousCollisions.push(candidateUsername);
        } else {
          uniqueUsername = candidateUsername;
          generatedPassword = aiCreds.password;
        }
      } catch (geminiErr) {
        console.error('Gemini credential generation failed, using fallback:', geminiErr.message);
        break; // Exit loop to trigger the fallback generator below
      }
    }

    if (!uniqueUsername) {
      uniqueUsername = `${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
      generatedPassword = crypto.randomBytes(4).toString('hex');
    }

    user.role = 'restaurant_owner';
    user.password = generatedPassword;
    await user.save();
  }

  const newRestaurant = await Restaurant.create({
    ownerId: user._id,
    name: reqDoc.restaurantDetails.name,
    cuisineTags: [reqDoc.restaurantDetails.cuisine],
    address: { street: reqDoc.restaurantDetails.address },
    fssaiNumber: reqDoc.restaurantDetails.fssaiNumber,
    gstNumber: reqDoc.restaurantDetails.gstNumber,
    bankDetails: reqDoc.restaurantDetails.bankDetails,
    status: 'active',
  });

  if (isNewOwner) {
    user.restaurantId = newRestaurant._id;
    await user.save();
  }

  reqDoc.status = 'completed';
  await reqDoc.save();

  // Step 9: Secure delivery
  if (isNewOwner) {
    await Notification.create({
      userId: user._id,
      type: 'credentials_issued',
      message: `Your restaurant has been approved! ${aiFeedback ? 'AI Feedback: ' + aiFeedback + '. ' : ''}Owner Portal Login -> Username: ${uniqueUsername} | Password: ${generatedPassword}. Please change your password on first login.`,
      link: '/owner',
    });

    // Send email with credentials
    await sendCredentialsEmail(user.email, restaurantName, uniqueUsername, generatedPassword);
  } else {
    await Notification.create({
      userId: user._id,
      type: 'general',
      message: `Your new restaurant "${restaurantName}" has been approved and added to your owner portal! ${aiFeedback ? 'AI Feedback: ' + aiFeedback + '.' : ''}`,
      link: '/owner',
    });
  }
};
