import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (to, otp, name = "") => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Your OTP for Chat App Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1f2937;">Verify your email</h2>
        <p>Hi ${name || "there"},</p>
        <p>Your OTP for registration is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This OTP is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.
          Do not share it with anyone.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
