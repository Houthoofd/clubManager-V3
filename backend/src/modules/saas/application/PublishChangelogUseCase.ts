import { ISaasRepository, SaasModuleChangelog } from "../domain/index.js";

export class PublishChangelogUseCase {
  constructor(private readonly saasRepository: ISaasRepository) {}

  async execute(changelogData: Omit<SaasModuleChangelog, 'id' | 'created_at'>): Promise<SaasModuleChangelog> {
    return this.saasRepository.publishChangelog(changelogData);
  }
}
