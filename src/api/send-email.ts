"use server";

import nodemailer from 'nodemailer';

// This is a server action function
export async function sendWaitlistEmail(email: string) {
  if (!email) {
    throw new Error('Email is required');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASS,
    },
  });

  const mailOptions = {
    from: process.env.OUTLOOK_USER,
    to: process.env.OUTLOOK_USER,
    subject: 'New Waitlist Signup - SearchDogAI',
    text: `A new user has joined the waitlist: ${email}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send email');
  }
}
