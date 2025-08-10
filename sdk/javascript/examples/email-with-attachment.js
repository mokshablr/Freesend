const { Freesend } = require('../dist');
const fs = require('fs');

// Initialize the client
const freesend = new Freesend({
  apiKey: process.env.FREESEND_API_KEY || 'your-api-key-here'
});

async function sendEmailWithAttachment() {
  try {
    // Read and encode file (example with a text file)
    const fileContent = fs.readFileSync('./example.txt', { encoding: 'base64' });
    
    const response = await freesend.sendEmail({
      fromName: 'Your Company',
      fromEmail: 'billing@yourdomain.com',
      to: 'customer@example.com',
      subject: 'Your invoice is ready',
      html: '<h1>Invoice Attached</h1><p>Please find your invoice attached to this email.</p>',
      text: 'Invoice attached. Please find your invoice attached to this email.',
      attachments: [
        {
          filename: 'invoice.pdf',
          content: fileContent,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('Email sent successfully:', response.message);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}

sendEmailWithAttachment(); 