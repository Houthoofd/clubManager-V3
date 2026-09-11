import { Router } from "express";
import { AuditController } from "../AuditController.js";
// Assuming there might be an auth middleware, e.g., requireAuth, requireSuperAdmin
// import { requireAuth, requireRole } from "@/shared/middlewares/authMiddleware.js";
// import { UserRole } from "@clubmanager/types";

const router = Router();

// GET /api/superadmin/audit
// router.get("/", requireAuth, requireRole(UserRole.SUPER_ADMIN), AuditController.getAuditLogs);
router.get("/", AuditController.getAuditLogs);

export default router;
