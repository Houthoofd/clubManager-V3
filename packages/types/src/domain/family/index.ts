/**
 * Family Domain Types Index
 * Exports centralisés de tous les types du domaine Family
 */

// Family (familles et membres)
export * from "./Family.types.js";

/**
 * Re-export des types les plus utilisés
 */
export type {
  Family,
  FamilyMemberRole,
  FamilyMember,
  FamilyMemberWithUser,
} from "./Family.types.js";
