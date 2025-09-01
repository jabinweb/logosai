import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only existing admins can change roles (super admin functionality)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can change user roles' }, { status: 403 });
    }

    const { email, role } = await request.json();

    // Validate input
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be user, moderator, or admin' }, { status: 400 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });

    console.log(`Role Change - Admin: ${session.user.email}, Target: ${email}, New Role: ${role}`);

    return NextResponse.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      user: updatedUser
    });

  } catch (error: unknown) {
    console.error('Error updating user role:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
