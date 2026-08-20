import type { NextFunction, Request, Response } from "express";
import { AuditLog } from "../models/audit-log.model";

export function auditRequest(action: string, category: string, entityType?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      void AuditLog.create({
        actorId: req.user?._id,
        actorEmail: req.user?.email,
        action,
        category,
        outcome: "success",
        description: `${req.method} ${req.originalUrl}`,
        entityType,
        entityId: (req.params.id || req.params.userId || req.params.kycId || "") as string,
        metadata: { params: req.params },
        ipAddress: req.ip,
        userAgent: req.get("user-agent") || "",
        source: "admin",
      }).catch(() => undefined);
    });
    next();
  };
}
