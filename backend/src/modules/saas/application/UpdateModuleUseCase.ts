import { ISaasRepository, SaasModule } from "../domain/index.js";

export class UpdateModuleUseCase {
  constructor(private readonly saasRepository: ISaasRepository) {}

  async execute(id: string, moduleData: Partial<Omit<SaasModule, 'id' | 'created_at' | 'updated_at'>>): Promise<SaasModule | null> {
    return this.saasRepository.updateModule(id, moduleData);
  }
}
