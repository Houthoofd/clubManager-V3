/**
 * @fileoverview GetStatisticsHistory use-case
 * @module statistics/application/usecases/GetStatisticsHistory
 */

import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Use-case: retrieve the history of statistics snapshots.
 */
export class GetStatisticsHistory {
  constructor(private readonly repo: IStatisticsRepository) {}

  async execute(
    type?: string,
    limit?: number
  ): Promise<Array<{ type: string; cle: string; valeur: string; date_stat: Date }>> {
    return this.repo.getSnapshotHistory(type, limit);
  }
}
