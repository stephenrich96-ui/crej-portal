import { prisma } from './db';

interface CreateAuditLogParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: typeof params.metadata === 'string' 
          ? params.metadata 
          : JSON.stringify(params.metadata || {}),
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break the app
    console.error('Failed to create audit log:', error);
  }
}
