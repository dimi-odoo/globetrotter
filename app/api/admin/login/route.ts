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
    
    console.log('Admin login attempt:', { username, password });
    console.log('Expected credentials:', ADMIN_CREDENTIALS);

    // Validate credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      console.log('Credentials mismatch');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Credentials valid, generating token');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: 'admin', 
        role: 'admin',
        username: username
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      admin: {
        username,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
