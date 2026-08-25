import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key', // Ensure this is set in .env
});

export const validateDocumentsWithGemini = async (documents, restaurantDetails) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
    throw new Error('No valid Gemini API key provided');
  }
  try {
    const prompt = `You are a strict legal document and business credentials verification system. I am providing you with details of a restaurant onboarding request.
    
    Restaurant Details Provided by User:
    ${JSON.stringify(restaurantDetails, null, 2)}
    
    Document Metadata and Content: 
    ${JSON.stringify(documents, null, 2)}
    
    Perform the following validation checks:
    1. Verify that the FSSAI License Number is a 14-digit numeric code.
    2. Verify that the GST Number is a valid 15-character alphanumeric format (typically 2 numbers, 10 letters, 1 number, 1 letter, 1 number).
    3. Cross-check the document metadata with the provided restaurant details for consistency.
    4. Determine if the overall submission seems authentic and complete.
    
    Return a STRICTLY structured JSON response exactly matching this schema:
    {
      "geminiConfidenceScore": Number between 0 and 100 (Overall confidence),
      "feedback": "String. A suitable, concise message explaining the verdict to the user.",
      "verdicts": [
        {
          "docType": "String (e.g., 'fssai_license', 'gst_certificate', 'credentials')",
          "aiVerdict": "pass" | "fail" | "uncertain",
          "confidence": Number between 0 and 100
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('Gemini Document Validation Error:', error);
    throw new Error('Failed to validate documents with AI');
  }
};

export const generateCredentialsWithGemini = async (restaurantName, previousCollisions = []) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
    throw new Error('No valid Gemini API key provided');
  }
  try {
    let prompt = `You are an automated system generating credentials for a new restaurant owner. 
    Restaurant Name: "${restaurantName}"
    
    Generate a professional username (lowercase, no spaces, perhaps reflecting the restaurant name) and a random, strong 8-character password.
    
    Return STRICTLY JSON matching this schema:
    {
      "username": "...",
      "password": "..."
    }`;

    if (previousCollisions.length > 0) {
      prompt += `\n\nCRITICAL: The following usernames are already taken and MUST NOT BE USED: ${previousCollisions.join(', ')}. Generate a completely different, unique username variant.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('Gemini Credential Generation Error:', error);
    throw new Error('Failed to generate credentials with AI');
  }
};

export const generateRejectionMessageWithGemini = async (restaurantName) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
    return 'Your onboarding application for "' + restaurantName + '" was not approved by the administrator.';
  }
  try {
    const prompt = `You are an automated system writing a polite, empathetic rejection letter.
    Restaurant Name: "${restaurantName}"
    
    Write a brief, single-paragraph message informing the user that their onboarding application to partner with FeastFlow was not approved at this time.
    
    Return STRICTLY JSON matching this schema:
    {
      "message": "..."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    return result.message;
  } catch (error) {
    console.error('Gemini Rejection Message Error:', error);
    return 'Your onboarding application for "' + restaurantName + '" was not approved by the administrator.';
  }
};
