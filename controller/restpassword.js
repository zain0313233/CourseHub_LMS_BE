const jwt = require("jsonwebtoken");
require("dotenv").config();

function genrateresetToken(userId) {
  try {
    if (!userId) {
      throw new Error("User ID required");
    }

    const resetToken = jwt.sign(
      { userId, type: "reset" },
      process.env.Jwt_RESET_TOKEN,
      { expiresIn: "15m" }
    );

    return resetToken;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate reset token");
  }
}
const nodemailer = require("nodemailer");

async function sendResetEmail(toEmail, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  const mailOptions = {
    from: `"CourseHub LMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { genrateresetToken, sendResetEmail };
