import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to verify admin JWT token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    return decoded.role === 'admin' ? decoded : null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true,
      admin: {
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
