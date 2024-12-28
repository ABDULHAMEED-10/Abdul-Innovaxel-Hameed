const nodemailer = require("nodemailer");

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: process.env.SMPT_SERVICE,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASS,
    port: process.env.SMPT_PORT,
    host: process.env.SMPT_HOST,
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
