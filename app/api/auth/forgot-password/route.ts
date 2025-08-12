import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Check if SMTP is configured
const isSMTPConfigured = process.env.SMTP_HOST && 
                        process.env.SMTP_PORT && 
                        process.env.SMTP_USER && 
                        process.env.SMTP_PASS;

const transporter = isSMTPConfigured ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}) : null;

// GET method for debugging - check tokens in database
export async function GET() {
  try {
    await dbConnect();
    
    // Find all users with reset tokens
    const usersWithTokens = await User.find({
      resetPasswordToken: { $exists: true, $ne: null }
    }).select('email resetPasswordToken resetPasswordExpires');

    return NextResponse.json({
      usersWithTokens: usersWithTokens.map(user => ({
        email: user.email,
        token: user.resetPasswordToken,
        expires: user.resetPasswordExpires,
        isValid: user.resetPasswordExpires > new Date()
      }))
    });
  } catch (error) {
    console.error('GET forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to get tokens' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();

    console.log('Forgot password request for email:', email); // Debug log

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with email:', email); // Debug log
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    console.log('User found:', user.email); // Debug log

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    console.log('Generated token:', resetToken); // Debug log
    console.log('Token expiry:', resetTokenExpiry); // Debug log

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    console.log('Token saved to database'); // Debug log

    // Check if SMTP is configured
    if (!isSMTPConfigured) {
      console.log('SMTP not configured, returning success without sending email'); // Debug log
      return NextResponse.json({ 
        message: 'Password reset email sent (SMTP not configured)',
        token: resetToken // For testing purposes
      });
    }

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    console.log('Reset URL:', resetUrl); // Debug log

    if (!transporter) {
      throw new Error('SMTP transporter not configured');
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log('Email sent successfully'); // Debug log

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}