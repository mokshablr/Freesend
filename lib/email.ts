import { EmailConfig } from "next-auth/providers/email";

import { siteConfig } from "@/config/site";

import { getUserByEmail } from "./user";

//import { MagicLinkEmail } from "@/emails/magic-link-email";
//import { Resend } from "resend";
//import { env } from "@/env.mjs";
//export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const user = await getUserByEmail(identifier);
    //if (!user || !user.name) return;

    const userVerified = user?.emailVerified ? true : false;
    const authSubject = userVerified
      ? `Sign-in link for ${siteConfig.name}`
      : "Activate your account";

    //-----
    // Instead of Resend the grovv.app SMTP sewrver in CPanel is used.
    //-----

    try {
      const emailHTML = generateMagicLinkEmail(url);

      const data = new URLSearchParams();
      data.append("to", identifier);
      data.append("subject", authSubject);
      data.append("message", emailHTML);

      console.log("Sending Magic Email: ", identifier, authSubject);

      const response = await fetch("https://httpmailer.grovv.app/mailer.php", {
        method: "POST",
        body: data,
      });

      // Check if the response is OK
      if (response.ok) {
        const result = await response.text();
        console.log("Email sent successfully:", result);
      } else {
        console.error("Failed to send email:", response.statusText);
        throw new Error(response.statusText);
      }

      /*
      // Customize email content
      const mailOptions = {
        from: provider.from,
        to: identifier,
        subject: authSubject,
        html: MagicLinkEmail({
          firstName: user?.name as string,
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        })
      };

      const { data, error } = await resend.emails.send({
        from: provider.from,
        to:
          process.env.NODE_ENV === "development"
            ? "delivered@resend.dev"
            : identifier,
        subject: authSubject,
        react: MagicLinkEmail({
          firstName: user?.name as string,
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        }),
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      console.log("DATA ", data)
      console.log("ERROR ", error)

      if (error || !data) {
        throw new Error(error?.message);
      }
      */

      // console.log(data)
    } catch (error) {
      throw new Error("Failed to send verification email.");
    }
  };

function generateMagicLinkEmail(magicLink: string): string {
  return `
    <html>
    <head>
        <title>Grovv.app SignIn</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f7;
                color: #51545e;
                margin: 0;
                padding: 0;
            }
            .email-wrapper {
                width: 100%;
                background-color: #f4f4f7;
                padding: 20px;
            }
            .email-content {
                max-width: 600px;
                background-color: #ffffff;
                margin: 0 auto;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #ddd;
            }
            .email-header h1 {
                color: #333;
                font-size: 24px;
            }
            .email-body {
                padding: 20px 0;
                text-align: center;
            }
            .email-body p {
                font-size: 16px;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }
            .email-footer {
                padding-top: 20px;
                text-align: center;
                font-size: 12px;
                color: #888;
            }
            .btn {
                display: inline-block;
                padding: 12px 25px;
                font-size: 16px;
                background-color: #EEEEEE;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .btn:hover {
                background-color: #DDDDDD;
            }
            @media only screen and (max-width: 600px) {
                .email-content {
                    padding: 15px;
                }
                .email-header h1 {
                    font-size: 20px;
                }
                .btn {
                    font-size: 14px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-content">
                <div class="email-header">
                    <h2>Sign In to Grovv</h2>
                </div>

                <div class="email-body">
                    <p>Click the button below to sign in to your account.</p>
                    <p><a href="${magicLink}" class="btn">Sign In</a></p>
                    <p>If you did not request this email, you can safely ignore it.</p>
                </div>

                <div class="email-footer">
                    <p>&copy; 2024 Grovv.app. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export async function sendInviteEmail(user, tenant) {
  if (!user || !user.email) {
    console.error("Invite email failed because email address is empty");
    return false;
  }

  var authSubject = "You are invited to Grovv.app";
  if (tenant && tenant.name) {
    authSubject = tenant.name + " invited you to Grovv.app";
  }

  try {
    const data = new URLSearchParams();
    data.append("to", user.email);
    data.append("subject", authSubject);
    data.append("message", generateInviteEmail(user.email, tenant?.name));

    console.log("Sending Invite Email: ", user.email, authSubject);

    const response = await fetch("https://httpmailer.grovv.app/mailer.php", {
      method: "POST",
      body: data,
    });

    // Check if the response is OK
    if (response.ok) {
      const result = await response.text();
      console.log("Email sent successfully:", result);
    } else {
      console.error("Failed to send email:", response.statusText);
      throw new Error(response.statusText);
    }
  } catch (error) {
    throw new Error("Failed to send invite email.");
  }
}

function generateInviteEmail(email, tenantName): string {
  var welcome = "You are invited to Grovv.app";
  if (tenantName) {
    welcome = tenantName + " invited you to Grovv.app";
  }

  return `
      <html>
      <head>
          <title>Welcome to Grovv.app</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f7;
                  color: #51545e;
                  margin: 0;
                  padding: 0;
              }
              .email-wrapper {
                  width: 100%;
                  background-color: #f4f4f7;
                  padding: 20px;
              }
              .email-content {
                  max-width: 600px;
                  background-color: #ffffff;
                  margin: 0 auto;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                  text-align: center;
                  padding-bottom: 20px;
                  border-bottom: 1px solid #ddd;
              }
              .email-header h1 {
                  color: #333;
                  font-size: 24px;
              }
              .email-body {
                  padding: 20px 0;
                  text-align: center;
              }
              .email-body p {
                  font-size: 16px;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
              }
              .email-footer {
                  padding-top: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #888;
              }
              .btn {
                  display: inline-block;
                  padding: 12px 25px;
                  font-size: 16px;
                  background-color: #EEEEEE;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
              }
              .btn:hover {
                  background-color: #DDDDDD;
              }
              @media only screen and (max-width: 600px) {
                  .email-content {
                      padding: 15px;
                  }
                  .email-header h1 {
                      font-size: 20px;
                  }
                  .btn {
                      font-size: 14px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-wrapper">
              <div class="email-content">
                  <div class="email-header">
                      <h2>${welcome}</h2>
                  </div>
  
                  <div class="email-body">
                      <p>Grovv.app helps companies manage their sales pipeline effectively.</p>
                      <p>Click the button below to sign in to your account and remember to use your email '${email}'.</p>
                      <p><a href="https://grovv.app/login" class="btn">Sign In</a></p>
                      <p>If you are not expecting this email, please contact your company who initiated the invite. 
                      If this email came to you by mistake by someone, you can safely ignore it.</p>
                  </div>
  
                  <div class="email-footer">
                      <p>&copy; 2024 Grovv.app. All rights reserved.</p>
                  </div>
              </div>
          </div>
      </body>
      </html>
      `;
}
