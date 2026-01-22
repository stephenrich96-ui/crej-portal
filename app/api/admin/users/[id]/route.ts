import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { isAdmin } from '@/lib/rbac';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || !isAdmin(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || !isAdmin(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only seichardson@crejllc.net can create/assign ADMIN role
    const canCreateAdmin = session.email === 'seichardson@crejllc.net';

    const { id } = await params;
    const body = await request.json();
    const { roles } = body;

    if (!Array.isArray(roles)) {
      return NextResponse.json({ error: 'Roles must be an array' }, { status: 400 });
    }

    // Check if trying to assign ADMIN role
    if (roles.includes('ADMIN') && !canCreateAdmin) {
      return NextResponse.json({ 
        error: 'Only the primary administrator can assign ADMIN role. Contact seichardson@crejllc.net for admin access.' 
      }, { status: 403 });
    }

    const validRoles = ['ADMIN', 'DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER', 'HRSS_STAFF', 'EPAS_STAFF', 'TRAINER'];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
      }
    }

    // Delete existing roles
    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Create new roles
    if (roles.length > 0) {
      await prisma.userRole.createMany({
        data: roles.map((role: string) => ({
          userId: id,
          role,
        })),
      });
    }

    await createAuditLog({
      actorId: session.id,
      action: 'USER_ROLES_UPDATED',
      entityType: 'User',
      entityId: id,
      metadata: JSON.stringify({ roles }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || !isAdmin(session.roles)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === session.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting other admins (optional safety check)
    const isUserAdmin = user.roles.some(r => r.role === 'ADMIN');
    if (isUserAdmin) {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Delete user roles first (cascade should handle this, but being explicit)
    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      actorId: session.id,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
      metadata: JSON.stringify({ 
        deletedUserEmail: user.email,
        deletedUserName: user.name,
      }),
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
