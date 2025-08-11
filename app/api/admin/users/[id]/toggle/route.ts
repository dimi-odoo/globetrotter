import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { isActive } = await request.json();
    const userId = params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: 'firstName lastName email isActive' }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser 
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
