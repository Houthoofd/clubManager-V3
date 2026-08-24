import { GetReferencesUseCase } from "../getReferences";
import type { ReferencesRepository } from "../../infrastructure/referencesRepository";
import type {
  ReferencesData,
  MethodePaiement,
  StatutCommande,
  TypeCours,
  StatutPaiement,
  StatutEcheance,
  RoleUtilisateur,
  RoleFamilial,
  Genre,
} from "../../domain/types";

describe("GetReferencesUseCase", () => {
  let useCase: GetReferencesUseCase;
  let mockRepo: jest.Mocked<ReferencesRepository>;

  beforeEach(() => {
    mockRepo = {
      getAllReferences: jest.fn(),
      getMethodesPaiement: jest.fn(),
      getStatutsCommande: jest.fn(),
      getTypesCours: jest.fn(),
      getStatutsPaiement: jest.fn(),
      getStatutsEcheance: jest.fn(),
      getRolesUtilisateur: jest.fn(),
      getRolesFamilial: jest.fn(),
      getGenres: jest.fn(),
    } as unknown as jest.Mocked<ReferencesRepository>;

    useCase = new GetReferencesUseCase(mockRepo);
    
    // Suppress console.error for tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("execute", () => {
    it("should return all references successfully", async () => {
      const mockData = { methodes_paiement: [] } as unknown as ReferencesData;
      mockRepo.getAllReferences.mockResolvedValue(mockData);

      const result = await useCase.execute();

      expect(result).toBe(mockData);
      expect(mockRepo.getAllReferences).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getAllReferences.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.execute]", error);
    });
  });

  describe("getMethodesPaiement", () => {
    it("should return payment methods successfully", async () => {
      const mockData: MethodePaiement[] = [];
      mockRepo.getMethodesPaiement.mockResolvedValue(mockData);

      const result = await useCase.getMethodesPaiement();

      expect(result).toBe(mockData);
      expect(mockRepo.getMethodesPaiement).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getMethodesPaiement.mockRejectedValue(error);

      await expect(useCase.getMethodesPaiement()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getMethodesPaiement]", error);
    });
  });

  describe("getStatutsCommande", () => {
    it("should return order statuses successfully", async () => {
      const mockData: StatutCommande[] = [];
      mockRepo.getStatutsCommande.mockResolvedValue(mockData);

      const result = await useCase.getStatutsCommande();

      expect(result).toBe(mockData);
      expect(mockRepo.getStatutsCommande).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getStatutsCommande.mockRejectedValue(error);

      await expect(useCase.getStatutsCommande()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getStatutsCommande]", error);
    });
  });

  describe("getTypesCours", () => {
    it("should return course types successfully", async () => {
      const mockData: TypeCours[] = [];
      mockRepo.getTypesCours.mockResolvedValue(mockData);

      const result = await useCase.getTypesCours();

      expect(result).toBe(mockData);
      expect(mockRepo.getTypesCours).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getTypesCours.mockRejectedValue(error);

      await expect(useCase.getTypesCours()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getTypesCours]", error);
    });
  });

  describe("getStatutsPaiement", () => {
    it("should return payment statuses successfully", async () => {
      const mockData: StatutPaiement[] = [];
      mockRepo.getStatutsPaiement.mockResolvedValue(mockData);

      const result = await useCase.getStatutsPaiement();

      expect(result).toBe(mockData);
      expect(mockRepo.getStatutsPaiement).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getStatutsPaiement.mockRejectedValue(error);

      await expect(useCase.getStatutsPaiement()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getStatutsPaiement]", error);
    });
  });

  describe("getStatutsEcheance", () => {
    it("should return due date statuses successfully", async () => {
      const mockData: StatutEcheance[] = [];
      mockRepo.getStatutsEcheance.mockResolvedValue(mockData);

      const result = await useCase.getStatutsEcheance();

      expect(result).toBe(mockData);
      expect(mockRepo.getStatutsEcheance).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getStatutsEcheance.mockRejectedValue(error);

      await expect(useCase.getStatutsEcheance()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getStatutsEcheance]", error);
    });
  });

  describe("getRolesUtilisateur", () => {
    it("should return user roles successfully", async () => {
      const mockData: RoleUtilisateur[] = [];
      mockRepo.getRolesUtilisateur.mockResolvedValue(mockData);

      const result = await useCase.getRolesUtilisateur();

      expect(result).toBe(mockData);
      expect(mockRepo.getRolesUtilisateur).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getRolesUtilisateur.mockRejectedValue(error);

      await expect(useCase.getRolesUtilisateur()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getRolesUtilisateur]", error);
    });
  });

  describe("getRolesFamilial", () => {
    it("should return family roles successfully", async () => {
      const mockData: RoleFamilial[] = [];
      mockRepo.getRolesFamilial.mockResolvedValue(mockData);

      const result = await useCase.getRolesFamilial();

      expect(result).toBe(mockData);
      expect(mockRepo.getRolesFamilial).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getRolesFamilial.mockRejectedValue(error);

      await expect(useCase.getRolesFamilial()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getRolesFamilial]", error);
    });
  });

  describe("getGenres", () => {
    it("should return genres successfully", async () => {
      const mockData: Genre[] = [];
      mockRepo.getGenres.mockResolvedValue(mockData);

      const result = await useCase.getGenres();

      expect(result).toBe(mockData);
      expect(mockRepo.getGenres).toHaveBeenCalledTimes(1);
    });

    it("should log and throw an error when repository fails", async () => {
      const error = new Error("Database error");
      mockRepo.getGenres.mockRejectedValue(error);

      await expect(useCase.getGenres()).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("[GetReferencesUseCase.getGenres]", error);
    });
  });
});
