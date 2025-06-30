// Email Templates for MP Books & Stationery
// Centralized template system for consistent branding

const baseTemplate = (content, title = 'MP Books & Stationery') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f8f9fa; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .info-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .contact-info { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">MP Books & Stationery</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${title}</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p style="margin: 0;">© 2024 MP Books & Stationery. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// Password Reset Email Template
export const passwordResetTemplate = (name, resetUrl) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      We received a request to reset your password for your MP Books & Stationery account.
    </p>
    
    <div class="info-box">
      <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
        Click the button below to reset your password. This link will expire in 10 minutes for security reasons.
      </p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    </p>
    
    <div class="contact-info">
      <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
      <p style="color: #555; margin: 5px 0;">
        <strong>Phone:</strong> 985-5038599 / 056-534129<br>
        <strong>Address:</strong> MCGP+37F, Bharatpur 44200<br>
        <strong>Hours:</strong> 6:00 AM - 9:00 PM Daily
      </p>
    </div>
    
    <p style="color: #555; line-height: 1.6;">
      Best regards,<br>
      <strong>The MP Books & Stationery Team</strong>
    </p>
  `;
  
  return baseTemplate(content, 'Password Reset Request');
};

// Email Verification Template
export const emailVerificationTemplate = (name, verificationUrl) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Welcome to MP Books & Stationery! Thank you for creating an account with us.
    </p>
    
    <div class="info-box">
      <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
        To complete your registration and verify your email address, please click the button below:
      </p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p style="color: #555; line-height: 1.6; margin-top: 20px; font-size: 14px;">
        <strong>Or copy this verification code:</strong><br>
        <span style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; letter-spacing: 2px;">
          ${verificationUrl.split('code=')[1]?.split('&')[0] || 'CODE'}
        </span>
      </p>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Once verified, you'll have full access to your account and can start shopping with us!
    </p>
    
    <div class="contact-info">
      <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
      <p style="color: #555; margin: 5px 0;">
        <strong>Phone:</strong> 985-5038599 / 056-534129<br>
        <strong>Address:</strong> MCGP+37F, Bharatpur 44200<br>
        <strong>Hours:</strong> 6:00 AM - 9:00 PM Daily
      </p>
    </div>
    
    <p style="color: #555; line-height: 1.6;">
      Best regards,<br>
      <strong>The MP Books & Stationery Team</strong>
    </p>
  `;
  
  return baseTemplate(content, 'Email Verification');
};

// Order Confirmation Template
export const orderConfirmationTemplate = (name, orderNumber, orderDetails, totalAmount) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Thank you for your order! We're excited to confirm that we've received your order and it's being processed.
    </p>
    
    <div class="info-box">
      <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
      <p style="color: #555; margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
      <p style="color: #555; margin: 5px 0;"><strong>Total Amount:</strong> ₹${totalAmount}</p>
      <p style="color: #555; margin: 5px 0;"><strong>Status:</strong> Processing</p>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      We'll send you another email once your order ships with tracking information.
    </p>
    
    <div class="contact-info">
      <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
      <p style="color: #555; margin: 5px 0;">
        <strong>Phone:</strong> 985-5038599 / 056-534129<br>
        <strong>Address:</strong> MCGP+37F, Bharatpur 44200<br>
        <strong>Hours:</strong> 6:00 AM - 9:00 PM Daily
      </p>
    </div>
    
    <p style="color: #555; line-height: 1.6;">
      Best regards,<br>
      <strong>The MP Books & Stationery Team</strong>
    </p>
  `;
  
  return baseTemplate(content, 'Order Confirmation');
};

// Message Reply Template (existing one, but using the new system)
export const messageReplyTemplate = (name, originalMessage, replyMessage) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Thank you for contacting MP Books & Stationery. We have received your message and are pleased to provide you with a response.
    </p>
    
    <div class="info-box">
      <h3 style="color: #333; margin-top: 0;">Your Original Message:</h3>
      <p style="color: #666; font-style: italic; margin-bottom: 20px;">"${originalMessage}"</p>
      
      <h3 style="color: #333;">Our Response:</h3>
      <p style="color: #333; line-height: 1.6;">${replyMessage}</p>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      If you have any further questions or need additional assistance, please don't hesitate to contact us again.
    </p>
    
    <div class="contact-info">
      <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
      <p style="color: #555; margin: 5px 0;">
        <strong>Phone:</strong> 985-5038599 / 056-534129<br>
        <strong>Address:</strong> MCGP+37F, Bharatpur 44200<br>
        <strong>Hours:</strong> 6:00 AM - 9:00 PM Daily
      </p>
    </div>
    
    <p style="color: #555; line-height: 1.6;">
      Best regards,<br>
      <strong>The MP Books & Stationery Team</strong>
    </p>
  `;
  
  return baseTemplate(content, 'Response to your inquiry');
};

// Welcome Email Template
export const welcomeEmailTemplate = (name) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Welcome ${name}!</h2>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Welcome to MP Books & Stationery! We're thrilled to have you as part of our community.
    </p>
    
    <div class="info-box">
      <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
      <ul style="color: #555; line-height: 1.6;">
        <li>Browse our extensive collection of books and stationery</li>
        <li>Create your wishlist with your favorite items</li>
        <li>Enjoy fast and secure checkout</li>
        <li>Track your orders in real-time</li>
      </ul>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      As a registered member, you'll receive exclusive offers, early access to sales, and personalized recommendations.
    </p>
    
    <div class="contact-info">
      <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
      <p style="color: #555; margin: 5px 0;">
        <strong>Phone:</strong> 985-5038599 / 056-534129<br>
        <strong>Address:</strong> MCGP+37F, Bharatpur 44200<br>
        <strong>Hours:</strong> 6:00 AM - 9:00 PM Daily
      </p>
    </div>
    
    <p style="color: #555; line-height: 1.6;">
      Best regards,<br>
      <strong>The MP Books & Stationery Team</strong>
    </p>
  `;
  
  return baseTemplate(content, 'Welcome to MP Books & Stationery');
}; 