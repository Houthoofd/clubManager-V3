export interface SaasModule {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: string;
  type: string;
  pricing: any | null;
  is_enabled_globally: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SaasModuleDependency {
  module_id: string;
  depends_on_module_id: string;
}

export interface SaasModuleChangelog {
  id: string;
  module_id: string;
  title: string;
  content: string;
  created_at: Date;
}

export interface ClubModule {
  club_id: string;
  module_id: string;
  status: string;
  activated_at: Date;
}

export interface ISaasRepository {
  listModules(): Promise<SaasModule[]>;
  getModuleById(id: string): Promise<SaasModule | null>;
  createModule(module: Omit<SaasModule, 'id' | 'created_at' | 'updated_at'>): Promise<SaasModule>;
  updateModule(id: string, module: Partial<Omit<SaasModule, 'id' | 'created_at' | 'updated_at'>>): Promise<SaasModule | null>;
  deleteModule(id: string): Promise<void>;
  
  getModuleDependencies(moduleId: string): Promise<string[]>;
  addModuleDependency(moduleId: string, dependsOnModuleId: string): Promise<void>;
  removeModuleDependency(moduleId: string, dependsOnModuleId: string): Promise<void>;
  
  getModuleChangelogs(moduleId: string): Promise<SaasModuleChangelog[]>;
  publishChangelog(changelog: Omit<SaasModuleChangelog, 'id' | 'created_at'>): Promise<SaasModuleChangelog>;
  
  getClubModules(clubId: string): Promise<ClubModule[]>;
  activateModuleForClub(clubId: string, moduleId: string): Promise<void>;
  deactivateModuleForClub(clubId: string, moduleId: string): Promise<void>;
}
