// backend/server.js

const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

const corsOptions = {
origin: [
    'https://multipro-frontend-two.vercel.app', //vercel deployment
    'http://localhost:5173' //local development
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());

// Configure your email transport (SendGrid)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
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
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: 'New Contact Form Submission',
        replyTo: email,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
      console.error('Email send failed:', err);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
