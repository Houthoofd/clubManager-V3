import { pool } from "@/core/database/connection.js";
import { v4 as uuidv4 } from "uuid";
import { RowDataPacket } from "mysql2";
import { 
  SaasModule, 
  SaasModuleDependency, 
  SaasModuleChangelog, 
  ClubModule, 
  ISaasRepository 
} from "../domain/index.js";

export class MySQLSaasRepository implements ISaasRepository {
  async listModules(): Promise<SaasModule[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM saas_modules");
    return rows as SaasModule[];
  }

  async getModuleById(id: string): Promise<SaasModule | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM saas_modules WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    return rows[0] as SaasModule;
  }

  async createModule(moduleData: Omit<SaasModule, 'id' | 'created_at' | 'updated_at'>): Promise<SaasModule> {
    const id = uuidv4();
    const pricingJson = moduleData.pricing ? JSON.stringify(moduleData.pricing) : null;
    
    await pool.query(
      "INSERT INTO saas_modules (id, name, description, icon, status, type, pricing, is_enabled_globally) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, moduleData.name, moduleData.description, moduleData.icon, moduleData.status, moduleData.type, pricingJson, moduleData.is_enabled_globally]
    );
    
    const created = await this.getModuleById(id);
    if (!created) throw new Error("Failed to create module");
    return created;
  }

  async updateModule(id: string, moduleData: Partial<Omit<SaasModule, 'id' | 'created_at' | 'updated_at'>>): Promise<SaasModule | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (moduleData.name !== undefined) { updates.push("name = ?"); values.push(moduleData.name); }
    if (moduleData.description !== undefined) { updates.push("description = ?"); values.push(moduleData.description); }
    if (moduleData.icon !== undefined) { updates.push("icon = ?"); values.push(moduleData.icon); }
    if (moduleData.status !== undefined) { updates.push("status = ?"); values.push(moduleData.status); }
    if (moduleData.type !== undefined) { updates.push("type = ?"); values.push(moduleData.type); }
    if (moduleData.pricing !== undefined) { updates.push("pricing = ?"); values.push(moduleData.pricing ? JSON.stringify(moduleData.pricing) : null); }
    if (moduleData.is_enabled_globally !== undefined) { updates.push("is_enabled_globally = ?"); values.push(moduleData.is_enabled_globally); }
    
    if (updates.length > 0) {
      values.push(id);
      await pool.query(
        "UPDATE saas_modules SET $" + updates.join(", ") + " WHERE id = ?",
        values
      );
    }
    
    return this.getModuleById(id);
  }

  async deleteModule(id: string): Promise<void> {
    await pool.query("DELETE FROM saas_modules WHERE id = ?", [id]);
  }

  async getModuleDependencies(moduleId: string): Promise<string[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT depends_on_module_id FROM saas_module_dependencies WHERE module_id = ?",
      [moduleId]
    );
    return rows.map(r => r.depends_on_module_id);
  }

  async addModuleDependency(moduleId: string, dependsOnModuleId: string): Promise<void> {
    await pool.query(
      "INSERT IGNORE INTO saas_module_dependencies (module_id, depends_on_module_id) VALUES (?, ?)",
      [moduleId, dependsOnModuleId]
    );
  }

  async removeModuleDependency(moduleId: string, dependsOnModuleId: string): Promise<void> {
    await pool.query(
      "DELETE FROM saas_module_dependencies WHERE module_id = ? AND depends_on_module_id = ?",
      [moduleId, dependsOnModuleId]
    );
  }

  async getModuleChangelogs(moduleId: string): Promise<SaasModuleChangelog[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM saas_module_changelogs WHERE module_id = ? ORDER BY created_at DESC",
      [moduleId]
    );
    return rows as SaasModuleChangelog[];
  }

  async publishChangelog(changelogData: Omit<SaasModuleChangelog, 'id' | 'created_at'>): Promise<SaasModuleChangelog> {
    const id = uuidv4();
    await pool.query(
      "INSERT INTO saas_module_changelogs (id, module_id, title, content) VALUES (?, ?, ?, ?)",
      [id, changelogData.module_id, changelogData.title, changelogData.content]
    );
    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM saas_module_changelogs WHERE id = ?", [id]);
    return rows[0] as SaasModuleChangelog;
  }

  async getClubModules(clubId: string): Promise<ClubModule[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM club_modules WHERE club_id = ?",
      [clubId]
    );
    return rows as ClubModule[];
  }

  async activateModuleForClub(clubId: string, moduleId: string): Promise<void> {
    await pool.query(
      "INSERT INTO club_modules (club_id, module_id, status) VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE status = 'active'",
      [clubId, moduleId]
    );
  }

  async deactivateModuleForClub(clubId: string, moduleId: string): Promise<void> {
    await pool.query(
      "UPDATE club_modules SET status = 'inactive' WHERE club_id = ? AND module_id = ?",
      [clubId, moduleId]
    );
  }
}
