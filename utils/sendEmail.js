import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, otp) => {
  try {
    const msg = {
      to,
      from: "admission.mmantc13@gmail.com", // MUST be verified in SendGrid
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial;">
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color: #1a73e8;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
        </div>
      `,
    };

    await sgMail.send(msg);

    console.log("✅ OTP email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err.response?.body || err.message);
    throw err;
  }
};

export default sendEmail;
