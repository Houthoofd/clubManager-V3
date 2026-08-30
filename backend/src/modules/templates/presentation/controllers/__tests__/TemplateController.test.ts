import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { TemplateController } from "../TemplateController";

// Import UseCases
import { GetTemplateTypesUseCase } from "../../../application/use-cases/GetTemplateTypesUseCase";
import { CreateTemplateTypeUseCase } from "../../../application/use-cases/CreateTemplateTypeUseCase";
import { UpdateTemplateTypeUseCase } from "../../../application/use-cases/UpdateTemplateTypeUseCase";
import { DeleteTemplateTypeUseCase } from "../../../application/use-cases/DeleteTemplateTypeUseCase";
import { GetTemplatesUseCase } from "../../../application/use-cases/GetTemplatesUseCase";
import { GetTemplateByIdUseCase } from "../../../application/use-cases/GetTemplateByIdUseCase";
import { CreateTemplateUseCase } from "../../../application/use-cases/CreateTemplateUseCase";
import { UpdateTemplateUseCase } from "../../../application/use-cases/UpdateTemplateUseCase";
import { DeleteTemplateUseCase } from "../../../application/use-cases/DeleteTemplateUseCase";
import { ToggleTemplateUseCase } from "../../../application/use-cases/ToggleTemplateUseCase";
import { PreviewTemplateUseCase } from "../../../application/use-cases/PreviewTemplateUseCase";
import { SendFromTemplateUseCase } from "../../../application/use-cases/SendFromTemplateUseCase";

const controller = new TemplateController();

describe("TemplateController", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { userId: 1, role_app: "admin" } as any,
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  // 1. getTypes
  describe("getTypes", () => {
    it("devrait retourner 200 et la liste des types", async () => {
      const types = [{ id: 1, nom: "Type 1" }];
      jest.spyOn(GetTemplateTypesUseCase.prototype, "execute").mockResolvedValueOnce(types as any);

      await controller.getTypes(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Types de templates récupérés", data: types });
    });

    it("devrait retourner 500 si le use case échoue", async () => {
      jest.spyOn(GetTemplateTypesUseCase.prototype, "execute").mockRejectedValueOnce(new Error("DB error"));

      await controller.getTypes(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "DB error", error: "INTERNAL_ERROR" });
    });
  });

  // 2. createType
  describe("createType", () => {
    it("devrait retourner 201 et créer le type", async () => {
      req.body = { nom: "Type", description: "Desc" };
      const type = { id: 1, nom: "Type", description: "Desc" };
      jest.spyOn(CreateTemplateTypeUseCase.prototype, "execute").mockResolvedValueOnce(type as any);

      await controller.createType(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Type de template créé avec succès", data: type });
    });

    it("devrait retourner 400 si erreur métier", async () => {
      req.body = { nom: "" };
      jest.spyOn(CreateTemplateTypeUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Le nom du type est requis"));

      await controller.createType(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Le nom du type est requis", error: "BAD_REQUEST" });
    });
  });

  // 3. updateType
  describe("updateType", () => {
    it("devrait retourner 200 et mettre à jour le type", async () => {
      req.params = { id: "1" };
      req.body = { nom: "Type" };
      jest.spyOn(UpdateTemplateTypeUseCase.prototype, "execute").mockResolvedValueOnce(undefined);

      await controller.updateType(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Type de template mis à jour" });
    });

    it("devrait retourner 400 pour ID invalide", async () => {
      req.params = { id: "abc" };

      await controller.updateType(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "ID de type invalide", error: "INVALID_ID" });
    });

    it("devrait retourner 404 si introuvable", async () => {
      req.params = { id: "1" };
      req.body = { nom: "Type" };
      jest.spyOn(UpdateTemplateTypeUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Type de template introuvable"));

      await controller.updateType(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Type de template introuvable", error: "NOT_FOUND" });
    });
  });

  // 4. deleteType
  describe("deleteType", () => {
    it("devrait retourner 200 et supprimer le type", async () => {
      req.params = { id: "1" };
      jest.spyOn(DeleteTemplateTypeUseCase.prototype, "execute").mockResolvedValueOnce(undefined);

      await controller.deleteType(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Type de template supprimé" });
    });

    it("devrait retourner 400 pour ID invalide", async () => {
      req.params = { id: "-1" };

      await controller.deleteType(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait retourner 400 si templates rattachés", async () => {
      req.params = { id: "1" };
      jest.spyOn(DeleteTemplateTypeUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Impossible de supprimer ce type : 1 template(s) actif(s) y sont rattachés."));

      await controller.deleteType(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // 5. getTemplates
  describe("getTemplates", () => {
    it("devrait retourner 200 avec les templates", async () => {
      req.query = { type_id: "1", actif: "true" };
      const templates = [{ id: 1, type_id: 1 }];
      const spy = jest.spyOn(GetTemplatesUseCase.prototype, "execute").mockResolvedValueOnce(templates as any);

      await controller.getTemplates(req as AuthRequest, res as Response);

      expect(spy).toHaveBeenCalledWith({ type_id: 1, actif: true });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Templates récupérés", data: templates });
    });

    it("devrait gérer les erreurs internes", async () => {
      jest.spyOn(GetTemplatesUseCase.prototype, "execute").mockRejectedValueOnce(new Error("DB error"));

      await controller.getTemplates(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // 6. getTemplate
  describe("getTemplate", () => {
    it("devrait retourner 200 avec le template", async () => {
      req.params = { id: "1" };
      const template = { id: 1 };
      jest.spyOn(GetTemplateByIdUseCase.prototype, "execute").mockResolvedValueOnce(template as any);

      await controller.getTemplate(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Template récupéré", data: template });
    });

    it("devrait retourner 400 pour ID invalide", async () => {
      req.params = { id: "abc" };

      await controller.getTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait retourner 404 si non trouvé", async () => {
      req.params = { id: "1" };
      jest.spyOn(GetTemplateByIdUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Template introuvable"));

      await controller.getTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // 7. createTemplate
  describe("createTemplate", () => {
    it("devrait retourner 201 avec le template créé", async () => {
      req.body = { type_id: "1", titre: "Titre", contenu: "Contenu", actif: true };
      const template = { id: 1 };
      jest.spyOn(CreateTemplateUseCase.prototype, "execute").mockResolvedValueOnce(template as any);

      await controller.createTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Template créé avec succès", data: template });
    });

    it("devrait retourner 400 si l'erreur métier survient", async () => {
      req.body = { type_id: "1", titre: "" };
      jest.spyOn(CreateTemplateUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Le titre du template est requis"));

      await controller.createTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // 8. updateTemplate
  describe("updateTemplate", () => {
    it("devrait retourner 200 avec le template mis à jour", async () => {
      req.params = { id: "1" };
      req.body = { titre: "New" };
      jest.spyOn(UpdateTemplateUseCase.prototype, "execute").mockResolvedValueOnce(undefined);
      jest.spyOn(GetTemplateByIdUseCase.prototype, "execute").mockResolvedValueOnce({ id: 1, titre: "New" } as any);

      await controller.updateTemplate(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Template mis à jour", data: { id: 1, titre: "New" } });
    });

    it("devrait retourner 400 pour ID invalide", async () => {
      req.params = { id: "abc" };

      await controller.updateTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait retourner 404 si introuvable", async () => {
      req.params = { id: "1" };
      req.body = { titre: "New" };
      jest.spyOn(UpdateTemplateUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Template introuvable"));

      await controller.updateTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // 9. deleteTemplate
  describe("deleteTemplate", () => {
    it("devrait retourner 200 pour un succès", async () => {
      req.params = { id: "1" };
      jest.spyOn(DeleteTemplateUseCase.prototype, "execute").mockResolvedValueOnce(undefined);

      await controller.deleteTemplate(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Template supprimé" });
    });

    it("devrait retourner 400 pour un ID invalide", async () => {
      req.params = { id: "0" };

      await controller.deleteTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait retourner 500 pour autre erreur", async () => {
      req.params = { id: "1" };
      jest.spyOn(DeleteTemplateUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Erreur DB"));

      await controller.deleteTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // 10. toggleTemplate
  describe("toggleTemplate", () => {
    it("devrait retourner 200 en forçant la valeur", async () => {
      req.params = { id: "1" };
      req.body = { actif: false };
      jest.spyOn(ToggleTemplateUseCase.prototype, "execute").mockResolvedValueOnce(undefined);

      await controller.toggleTemplate(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Template désactivé", data: { actif: false } });
    });

    it("devrait retourner 200 en lisant la valeur précédente (flip)", async () => {
      req.params = { id: "1" };
      jest.spyOn(GetTemplateByIdUseCase.prototype, "execute").mockResolvedValueOnce({ id: 1, actif: false } as any);
      jest.spyOn(ToggleTemplateUseCase.prototype, "execute").mockResolvedValueOnce(undefined);

      await controller.toggleTemplate(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Template activé", data: { actif: true } });
    });

    it("devrait retourner 400 pour un ID invalide", async () => {
      req.params = { id: "0" };

      await controller.toggleTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait gérer une erreur", async () => {
      req.params = { id: "1" };
      jest.spyOn(GetTemplateByIdUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Template introuvable"));

      await controller.toggleTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // 11. previewTemplate
  describe("previewTemplate", () => {
    it("devrait retourner 200", async () => {
      req.params = { id: "1" };
      req.body = { manual_vars: { a: "b" } };
      jest.spyOn(PreviewTemplateUseCase.prototype, "execute").mockResolvedValueOnce({ titre: "T" } as any);

      await controller.previewTemplate(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Prévisualisation du template", data: { titre: "T" } });
    });

    it("devrait retourner 400 pour ID invalide", async () => {
      req.params = { id: "-1" };

      await controller.previewTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait retourner 404 si introuvable", async () => {
      req.params = { id: "1" };
      jest.spyOn(PreviewTemplateUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Template introuvable"));

      await controller.previewTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // 12. sendFromTemplate
  describe("sendFromTemplate", () => {
    it("devrait retourner 201 avec le résultat", async () => {
      req.params = { id: "1" };
      req.body = { destinataire_id: 2, envoye_par_email: true };
      jest.spyOn(SendFromTemplateUseCase.prototype, "execute").mockResolvedValueOnce({ sent_count: 1, message_ids: [100] });

      await controller.sendFromTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "1 message(s) envoyé(s) avec succès", data: { sent_count: 1, message_ids: [100] } });
    });

    it("devrait retourner 400 pour ID invalide", async () => {
      req.params = { id: "-1" };

      await controller.sendFromTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devrait retourner 400 si ni cible ni destinataire n'est fourni", async () => {
      req.params = { id: "1" };
      req.body = { envoye_par_email: true };

      await controller.sendFromTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Un destinataire (destinataire_id) ou une cible de broadcast (cible) est requis" }));
    });

    it("devrait retourner une erreur du use case (ex: 400)", async () => {
      req.params = { id: "1" };
      req.body = { cible: "tous", envoye_par_email: true };
      jest.spyOn(SendFromTemplateUseCase.prototype, "execute").mockRejectedValueOnce(new Error("Les membres ne peuvent pas envoyer de messages groupés"));

      await controller.sendFromTemplate(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Les membres ne peuvent pas envoyer de messages groupés" }));
    });
  });
});
