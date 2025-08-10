const { Freesend } = require('./dist');

// Initialize the client with local API
const freesend = new Freesend({
  apiKey: 'your-api-key-here',
  baseUrl: 'http://localhost:3000'
});

async function testAttachmentOnly() {
  try {
    console.log('🧪 Testing Freesend JavaScript SDK - Attachment Only...\n');
    
    // Create test file content
    const testContent = "This is a test attachment file for the local API test. If you can see this decoded content, the base64 fix is working correctly!";
    const base64Content = Buffer.from(testContent, 'utf8').toString('base64');
    
    console.log('📎 Sending email with attachment...');
    console.log('📄 Original content:', testContent);
    console.log('🔢 Base64 content length:', base64Content.length);
    
    const response = await freesend.sendEmail({
      fromName: 'Your Company',
      fromEmail: 'hello@yourdomain.com',
      to: 'recipient@example.com',
      subject: 'Test Attachment Fix - Local API',
      html: '<h1>Attachment Test</h1><p>This email tests the base64 attachment fix.</p><p>The attached file should contain readable text, not base64 encoded content.</p>',
      text: 'Attachment Test - This email tests the base64 attachment fix. The attached file should contain readable text, not base64 encoded content.',
      attachments: [
        {
          filename: 'test_attachment_fix.txt',
          content: base64Content,
          contentType: 'text/plain'
        }
      ]
    });
    
    console.log('✅ Email with attachment sent successfully:', response.message);
    console.log('\n📧 Check your email inbox!');
    console.log('📎 The attachment should contain: "This is a test attachment file for the local API test. If you can see this decoded content, the base64 fix is working correctly!"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the local API is running on localhost:3000');
    }
  }
}

testAttachmentOnly(); 