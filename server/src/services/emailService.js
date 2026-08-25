import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// SMTP config — set these vars in Render Dashboard > Environment
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM_EMAIL;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});


export const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    const mailOptions = {
      from: `"FeastFlow" <${SMTP_FROM}>`,
      to: toEmail,
      subject: 'Your FeastFlow Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>FeastFlow Login Verification</h2>
          <p>Your One-Time Password (OTP) for login is:</p>
          <h1 style="color: #ef4444; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  try {
    const mailOptions = {
      from: `"FeastFlow Support" <${SMTP_FROM}>`,
      to: toEmail,
      subject: 'FeastFlow Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new one:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #ef4444; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reset Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    return false;
  }
};

export const sendCredentialsEmail = async (toEmail, restaurantName, username, password) => {
  try {
    const mailOptions = {
      from: `"FeastFlow Welcome" <${SMTP_FROM}>`,
      to: toEmail,
      subject: 'Welcome to FeastFlow - Your Restaurant Owner Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Congratulations!</h2>
          <p>Your restaurant <strong>${restaurantName}</strong> has been approved.</p>
          <p>You are now a Restaurant Owner on FeastFlow.</p>
          <p>Here are your new login credentials:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Username/Email:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in using these credentials at the FeastFlow login page. We recommend changing your password after your first login.</p>
          <p>Welcome aboard!</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Credentials Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending credentials email:', error);
    return false;
  }
};
