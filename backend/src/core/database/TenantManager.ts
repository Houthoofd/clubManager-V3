import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export class TenantManager {
  private static instance: TenantManager;
  private pools: Map<string, mysql.Pool>;
  private masterPool: mysql.Pool | null = null;

  private constructor() {
    this.pools = new Map<string, mysql.Pool>();
  }

  public static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  private getBaseConfig() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };
  }

  /**
   * Retourne le pool de connexion pour la base maître
   */
  public getMasterPool(): mysql.Pool {
    if (!this.masterPool) {
      const config = {
        ...this.getBaseConfig(),
        database: process.env.DB_MASTER_NAME || 'clubmanager_master',
      };
      
      this.masterPool = mysql.createPool(config);
      console.log(`[Database] Master connection pool created for ${config.database}`);
    }
    return this.masterPool;
  }

  /**
   * Retourne (ou crée) le pool de connexion pour un tenant spécifique
   */
  public getTenantPool(dbName: string): mysql.Pool {
    if (this.pools.has(dbName)) {
      return this.pools.get(dbName)!;
    }

    const config = {
      ...this.getBaseConfig(),
      database: dbName,
    };

    const newPool = mysql.createPool(config);
    this.pools.set(dbName, newPool);
    console.log(`[Database] Tenant connection pool created for ${dbName}`);
    
    return newPool;
  }

  /**
   * Ferme proprement tous les pools (Master + Tenants)
   */
  public async closeAllPools(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    if (this.masterPool) {
      promises.push(this.masterPool.end());
      this.masterPool = null;
    }

    for (const [dbName, pool] of this.pools.entries()) {
      promises.push(pool.end());
      console.log(`[Database] Connection pool closed for ${dbName}`);
    }
    this.pools.clear();

    await Promise.all(promises);
    console.log('[Database] All connection pools closed successfully');
  }
}

export const tenantManager = TenantManager.getInstance();
