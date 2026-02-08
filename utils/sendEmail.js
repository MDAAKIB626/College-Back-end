import nodemailer from "nodemailer";

const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MMANTC INSPECTIONS" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial;">
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color: #1a73e8;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", to, "OTP:", otp);
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
};

export default sendEmail;
