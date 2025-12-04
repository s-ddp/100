import { NextFunction, Request, Response } from "express";

export type Role = "admin" | "manager" | "user";

function resolveUserRole(req: Request): Role | null {
  const anyReq = req as any;
  if (anyReq.user?.role) return anyReq.user.role;

  const headerRole = (req.headers["x-user-role"] || req.headers["x-role"]) as string | undefined;
  if (headerRole && ["admin", "manager", "user"].includes(headerRole)) {
    anyReq.user = anyReq.user || {};
    anyReq.user.role = headerRole;
    return headerRole as Role;
  }

  return null;
}

export function requireAuth(_req: Request, _res: Response, next: NextFunction) {
  next();
}

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = resolveUserRole(req);
    if (!role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
