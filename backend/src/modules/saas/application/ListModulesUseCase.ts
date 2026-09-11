import { ISaasRepository, SaasModule } from "../domain/index.js";

export class ListModulesUseCase {
  constructor(private readonly saasRepository: ISaasRepository) {}

  async execute(): Promise<SaasModule[]> {
    return this.saasRepository.listModules();
  }
}
