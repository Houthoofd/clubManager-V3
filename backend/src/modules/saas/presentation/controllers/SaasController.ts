import { Request, Response } from "express";
import { MySQLSaasRepository } from "../../infrastructure/MySQLSaasRepository.js";
import { ListModulesUseCase, CreateModuleUseCase, UpdateModuleUseCase, PublishChangelogUseCase } from "../../application/index.js";

export class SaasController {
  private listModulesUseCase: ListModulesUseCase;
  private createModuleUseCase: CreateModuleUseCase;
  private updateModuleUseCase: UpdateModuleUseCase;
  private publishChangelogUseCase: PublishChangelogUseCase;

  constructor() {
    const repository = new MySQLSaasRepository();
    this.listModulesUseCase = new ListModulesUseCase(repository);
    this.createModuleUseCase = new CreateModuleUseCase(repository);
    this.updateModuleUseCase = new UpdateModuleUseCase(repository);
    this.publishChangelogUseCase = new PublishChangelogUseCase(repository);
  }

  listModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const modules = await this.listModulesUseCase.execute();
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const created = await this.createModuleUseCase.execute(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.updateModuleUseCase.execute(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Module not found" });
        return;
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  publishChangelog = async (req: Request, res: Response): Promise<void> => {
    try {
      const changelog = await this.publishChangelogUseCase.execute({
        module_id: req.params.id,
        title: req.body.title,
        content: req.body.content
      });
      res.status(201).json(changelog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
