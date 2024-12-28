const transporter = require("../config/nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.SMTP_USER, // Sender email address
    to, // Recipient email address
    subject, // Email subject
    text, // Plain text content
    html, // HTML content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
