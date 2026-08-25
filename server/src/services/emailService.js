import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

// ─── Brevo HTTP API (port 443 - never blocked by hosting providers) ───────────
// Brevo REST API key — set BREVO_API_KEY in Render Dashboard > Environment
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL || 'souradeepmandal459@gmail.com';

/**
 * Send an email via Brevo's REST API (HTTPS, port 443).
 * This works on Render free tier unlike SMTP which is blocked on port 587.
 */
const sendBrevoEmail = (toEmail, toName, subject, htmlContent) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: { name: 'FeastFlow', email: SMTP_FROM },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          console.error('Brevo API error:', res.statusCode, data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Brevo request error:', err);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.error('Brevo request timed out');
      req.destroy();
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

export const sendOTPEmail = async (toEmail, otpCode) => {
  const subject = 'Your FeastFlow Login OTP';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
      <h2 style="color: #ef4444;">FeastFlow Login Verification</h2>
      <p>Your One-Time Password (OTP) for login is:</p>
      <h1 style="color: #ef4444; letter-spacing: 8px; font-size: 40px;">${otpCode}</h1>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendBrevoEmail(toEmail, '', subject, htmlContent);
};

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const subject = 'FeastFlow Password Reset Request';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
      <h2 style="color: #ef4444;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to set a new one:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; color: #fff; background-color: #ef4444; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a></p>
      <p style="color: #888; font-size: 12px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendBrevoEmail(toEmail, '', subject, htmlContent);
};

export const sendCredentialsEmail = async (toEmail, restaurantName, username, password) => {
  const subject = 'Welcome to FeastFlow - Your Restaurant Owner Credentials';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
      <h2 style="color: #ef4444;">Congratulations! 🎉</h2>
      <p>Your restaurant <strong>${restaurantName}</strong> has been approved on FeastFlow.</p>
      <p>Here are your login credentials:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Log in at the FeastFlow Restaurant Owner portal. We recommend changing your password after your first login.</p>
      <p>Welcome aboard! 🚀</p>
    </div>
  `;
  return sendBrevoEmail(toEmail, restaurantName, subject, htmlContent);
};
