import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Admin credentials (in production, store in database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // In production, use bcrypt hash
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Trim whitespace from inputs
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();
    
    console.log('Admin login attempt:', { username: trimmedUsername, password: trimmedPassword });
    console.log('Expected credentials:', ADMIN_CREDENTIALS);

    // Validate credentials
    if (trimmedUsername !== ADMIN_CREDENTIALS.username || trimmedPassword !== ADMIN_CREDENTIALS.password) {
      console.log('Credentials mismatch');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Credentials valid, generating token');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: 'admin', 
        role: 'admin',
        username: trimmedUsername
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      admin: {
        username: trimmedUsername,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
