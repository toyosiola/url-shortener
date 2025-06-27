// Email templates for various authentication flows

interface EmailTemplate {
  subject: string;
  text: (params: { [key: string]: string }) => string;
  html: (params: { [key: string]: string }) => string;
}

// Common styling variables
const styles = {
  colors: {
    primary: "#0070f3",
    text: "#333333",
    background: "#ffffff",
    border: "#eaeaea",
  },
  fonts: {
    main: "Arial, sans-serif",
  },
};

// Signup verification email template
export const signupVerification: EmailTemplate = {
  subject: "Verify Your Email",
  text: ({ confirmLink }) => `
Welcome to URL Shortener!

Thank you for creating an account with us. To complete your registration, please verify your email address by clicking the button below:
${confirmLink}

This link will expire in 15 minutes.

If you didn't create an account, you can safely ignore this email.

Best regards,
Shortener IT Team
  `,
  html: ({ confirmLink }) => `
    <div style="
      font-family: ${styles.fonts.main};
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: ${styles.colors.background};
      border: 1px solid ${styles.colors.border};
      border-radius: 5px;
    ">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: ${styles.colors.primary}; margin: 0;">Welcome to URL Shortener!</h2>
      </div>
      
      <div style="color: ${styles.colors.text}; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
        <p>Thank you for creating an account with us. To complete your registration, please verify your email address by clicking the button below:</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${confirmLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: ${styles.colors.primary};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Verify Email Address</a>
      </div>

      <div style="color: ${styles.colors.text}; font-size: 14px; line-height: 20px;">
        <p>This will expire in <span style="font-weight: bold;">15 minutes</span>. If you didn't create an account, you can safely ignore this email.</p>
      </div>

      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid ${styles.colors.border};
        color: ${styles.colors.text};
        font-size: 14px;
        text-align: center;
      ">
        <p>Best regards,<br>Shortener IT Team</p>
      </div>
    </div>
  `,
};
