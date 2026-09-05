import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextData {
  tenantId: number | null;
  dbName: string | null;
  isMaster: boolean; // Si true, force la requête sur la base master
}

class TenantContext {
  private static instance: TenantContext;
  private storage: AsyncLocalStorage<TenantContextData>;

  private constructor() {
    this.storage = new AsyncLocalStorage<TenantContextData>();
  }

  public static getInstance(): TenantContext {
    if (!TenantContext.instance) {
      TenantContext.instance = new TenantContext();
    }
    return TenantContext.instance;
  }

  public getStorage(): AsyncLocalStorage<TenantContextData> {
    return this.storage;
  }

  public getTenant(): TenantContextData | undefined {
    return this.storage.getStore();
  }

  public run<T>(context: TenantContextData, callback: () => T): T {
    return this.storage.run(context, callback);
  }
}

export const tenantContext = TenantContext.getInstance();
