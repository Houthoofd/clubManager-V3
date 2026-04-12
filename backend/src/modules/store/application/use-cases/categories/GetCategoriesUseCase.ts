/**
 * GetCategoriesUseCase
 * Use case pour récupérer toutes les catégories
 */

import type {
  ICategoryRepository,
  CategoryRow,
} from "../../../domain/repositories/ICategoryRepository.js";

export class GetCategoriesUseCase {
  constructor(private readonly repo: ICategoryRepository) {}

  async execute(): Promise<CategoryRow[]> {
    return this.repo.findAll();
  }
}
