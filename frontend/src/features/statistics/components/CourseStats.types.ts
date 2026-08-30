export interface CourseAnalyticsResponse {
  overview: {
    total_cours: number;
    total_seances: number;
    total_inscriptions: number;
    taux_presence_moyen: number;
    cours_actifs: number;
    taux_remplissage_moyen: number;
  };
  by_type: Array<{
    type_nom: string;
    count: number;
    pourcentage: number;
    taux_presence: number;
  }>;
  by_professor: Array<{
    professeur_nom: string;
    nombre_cours: number;
    total_inscrits: number;
    taux_presence: number;
  }>;
  popular_courses: Array<{
    cours_nom: string;
    jour: string;
    heure_debut: string;
    nombre_inscrits: number;
    taux_presence: number;
  }>;
}

export interface CourseStatsProps {
  data?: CourseAnalyticsResponse;
  isLoading?: boolean;
  error?: Error | null;
  isCompact?: boolean;
}
