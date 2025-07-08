<img src="./public/freesend-icon.png" width=100>

# Freesend - Your email API using your infrastructure!

## Overview

Freesend is an email sending solution designed to work seamlessly with your own SMTP server. By leveraging the **"Bring Your Own Device" (BYOD)** approach, Freesend provides a hassle-free experience for sending emails through a simple HTTP API endpoint.

This open-source project ensures flexibility and control over your email sending infrastructure, making it an ideal choice for developers looking for a reliable and customizable email service.

## Purpose

Freesend aims to simplify the process of sending emails by providing an easy-to-use API that integrates with your **existing SMTP server**. Whether you're looking to send transactional emails, newsletters, or notifications, Freesend offers the tools and flexibility you need to manage your email communications efficiently.

## Key features

- **Simple HTTP API:** Easily send emails through a clean HTTP API with intuitive field names.
- **Flexible Sender Options:** Use separate `fromName` and `fromEmail` fields for clean, readable code.
- **File Attachments:** Send emails with multiple attachments using simple base64 encoding.
- **BYOD Support:** Utilize your own SMTP server, giving you full control over your email sending environment.
- **Open Source:** Freesend is fully open source, allowing you to customize and extend the project to meet your specific needs.
- **Ease of Use:** Designed to minimize the complexity of email sending, making it accessible for developers of all skill levels.
- **Multiple Format Support:** Send both HTML and plain text emails with optional attachments.

With Freesend, you can take control of your email sending processes without the hassle of managing a third-party email service. Explore the features and get started today!

## Usage
```js
const sendEmail = async () => {
  const url = "https://your-freesend-api-endpoint.com/api/send-email";
  const apiKey = "YOUR_API_KEY"; // Replace with your actual API key

  const emailData = {
    fromName: "Your Company", // (optional) Display name for the sender
    fromEmail: "hello@yourdomain.com", // Sender email address
    to: "recipient@email.com", // Receiver address
    subject: "Email sent from Freesend!", // Subject for the email
    html: "<h1>Yay! You got the email.</h1>", // (optional) HTML format of the email body
    text: "Yay! You got the email.", // (optional) Text format of the email body
    attachments: [ // (optional) Array of attachments
      {
        filename: "invoice.pdf", // Name of the file
        content: "JVBERi0xLjQKJcOkw7zDtsOmCjUgMCBvYmoKPDwK...", // Base64 encoded content
        contentType: "application/pdf" // (optional) MIME type
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

sendEmail();
```
