import { ReferencesController } from "../referencesController";
import type { Request, Response } from "express";
import { GetReferencesUseCase } from "../../../application/getReferences";

jest.mock("../../../infrastructure/referencesRepository", () => {
  return {
    ReferencesRepository: jest.fn(),
  };
});

describe("ReferencesController", () => {
  let controller: ReferencesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    controller = new ReferencesController();
    mockRequest = {};
    mockResponse = {
      set: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("getAll", () => {
    it("should return all references successfully", async () => {
      const mockData = { methodes_paiement: [] };
      jest.spyOn(GetReferencesUseCase.prototype, "execute").mockResolvedValue(mockData as any);

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.execute).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error (instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "execute").mockRejectedValue(new Error("Test error"));

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "execute").mockRejectedValue("String error");

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getMethodesPaiement", () => {
    it("should return payment methods successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getMethodesPaiement").mockResolvedValue(mockData as any);

      await controller.getMethodesPaiement(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getMethodesPaiement).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getMethodesPaiement").mockRejectedValue(new Error("Test error"));

      await controller.getMethodesPaiement(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getMethodesPaiement").mockRejectedValue("String error");

      await controller.getMethodesPaiement(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getStatutsCommande", () => {
    it("should return order statuses successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsCommande").mockResolvedValue(mockData as any);

      await controller.getStatutsCommande(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getStatutsCommande).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsCommande").mockRejectedValue(new Error("Test error"));

      await controller.getStatutsCommande(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsCommande").mockRejectedValue("String error");

      await controller.getStatutsCommande(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getTypesCours", () => {
    it("should return course types successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getTypesCours").mockResolvedValue(mockData as any);

      await controller.getTypesCours(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getTypesCours).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getTypesCours").mockRejectedValue(new Error("Test error"));

      await controller.getTypesCours(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getTypesCours").mockRejectedValue("String error");

      await controller.getTypesCours(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getStatutsPaiement", () => {
    it("should return payment statuses successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsPaiement").mockResolvedValue(mockData as any);

      await controller.getStatutsPaiement(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getStatutsPaiement).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsPaiement").mockRejectedValue(new Error("Test error"));

      await controller.getStatutsPaiement(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsPaiement").mockRejectedValue("String error");

      await controller.getStatutsPaiement(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getStatutsEcheance", () => {
    it("should return due statuses successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsEcheance").mockResolvedValue(mockData as any);

      await controller.getStatutsEcheance(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getStatutsEcheance).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsEcheance").mockRejectedValue(new Error("Test error"));

      await controller.getStatutsEcheance(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getStatutsEcheance").mockRejectedValue("String error");

      await controller.getStatutsEcheance(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getRolesUtilisateur", () => {
    it("should return user roles successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getRolesUtilisateur").mockResolvedValue(mockData as any);

      await controller.getRolesUtilisateur(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getRolesUtilisateur).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getRolesUtilisateur").mockRejectedValue(new Error("Test error"));

      await controller.getRolesUtilisateur(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getRolesUtilisateur").mockRejectedValue("String error");

      await controller.getRolesUtilisateur(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getRolesFamilial", () => {
    it("should return family roles successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getRolesFamilial").mockResolvedValue(mockData as any);

      await controller.getRolesFamilial(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getRolesFamilial).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getRolesFamilial").mockRejectedValue(new Error("Test error"));

      await controller.getRolesFamilial(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getRolesFamilial").mockRejectedValue("String error");

      await controller.getRolesFamilial(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });

  describe("getGenres", () => {
    it("should return genres successfully", async () => {
      const mockData = [{ id: 1 }];
      jest.spyOn(GetReferencesUseCase.prototype, "getGenres").mockResolvedValue(mockData as any);

      await controller.getGenres(mockRequest as Request, mockResponse as Response);

      expect(GetReferencesUseCase.prototype.getGenres).toHaveBeenCalledTimes(1);
      expect(mockResponse.set).toHaveBeenCalledWith("Cache-Control", "public, max-age=3600");
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle error", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getGenres").mockRejectedValue(new Error("Test error"));

      await controller.getGenres(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should handle error (not instance of Error)", async () => {
      jest.spyOn(GetReferencesUseCase.prototype, "getGenres").mockRejectedValue("String error");

      await controller.getGenres(mockRequest as Request, mockResponse as Response);

      expect(console.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur interne",
      });
    });
  });
});
