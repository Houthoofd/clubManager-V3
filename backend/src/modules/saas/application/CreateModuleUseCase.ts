import { ISaasRepository, SaasModule } from "../domain/index.js";

export class CreateModuleUseCase {
  constructor(private readonly saasRepository: ISaasRepository) {}

  async execute(moduleData: Omit<SaasModule, 'id' | 'created_at' | 'updated_at'>): Promise<SaasModule> {
    return this.saasRepository.createModule(moduleData);
  }
}
