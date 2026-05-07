/**
 * @fileoverview CreateStatisticsSnapshot use-case
 * @module statistics/application/usecases/CreateStatisticsSnapshot
 */

import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Use-case: persist a snapshot of all current statistics.
 */
export class CreateStatisticsSnapshot {
  constructor(private readonly repo: IStatisticsRepository) {}

  async execute(): Promise<{ inserted: number; date_stat: Date }> {
    return this.repo.createSnapshot();
  }
}
