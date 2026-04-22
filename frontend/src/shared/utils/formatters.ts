/**
 * Formatters - Fonctions de formatage centralisées
 * ClubManager V3
 *
 * Utilitaires de formatage pour garantir la cohérence dans toute l'application.
 * Tous les formats utilisent la locale française (fr-FR) par défaut.
 *
 * @module shared/utils/formatters
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATES & HEURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate une date au format français (JJ/MM/AAAA)
 *
 * @param date - Date à formater (string ISO, Date, ou null/undefined)
 * @returns Date formatée en français ou "-" si invalide
 *
 * @example
 * formatDate("2024-03-15") // "15/03/2024"
 * formatDate(new Date()) // "15/03/2024"
 * formatDate(null) // "-"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return "-";
  }
}

/**
 * Formate une date avec l'heure au format français
 *
 * @param date - Date à formater
 * @returns Date et heure formatées ou "-" si invalide
 *
 * @example
 * formatDateTime("2024-03-15T14:30:00") // "15/03/2024 14:30"
 * formatDateTime(new Date()) // "15/03/2024 14:30"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";

  try {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return "-";

    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "-";
  }
}

/**
 * Formate une heure au format HH:MM
 *
 * @param time - Heure au format "HH:MM:SS" ou "HH:MM"
 * @returns Heure formatée "HH:MM" ou "-" si invalide
 *
 * @example
 * formatTime("14:30:00") // "14:30"
 * formatTime("14:30") // "14:30"
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return "-";

  try {
    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) return "-";

    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch {
    return "-";
  }
}

/**
 * Formate une durée en heures et minutes
 *
 * @param minutes - Durée en minutes
 * @returns Durée formatée "Xh YYmin"
 *
 * @example
 * formatDuration(90) // "1h 30min"
 * formatDuration(45) // "45min"
 * formatDuration(120) // "2h"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return "0min";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}min`;
}

/**
 * Formate une date en format relatif (aujourd'hui, hier, etc.)
 *
 * @param date - Date à formater
 * @returns Texte relatif ("Aujourd'hui", "Hier", ou date formatée)
 *
 * @example
 * formatRelativeDate(new Date()) // "Aujourd'hui"
 * formatRelativeDate(yesterday) // "Hier"
 * formatRelativeDate("2024-01-01") // "01/01/2024"
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return "-";

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(d);
    compareDate.setHours(0, 0, 0, 0);

    const diffTime = compareDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === -1) return "Hier";
    if (diffDays === 1) return "Demain";

    return formatDate(d);
  } catch {
    return "-";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOMBRES & MONNAIE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un montant en euros
 *
 * @param amount - Montant à formater
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Montant formaté avec symbole €
 *
 * @example
 * formatCurrency(1234.56) // "1 234,56 €"
 * formatCurrency(1000) // "1 000,00 €"
 * formatCurrency(1234.567, 3) // "1 234,567 €"
 */
export function formatCurrency(
  amount: number | null | undefined,
  decimals: number = 2
): string {
  if (amount === null || amount === undefined) return "-";

  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formate un nombre avec séparateurs de milliers
 *
 * @param num - Nombre à formater
 * @param decimals - Nombre de décimales (défaut: 0)
 * @returns Nombre formaté
 *
 * @example
 * formatNumber(1234567) // "1 234 567"
 * formatNumber(1234.56, 2) // "1 234,56"
 */
export function formatNumber(
  num: number | null | undefined,
  decimals: number = 0
): string {
  if (num === null || num === undefined) return "-";

  return num.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formate un pourcentage
 *
 * @param value - Valeur décimale (0.75 = 75%)
 * @param decimals - Nombre de décimales (défaut: 0)
 * @returns Pourcentage formaté avec symbole %
 *
 * @example
 * formatPercentage(0.75) // "75%"
 * formatPercentage(0.3333, 1) // "33,3%"
 * formatPercentage(1.5) // "150%"
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return "-";

  const percentage = value * 100;
  return `${formatNumber(percentage, decimals)}%`;
}

/**
 * Formate un montant compact (K, M, B)
 *
 * @param num - Nombre à formater
 * @returns Nombre formaté avec suffixe
 *
 * @example
 * formatCompactNumber(1234) // "1,2K"
 * formatCompactNumber(1234567) // "1,2M"
 * formatCompactNumber(1234567890) // "1,2B"
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(1)}B`;
  }
  if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(1)}M`;
  }
  if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(1)}K`;
  }

  return `${sign}${absNum}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXTE & IDENTITÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un nom complet (Prénom Nom)
 *
 * @param firstName - Prénom
 * @param lastName - Nom de famille
 * @returns Nom complet ou "-" si vide
 *
 * @example
 * formatFullName("Jean", "Dupont") // "Jean Dupont"
 * formatFullName("Marie", null) // "Marie"
 * formatFullName(null, null) // "-"
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "-";
}

/**
 * Formate des initiales (J.D.)
 *
 * @param firstName - Prénom
 * @param lastName - Nom de famille
 * @returns Initiales avec points
 *
 * @example
 * formatInitials("Jean", "Dupont") // "J.D."
 * formatInitials("Marie-Claire", "Martin") // "M.M."
 */
export function formatInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const firstInitial = firstName?.charAt(0).toUpperCase() || "";
  const lastInitial = lastName?.charAt(0).toUpperCase() || "";

  if (!firstInitial && !lastInitial) return "?";
  if (!lastInitial) return `${firstInitial}.`;

  return `${firstInitial}.${lastInitial}.`;
}

/**
 * Tronque un texte avec ellipse
 *
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Texte tronqué avec "..."
 *
 * @example
 * truncate("Lorem ipsum dolor sit amet", 10) // "Lorem ipsu..."
 * truncate("Court", 10) // "Court"
 */
export function truncate(
  text: string | null | undefined,
  maxLength: number
): string {
  if (!text) return "-";
  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitalise la première lettre d'un texte
 *
 * @param text - Texte à capitaliser
 * @returns Texte avec première lettre en majuscule
 *
 * @example
 * capitalize("bonjour") // "Bonjour"
 * capitalize("BONJOUR") // "Bonjour"
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un numéro de téléphone français
 *
 * @param phone - Numéro de téléphone
 * @returns Numéro formaté XX XX XX XX XX
 *
 * @example
 * formatPhone("0612345678") // "06 12 34 56 78"
 * formatPhone("+33612345678") // "+33 6 12 34 56 78"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";

  // Nettoyer le numéro
  const cleaned = phone.replace(/\s+/g, '');

  // Format international
  if (cleaned.startsWith('+33')) {
    const number = cleaned.substring(3);
    return `+33 ${number.charAt(0)} ${number.substring(1).match(/.{1,2}/g)?.join(' ') || ''}`.trim();
  }

  // Format français (10 chiffres)
  if (cleaned.match(/^0\d{9}$/)) {
    return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
  }

  return phone;
}

/**
 * Formate une adresse email (lowercase)
 *
 * @param email - Adresse email
 * @returns Email en minuscules
 *
 * @example
 * formatEmail("Jean.Dupont@Example.COM") // "jean.dupont@example.com"
 */
export function formatEmail(email: string | null | undefined): string {
  if (!email) return "-";
  return email.toLowerCase().trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// TAILLE & FICHIERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate une taille de fichier en octets
 *
 * @param bytes - Taille en octets
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Taille formatée (KB, MB, GB)
 *
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(1073741824) // "1.00 GB"
 */
export function formatFileSize(bytes: number | null | undefined, decimals: number = 2): string {
  if (bytes === null || bytes === undefined || bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// GENRES & RÔLES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un genre (ID → Libellé)
 *
 * @param genreId - ID du genre (1=Homme, 2=Femme, 3=Autre)
 * @returns Libellé du genre
 *
 * @example
 * formatGender(1) // "Homme"
 * formatGender(2) // "Femme"
 * formatGender(3) // "Autre"
 */
export function formatGender(genreId: number | string | null | undefined): string {
  const id = typeof genreId === 'string' ? parseInt(genreId, 10) : genreId;

  switch (id) {
    case 1: return "Homme";
    case 2: return "Femme";
    case 3: return "Autre";
    default: return "Non spécifié";
  }
}

/**
 * Formate un rôle utilisateur
 *
 * @param role - Rôle (admin, manager, member, etc.)
 * @returns Libellé français du rôle
 *
 * @example
 * formatRole("admin") // "Administrateur"
 * formatRole("member") // "Membre"
 */
export function formatRole(role: string | null | undefined): string {
  if (!role) return "-";

  const roles: Record<string, string> = {
    'admin': 'Administrateur',
    'manager': 'Gestionnaire',
    'member': 'Membre',
    'guest': 'Invité',
    'professor': 'Professeur',
    'parent': 'Parent',
    'child': 'Enfant'
  };

  return roles[role.toLowerCase()] || capitalize(role);
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un statut de paiement
 *
 * @param status - Statut (paid, pending, failed, etc.)
 * @returns Libellé français du statut
 *
 * @example
 * formatPaymentStatus("paid") // "Payé"
 * formatPaymentStatus("pending") // "En attente"
 */
export function formatPaymentStatus(status: string | null | undefined): string {
  if (!status) return "-";

  const statuses: Record<string, string> = {
    'paid': 'Payé',
    'pending': 'En attente',
    'failed': 'Échoué',
    'cancelled': 'Annulé',
    'refunded': 'Remboursé',
    'partial': 'Partiel'
  };

  return statuses[status.toLowerCase()] || capitalize(status);
}

/**
 * Formate un statut de commande
 *
 * @param status - Statut (pending, processing, shipped, delivered, cancelled)
 * @returns Libellé français du statut
 */
export function formatOrderStatus(status: string | null | undefined): string {
  if (!status) return "-";

  const statuses: Record<string, string> = {
    'pending': 'En attente',
    'processing': 'En traitement',
    'shipped': 'Expédié',
    'delivered': 'Livré',
    'cancelled': 'Annulé'
  };

  return statuses[status.toLowerCase()] || capitalize(status);
}

// ═══════════════════════════════════════════════════════════════════════════
// ÂGE & ANNIVERSAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule et formate l'âge à partir d'une date de naissance
 *
 * @param birthDate - Date de naissance
 * @returns Âge formaté "X ans" ou "-" si invalide
 *
 * @example
 * formatAge("2000-01-01") // "24 ans"
 * formatAge("2020-01-01") // "4 ans"
 */
export function formatAge(birthDate: string | Date | null | undefined): string {
  if (!birthDate) return "-";

  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (isNaN(birth.getTime())) return "-";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} ans`;
  } catch {
    return "-";
  }
}

/**
 * Calcule l'âge en nombre
 *
 * @param birthDate - Date de naissance
 * @returns Âge en années
 */
export function calculateAge(birthDate: string | Date | null | undefined): number {
  if (!birthDate) return 0;

  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    if (isNaN(birth.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch {
    return 0;
  }
}
