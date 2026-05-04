/**
 * Courses API Service
 * Service pour gérer les appels API du module cours
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";
import type {
  CourseRecurrentListItemDto,
  CourseRecurrentResponseDto,
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
  CourseListItemDto,
  CourseResponseDto,
  CreateCourseDto,
  GenerateCoursesDto,
  ProfessorListItemDto,
  ProfessorResponseDto,
  CreateProfessorDto,
  UpdateProfessorDto,
  AttendanceSheetDto,
  BulkUpdatePresenceDto,
  CreateInscriptionDto,
} from "@clubmanager/types";

// ─── Course Recurrent ─────────────────────────────────────────────────────────

/**
 * Récupère la liste des cours récurrents (planning hebdomadaire)
 */
export const getCourseRecurrents = async (): Promise<
  CourseRecurrentListItemDto[]
> => {
  const response =
    await apiClient.get<ApiResponse<CourseRecurrentListItemDto[]>>("/courses");
  return response.data.data!;
};

/**
 * Crée un nouveau cours récurrent
 */
export const createCourseRecurrent = async (
  dto: CreateCourseRecurrentDto,
): Promise<CourseRecurrentResponseDto> => {
  const response = await apiClient.post<
    ApiResponse<CourseRecurrentResponseDto>
  >("/courses", dto);
  return response.data.data!;
};

/**
 * Met à jour un cours récurrent existant
 */
export const updateCourseRecurrent = async (
  id: number,
  dto: UpdateCourseRecurrentDto,
): Promise<CourseRecurrentResponseDto> => {
  const response = await apiClient.put<ApiResponse<CourseRecurrentResponseDto>>(
    `/courses/${id}`,
    dto,
  );
  return response.data.data!;
};

/**
 * Supprime un cours récurrent
 */
export const deleteCourseRecurrent = async (id: number): Promise<void> => {
  await apiClient.delete(`/courses/${id}`);
};

// ─── Professors ───────────────────────────────────────────────────────────────

/**
 * Récupère la liste des professeurs
 */
export const getProfessors = async (): Promise<ProfessorListItemDto[]> => {
  const response = await apiClient.get<ApiResponse<ProfessorListItemDto[]>>(
    "/courses/professors",
  );
  return response.data.data!;
};

/**
 * Crée un nouveau professeur
 */
export const createProfessor = async (
  dto: CreateProfessorDto,
): Promise<ProfessorResponseDto> => {
  const response = await apiClient.post<ApiResponse<ProfessorResponseDto>>(
    "/courses/professors",
    dto,
  );
  return response.data.data!;
};

/**
 * Met à jour un professeur existant
 */
export const updateProfessor = async (
  id: number,
  dto: UpdateProfessorDto,
): Promise<ProfessorResponseDto> => {
  const response = await apiClient.put<ApiResponse<ProfessorResponseDto>>(
    `/courses/professors/${id}`,
    dto,
  );
  return response.data.data!;
};

/**
 * Récupère un professeur par son ID
 */
export const getProfessorById = async (
  id: number,
): Promise<ProfessorResponseDto> => {
  const response = await apiClient.get<ApiResponse<ProfessorResponseDto>>(
    `/courses/professors/${id}`,
  );
  return response.data.data!;
};

/**
 * Supprime un professeur
 */
export const deleteProfessor = async (id: number): Promise<void> => {
  await apiClient.delete(`/courses/professors/${id}`);
};

// ─── Sessions (cours instances) ───────────────────────────────────────────────

/**
 * Paramètres de filtrage pour la liste des séances
 */
export interface GetCoursesParams {
  date_debut?: string;
  date_fin?: string;
  type_cours?: string;
}

/**
 * Récupère la liste des séances avec filtres optionnels
 */
export const getCourses = async (
  params?: GetCoursesParams,
): Promise<CourseListItemDto[]> => {
  const response = await apiClient.get<ApiResponse<CourseListItemDto[]>>(
    "/courses/sessions",
    {
      params,
    },
  );
  return response.data.data!;
};

/**
 * Récupère une séance par son ID
 */
export const getCourseById = async (id: number): Promise<CourseResponseDto> => {
  const response = await apiClient.get<ApiResponse<CourseResponseDto>>(
    `/courses/sessions/${id}`,
  );
  return response.data.data!;
};

/**
 * Crée une nouvelle séance
 */
export const createSession = async (
  dto: CreateCourseDto,
): Promise<CourseResponseDto> => {
  const response = await apiClient.post<ApiResponse<CourseResponseDto>>(
    "/courses/sessions",
    dto,
  );
  return response.data.data!;
};

/**
 * Génère des séances à partir d'un cours récurrent sur une période donnée
 */
export const generateCourses = async (
  dto: GenerateCoursesDto,
): Promise<{ generated: number; cours: CourseListItemDto[] }> => {
  const response = await apiClient.post<
    ApiResponse<{ generated: number; cours: CourseListItemDto[] }>
  >("/courses/sessions/generate", dto);
  return response.data.data!;
};

// ─── Attendance (présences & inscriptions) ────────────────────────────────────

/**
 * Récupère la feuille de présence d'une séance
 */
export const getCourseInscriptions = async (
  cours_id: number,
): Promise<AttendanceSheetDto> => {
  const response = await apiClient.get<ApiResponse<AttendanceSheetDto>>(
    `/courses/sessions/${cours_id}/inscriptions`,
  );
  return response.data.data!;
};

/**
 * Inscrit un membre à une séance
 */
export const createInscription = async (
  cours_id: number,
  dto: CreateInscriptionDto,
): Promise<void> => {
  await apiClient.post(`/courses/sessions/${cours_id}/inscriptions`, dto);
};

/**
 * Met à jour en masse les présences d'une séance
 */
export const bulkUpdatePresence = async (
  cours_id: number,
  dto: BulkUpdatePresenceDto,
): Promise<void> => {
  await apiClient.patch(`/courses/sessions/${cours_id}/presence`, dto);
};

/**
 * Supprime une inscription
 */
export const deleteInscription = async (id: number): Promise<void> => {
  await apiClient.delete(`/courses/inscriptions/${id}`);
};

// ─── My Enrollments ───────────────────────────────────────────────────────────

/**
 * DTO retourné par GET /api/courses/sessions/my-enrollments
 * Représente une inscription du membre authentifié avec les infos de la séance.
 */
export interface MyEnrollmentDto {
  inscription_id: number;
  cours_id: number;
  date_cours: string;
  type_cours: string;
  heure_debut: string;
  heure_fin: string;
  status_id: number;
  status_nom?: string;
  presence: boolean | null;
  commentaire: string | null;
  created_at: string;
}

/**
 * Récupère les inscriptions du membre authentifié
 */
export const getMyEnrollments = async (): Promise<MyEnrollmentDto[]> => {
  const response = await apiClient.get<ApiResponse<MyEnrollmentDto[]>>(
    "/courses/sessions/my-enrollments",
  );
  return response.data.data!;
};
