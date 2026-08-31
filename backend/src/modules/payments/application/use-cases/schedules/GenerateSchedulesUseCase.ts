/**
 * GenerateSchedulesUseCase
 * Génère automatiquement les échéances mensuelles pour un utilisateur
 * basé sur son plan tarifaire (abonnement_id → duree_mois échéances)
 */
import type { IPaymentScheduleRepository } from "../../../domain/repositories/IPaymentScheduleRepository.js";
import type { IPricingPlanRepository } from "../../../domain/repositories/IPricingPlanRepository.js";
import type { IUserRepository } from "../../../../users/domain/repositories/IUserRepository.js";

export class GenerateSchedulesUseCase {
  constructor(
    private scheduleRepo: IPaymentScheduleRepository,
    private planRepo: IPricingPlanRepository,
    private userRepo: IUserRepository,
  ) {}

  async execute(userId: number): Promise<number[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("Utilisateur introuvable");
    if (!user.abonnement_id) throw new Error("Cet utilisateur n'a pas de plan tarifaire assigné");

    const plan = await this.planRepo.findById(user.abonnement_id);
    if (!plan) throw new Error("Plan tarifaire introuvable");

    let numberOfPayments = 1;
    let intervalMonths = plan.duree_mois;

    if (plan.duree_mois === 1) {
      numberOfPayments = 12;
      intervalMonths = 1;
    } else if (plan.duree_mois === 3) {
      numberOfPayments = 3;
      intervalMonths = 3;
    } else if (plan.duree_mois === 12) {
      numberOfPayments = 1;
      intervalMonths = 12;
    } else {
      numberOfPayments = 1;
      intervalMonths = plan.duree_mois;
    }

    const ids: number[] = [];
    const today = new Date();

    for (let i = 0; i < numberOfPayments; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + (i * intervalMonths) + 1);
      const dateStr = dueDate.toISOString().split("T")[0]!;
      const id = await this.scheduleRepo.create({
        user_id: userId,
        plan_tarifaire_id: plan.id,
        montant: plan.prix,
        date_echeance: dateStr,
        statut: "en_attente",
      });
      ids.push(id);
    }
    return ids;
  }
}

