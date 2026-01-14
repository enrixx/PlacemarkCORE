import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Fail faster if connection stalls or times out for example on Render
    connectionTimeout: 10000,
    socketTimeout: 10000
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to " + to);
  } catch (error) {
    console.error("Error sending email to " + to + " error:", error);
    if (error.code === 'ETIMEDOUT') {
        throw new Error("Email server timeout");
    }
    throw error;
  }
};
