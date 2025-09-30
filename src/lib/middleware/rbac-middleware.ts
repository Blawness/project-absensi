import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Permission, hasPermission } from '@/lib/rbac';

interface RBACOptions {
  requiredPermissions: Permission[];
  requireAll?: boolean; // true = AND logic, false = OR logic
}

export async function rbacMiddleware(
  request: NextRequest,
  options: RBACOptions
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const { requiredPermissions, requireAll = false } = options;

  if (requiredPermissions.length === 0) {
    return null; // No permissions required
  }

  const userHasPermission = requireAll
    ? requiredPermissions.every(permission => hasPermission(session.user.role, permission))
    : requiredPermissions.some(permission => hasPermission(session.user.role, permission));

  if (!userHasPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null; // Allow access
}

export async function requirePermissions(
  request: NextRequest,
  permissions: Permission[],
  requireAll: boolean = false
): Promise<NextResponse | null> {
  return rbacMiddleware(request, { requiredPermissions: permissions, requireAll });
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  return requirePermissions(request, [Permission.SYSTEM_ADMIN]);
}

export async function requireManagerOrAdmin(request: NextRequest): Promise<NextResponse | null> {
  return requirePermissions(request, [Permission.SYSTEM_ADMIN], false);
}

export async function requireAnyRole(request: NextRequest): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return null; // Any authenticated user is allowed
}



