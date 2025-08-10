const { Freesend } = require('../dist');

// Initialize the client
const freesend = new Freesend({
  apiKey: process.env.FREESEND_API_KEY || 'your-api-key-here'
});

async function sendBasicEmail() {
  try {
    const response = await freesend.sendEmail({
      fromName: 'Your Company',
      fromEmail: 'hello@yourdomain.com',
      to: 'recipient@example.com',
      subject: 'Hello from Freesend!',
      html: '<h1>Welcome!</h1><p>This email was sent using the Freesend JavaScript SDK.</p>',
      text: 'Welcome! This email was sent using the Freesend JavaScript SDK.'
    });

    console.log('Email sent successfully:', response.message);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}

sendBasicEmail(); 