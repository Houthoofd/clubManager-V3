/**
 * courseRoutes.ts
 * Routes Express pour le module courses
 *
 * ORDERING NOTE: Express matches routes in definition order.
 * All fixed-path routes (/professors, /sessions, /sessions/generate, etc.)
 * MUST be declared before wildcard routes (/:id) to prevent shadowing.
 */

import { Router } from "express";
import { CourseController } from "../controllers/CourseController.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();
const ctrl = new CourseController();

// All course routes require authentication
router.use(authMiddleware);

// ==================== FIXED PATHS ====================
// These must appear before any /:id wildcard to prevent Express from
// matching e.g. GET /sessions against GET /:id (id = "sessions").

// --- Cours récurrents (list + create) ---
router.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.getCourseRecurrents(req as any, res),
);

// --- Professeurs (must be before /:id) ---
router.get(
  "/professors",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getProfessors(req as any, res),
);

router.post("/professors", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.createProfessor(req as any, res),
);

router.put("/professors/:id", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.updateProfessor(req as any, res),
);

router.get(
  "/professors/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getProfessorById(req as any, res),
);

router.delete("/professors/:id", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.deleteProfessor(req as any, res),
);

// --- Sessions list (must be before /:id) ---
router.get(
  "/sessions",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.getCourses(req as any, res),
);

// POST /sessions/generate must be declared before POST /sessions
// so that a body sent to /sessions/generate is not misrouted.
router.post("/sessions/generate", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.generateCourses(req as any, res),
);

router.post("/sessions", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.createCourse(req as any, res),
);

// GET /sessions/my-enrollments — must be before /sessions/:id catch-all
router.get(
  "/sessions/my-enrollments",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.getMyEnrollments(req as any, res),
);

// --- Sessions parameterised paths ---
// Deeper paths (/sessions/:id/inscriptions, /sessions/:id/presence)
// before the shallower /sessions/:id catch-all.
router.get(
  "/sessions/:id/inscriptions",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.getCourseInscriptions(req as any, res),
);

router.post(
  "/sessions/:id/inscriptions",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.createInscription(req as any, res),
);

router.patch(
  "/sessions/:id/presence",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.bulkUpdatePresence(req as any, res),
);

router.get(
  "/sessions/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.getCourseById(req as any, res),
);

// --- Inscription deletion (stands apart from /:id so no conflict) ---
router.delete(
  "/inscriptions/:inscriptionId",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => ctrl.deleteInscription(req as any, res),
);

// ==================== WILDCARD PATHS ====================
// These must come last — /:id would otherwise shadow every fixed
// path segment defined above.

router.post("/", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.createCourseRecurrent(req as any, res),
);

router.get(
  "/:id",
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER),
  (req, res) => ctrl.getCourseRecurrentById(req as any, res),
);

router.put("/:id", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.updateCourseRecurrent(req as any, res),
);

router.delete("/:id", requireRole(UserRole.ADMIN), (req, res) =>
  ctrl.deleteCourseRecurrent(req as any, res),
);

export default router;
