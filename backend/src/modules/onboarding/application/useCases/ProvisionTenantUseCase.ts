import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { tenantManager } from '../../../../core/database/TenantManager';
import { pool } from '../../../../core/database/connection';

export class ProvisionTenantUseCase {
  
  public async execute(data: any): Promise<{ success: boolean, slug: string }> {
    const { clubName, adminFirstName, adminLastName, adminEmail, adminPassword } = data;
    
    // 1. Generate slug and db_name
    const slug = clubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uuid = crypto.randomUUID();
    const dbName = `clubmanager_tenant_${slug.replace(/-/g, '_')}`;

    const masterPool = tenantManager.getMasterPool();
    const connection = await masterPool.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1.5 Generate Unique Club Code (Acronym)
      let baseCode = clubName.split(' ').map((w: string) => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
      if (baseCode.length < 3) baseCode = baseCode.padEnd(3, 'X');
      
      let code = baseCode;
      let counter = 1;
      let codeExists = true;
      
      while (codeExists) {
        const [rows] = await connection.query<mysql.RowDataPacket[]>('SELECT id FROM organizations WHERE code = ?', [code]);
        if (rows.length === 0) {
          codeExists = false;
        } else {
          counter++;
          code = `${baseCode}${counter}`;
        }
      }

      // 2. Insert into organizations
      const [orgResult] = await connection.query<mysql.ResultSetHeader>(
        `INSERT INTO organizations (uuid, name, slug, code, db_name, contact_email, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'trial')`,
        [uuid, clubName, slug, code, dbName, adminEmail]
      );
      
      const orgId = orgResult.insertId;

      // 3. Insert into master_users
      await connection.query(
        `INSERT INTO master_users (email, organization_id, global_role) VALUES (?, ?, 'org_admin')`,
        [adminEmail, orgId]
      );

      await connection.commit();
      
      // 4. Provision the database
      await this.provisionDatabase(dbName, adminFirstName, adminLastName, adminEmail, adminPassword);
      
      return { success: true, slug };
    } catch (error) {
      await connection.rollback();
      console.error('[Provisioning] Error creating tenant record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  private async provisionDatabase(dbName: string, firstName: string, lastName: string, email: string, passwordRaw: string) {
    // Create a temporary connection with multipleStatements enabled to run the large SQL files
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    try {
      console.log(`[Provisioning] Creating database ${dbName}...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.query(`USE ${dbName}`);

      // Execute 05_SCHEMA_ACTUEL.sql
      const schemaPath = path.join(process.cwd(), '..', 'db', 'consolidated', '05_SCHEMA_ACTUEL.sql');
      if (fs.existsSync(schemaPath)) {
        console.log(`[Provisioning] Executing Schema...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8').replace(/^\\uFEFF/, '');
        await connection.query(schemaSql);
      }

      // Execute 06_DONNEES_REFERENCE.sql
      const refPath = path.join(process.cwd(), '..', 'db', 'consolidated', '06_DONNEES_REFERENCE.sql');
      if (fs.existsSync(refPath)) {
        console.log(`[Provisioning] Executing Reference Data...`);
        const refSql = fs.readFileSync(refPath, 'utf8').replace(/^\\uFEFF/, '');
        await connection.query(refSql);
      }

      // Hash password and create the admin user inside the tenant DB
      console.log(`[Provisioning] Creating admin user in tenant DB...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(passwordRaw, salt);

      // Insert Admin into tenant's users table
      await connection.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, status)
         VALUES (UUID(), ?, ?, ?, ?, 'admin', 'active')`,
        [email, passwordHash, firstName, lastName]
      );

      console.log(`[Provisioning] Tenant ${dbName} fully provisioned.`);
    } catch (error) {
      console.error('[Provisioning] Error executing SQL templates:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }
}
