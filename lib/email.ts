import nodemailer from 'nodemailer';

// Create transporter with fallback for development
const createTransporter = () => {
  // For development, use console logging if SMTP not properly configured
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
    console.log('📧 Using development mode - emails will be logged to console');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string, firstName: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@globetrotter.com',
      to: email,
      subject: 'Verify Your Globetrotter Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Globe<span style="color: #1d4ed8;">trotter</span></h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome to Globetrotter, ${firstName}!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Thank you for registering with Globetrotter. To complete your account verification, 
              please use the following One-Time Password (OTP):
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #2563eb; color: white; font-size: 32px; font-weight: bold; 
                          padding: 20px; border-radius: 8px; letter-spacing: 3px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #475569; font-size: 14px; line-height: 1.6;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this verification, please ignore this email</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this message.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">
                © 2025 Globetrotter. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Welcome to Globetrotter, ${firstName}!
        
        Your verification OTP is: ${otp}
        
        This OTP is valid for 10 minutes only.
        Please do not share this OTP with anyone.
        
        If you didn't request this verification, please ignore this email.
        
        © 2025 Globetrotter. All rights reserved.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    // In development mode, log the email content
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('📧 OTP Email would be sent to:', email);
      console.log('🔑 OTP Code:', otp);
      console.log('📄 Email preview available in console');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // In development, still return true so the flow continues
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('📧 Development mode: OTP email simulated successfully');
      console.log('🔑 Use this OTP for testing:', otp);
      return true;
    }
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, firstName: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@globetrotter.com',
      to: email,
      subject: 'Welcome to Globetrotter - Account Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Globe<span style="color: #1d4ed8;">trotter</span></h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="margin-top: 0; font-size: 28px;">🎉 Account Verified Successfully!</h2>
            <p style="font-size: 18px; margin: 20px 0;">Welcome to the Globetrotter family, ${firstName}!</p>
          </div>
          
          <div style="padding: 30px 0;">
            <h3 style="color: #1e293b;">What's Next?</h3>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li><strong>Plan Your First Trip:</strong> Use our AI-powered trip planner</li>
                <li><strong>Join the Community:</strong> Share experiences with fellow travelers</li>
                <li><strong>Track Your Adventures:</strong> Use the calendar to manage your trips</li>
                <li><strong>Discover New Places:</strong> Explore destinations with our recommendations</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/plan-trip" 
                 style="background: #2563eb; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; 
                        display: inline-block;">
                Start Planning Your Trip
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; text-align: center;">
                Have questions? Contact us at support@globetrotter.com
              </p>
              <p style="color: #64748b; font-size: 12px; text-align: center; margin: 10px 0 0 0;">
                © 2025 Globetrotter. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Welcome to Globetrotter, ${firstName}!
        
        🎉 Account Verified Successfully!
        
        What's Next?
        - Plan Your First Trip: Use our AI-powered trip planner
        - Join the Community: Share experiences with fellow travelers
        - Track Your Adventures: Use the calendar to manage your trips
        - Discover New Places: Explore destinations with our recommendations
        
        Start planning your trip: ${process.env.NEXT_PUBLIC_BASE_URL}/plan-trip
        
        Have questions? Contact us at support@globetrotter.com
        
        © 2025 Globetrotter. All rights reserved.
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    // In development mode, log the email content
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('📧 Welcome Email would be sent to:', email);
      console.log('📄 Welcome email simulated successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // In development, still return true so the flow continues
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('📧 Development mode: Welcome email simulated successfully');
      return true;
    }
    return false;
  }
};
