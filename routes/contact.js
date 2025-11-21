const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send contact form email
router.post('/send-email', async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const transporter = createTransporter();
    
    // Email to freelancer
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.FREELANCER_EMAIL,
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Contact Form Message</h2>
          
          <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
            <h3 style="color: #1F2937; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #EFF6FF; border-radius: 8px;">
            <p style="margin: 0; color: #1E40AF; font-size: 14px;">
              <strong>Reply to:</strong> ${email}<br>
              <strong>Received:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
      console.log('Email not configured properly, logging message instead:');
      console.log('From:', `${firstName} ${lastName} <${email}>`);
      console.log('Subject:', subject);
      console.log('Message:', message);
      
      return res.json({ 
        success: true, 
        message: 'Message received successfully (email not configured)' 
      });
    }

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

module.exports = router;