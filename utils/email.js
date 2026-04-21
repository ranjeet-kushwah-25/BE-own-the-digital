const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendContactEmail = async (contactData) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.CONTACT_EMAIL,
    subject: `New Contact Form Submission: ${contactData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${contactData.company || 'Not provided'}</p>
          <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(contactData.priority)}; font-weight: bold;">${contactData.priority.toUpperCase()}</span></p>
          
          <h3 style="color: #007bff; margin-top: 20px;">Message Details</h3>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${contactData.message}</p>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            <strong>Submitted on:</strong> ${new Date(contactData.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from the Own The Digital contact form.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
};

const sendAutoReplyEmail = async (contactData) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: contactData.email,
    subject: 'Thank you for contacting Own The Digital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Thank You for Contacting Us
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p>Dear ${contactData.name},</p>
          
          <p>Thank you for reaching out to Own The Digital. We have received your message and our team will get back to you within 24-48 hours.</p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
            <h4 style="margin-top: 0; color: #007bff;">Your Message:</h4>
            <p style="margin: 0; font-style: italic;">${contactData.subject}</p>
          </div>
          
          <p>If you have any urgent questions, please don't hesitate to contact us directly at ${process.env.CONTACT_EMAIL}.</p>
          
          <p>Best regards,<br>
          The Own The Digital Team</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            © 2024 Own The Digital. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending auto-reply email:', error);
    return false;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#dc3545';
    case 'medium':
      return '#ffc107';
    case 'low':
      return '#28a745';
    default:
      return '#6c757d';
  }
};

module.exports = {
  sendContactEmail,
  sendAutoReplyEmail,
};
