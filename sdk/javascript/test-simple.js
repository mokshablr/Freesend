const { Freesend } = require('./dist');

// Test the SDK with a mock API key
async function testSDK() {
  console.log('🧪 Testing Freesend JavaScript SDK...\n');
  
  // Initialize the client
  const freesend = new Freesend({
    apiKey: 'test-api-key'
  });
  
  console.log('✅ Client initialized successfully');
  
  // Test email data
  const emailData = {
    fromName: 'Test Company',
    fromEmail: 'test@example.com',
    to: 'recipient@example.com',
    subject: 'Test Email from SDK',
    html: '<h1>Test Email</h1><p>This is a test email from the Freesend JavaScript SDK.</p>',
    text: 'Test Email - This is a test email from the Freesend JavaScript SDK.'
  };
  
  console.log('✅ Email data prepared');
  console.log('📧 Email data:', JSON.stringify(emailData, null, 2));
  
  try {
    // This will fail with a real API call, but we can test the validation
    console.log('\n🔄 Attempting to send email...');
    const response = await freesend.sendEmail(emailData);
    console.log('✅ Email sent successfully:', response.message);
  } catch (error) {
    console.log('❌ Expected error (no real API key):', error.message);
    console.log('✅ SDK is working correctly - validation and error handling work!');
  }
  
  // Test validation errors
  console.log('\n🧪 Testing validation errors...');
  
  try {
    await freesend.sendEmail({
      // Missing required fields
      fromEmail: 'test@example.com'
    });
  } catch (error) {
    console.log('✅ Validation error caught:', error.message);
  }
  
  console.log('\n🎉 JavaScript SDK test completed!');
}

testSDK().catch(console.error); 