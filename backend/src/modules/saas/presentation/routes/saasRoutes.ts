import { Router } from "express";
import { SaasController } from "../controllers/SaasController.js";

const router = Router();
const saasController = new SaasController();

router.get("/", saasController.listModules);
router.post("/", saasController.createModule);
router.patch("/:id", saasController.updateModule);
router.post("/:id/changelog", saasController.publishChangelog);

export default router;
