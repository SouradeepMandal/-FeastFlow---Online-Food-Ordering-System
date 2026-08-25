import mongoose from 'mongoose';

const onboardingRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'requested',
        'submitted',
        'ai_review',
        'manual_review',
        'approved',
        'rejected',
        'completed',
      ],
      default: 'requested',
    },
    documents: [
      {
        docType: String,
        fileUrl: String,
        aiVerdict: {
          type: String,
          enum: ['pass', 'fail', 'uncertain', 'pending'],
          default: 'pending',
        },
        confidence: Number,
      }
    ],
    geminiConfidenceScore: {
      type: Number,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin ID if manually reviewed
    },
    registrationTokenHash: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
    },
    restaurantDetails: {
      name: String,
      cuisine: String,
      address: String,
      fssaiNumber: String,
      gstNumber: String,
      bankDetails: String,
    }
  },
  {
    timestamps: true,
  }
);

const OnboardingRequest = mongoose.model('OnboardingRequest', onboardingRequestSchema);
export default OnboardingRequest;
