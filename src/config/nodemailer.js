const nodemailer = require("nodemailer");

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail", // Or use another email service like Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Verify the connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer connection error:", error);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

module.exports = transporter;
