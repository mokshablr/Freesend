const { Freesend } = require('./dist');

// Initialize the client with local API
const freesend = new Freesend({
  apiKey: 'your-api-key-here',
  baseUrl: 'http://localhost:3000'
});

async function testLocalAPI() {
  try {
    console.log('🧪 Testing Freesend JavaScript SDK with local API...\n');
    
    // Test basic email first
    console.log('📧 Testing basic email...');
    const basicResponse = await freesend.sendEmail({
      fromName: 'Your Company',
      fromEmail: 'hello@yourdomain.com',
      to: 'recipient@example.com',
      subject: 'Test from Local API - Basic Email',
      html: '<h1>Hello from Local API!</h1><p>This is a test email sent using the local API.</p>',
      text: 'Hello from Local API! This is a test email sent using the local API.'
    });
    
    console.log('✅ Basic email sent successfully:', basicResponse.message);
    
    // Test with attachment
    console.log('\n📎 Testing email with attachment...');
    
    // Create a simple test file content
    const testContent = "This is a test attachment file for the local API test. If you can see this decoded content, the base64 fix is working correctly!";
    const base64Content = Buffer.from(testContent, 'utf8').toString('base64');
    
    const attachmentResponse = await freesend.sendEmail({
      fromName: 'Your Company',
      fromEmail: 'hello@yourdomain.com',
      to: 'recipient@example.com',
      subject: 'Test from Local API - With Attachment',
      html: '<h1>Hello from Local API!</h1><p>This is a test email with attachment sent using the local API.</p><p>Check the attached file!</p>',
      text: 'Hello from Local API! This is a test email with attachment sent using the local API. Check the attached file!',
      attachments: [
        {
          filename: 'test_local_api.txt',
          content: base64Content,
          contentType: 'text/plain'
        }
      ]
    });
    
    console.log('✅ Email with attachment sent successfully:', attachmentResponse.message);
    console.log('\n📧 Check your email inbox for both test messages!');
    console.log('📎 The attachment should now contain the decoded text, not base64!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the local API is running on localhost:3000');
    }
  }
}

testLocalAPI(); 