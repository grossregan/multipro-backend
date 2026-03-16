// backend/server.js

const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Replace with your destination email
const DESTINATION_EMAIL = process.env.DESTINATION_EMAIL || 'reganhgross@gmail.com';

// Configure your email transport (example uses Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post(
  '/api/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, message } = req.body;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: DESTINATION_EMAIL,
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
