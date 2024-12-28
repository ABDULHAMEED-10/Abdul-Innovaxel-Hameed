const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
