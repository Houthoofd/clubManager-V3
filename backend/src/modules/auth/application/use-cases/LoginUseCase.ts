import type { LoginDto, AuthResponseDto } from "@clubmanager/types";
import { UserRole } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { PasswordService } from "../../../../shared/services/PasswordService.js";
import { JwtService } from "../../../../shared/services/JwtService.js";
import { tenantManager } from "../../../../core/database/TenantManager.js";
import { tenantContext } from "../../../../core/context/tenantContext.js";

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.identifier || dto.identifier.trim().length === 0) {
      throw new Error("L'identifiant est requis");
    }
    if (!dto.password || dto.password.trim().length === 0) {
      throw new Error("Le mot de passe est requis");
    }

    const masterPool = tenantManager.getMasterPool();
    let dbName: string | null = null;
    let globalRole: string | null = null;
    let passwordHash: string | null = null;
    let masterUserId: number | null = null;

    if (dto.identifier.includes("@")) {
      const [rows] = await masterPool.query(
        "SELECT o.db_name, mu.global_role, mu.password_hash, mu.id as master_user_id FROM master_users mu LEFT JOIN organizations o ON mu.organization_id = o.id WHERE mu.email = ?",
        [dto.identifier]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        dbName = (rows[0] as any).db_name || null;
        globalRole = (rows[0] as any).global_role || null;
        passwordHash = (rows[0] as any).password_hash || null;
        masterUserId = (rows[0] as any).master_user_id;
      }
    } else {
      const prefix = dto.identifier.split("-")[0];
      const [rows] = await masterPool.query(
        "SELECT db_name FROM organizations WHERE code = ?",
        [prefix]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        dbName = (rows[0] as any).db_name;
      }
    }

    if (globalRole === 'super_admin') {
      const isValid = await PasswordService.compare(dto.password, passwordHash || '');
      if (!isValid) throw new Error('Identifiants incorrects');
      
      const tokens = JwtService.generateTokenPair({
        userId: masterUserId as number,
        email: dto.identifier,
        userIdString: 'HQ-ADMIN',
        role_app: 'super_admin' as any,
        tenantDbName: 'clubmanager_master'
      } as any);
      
      return {
        success: true,
        message: 'Connexion super admin réussie',
        data: {
          user: {
            id: masterUserId as number,
            userId: 'HQ-ADMIN',
            first_name: 'Super',
            last_name: 'Admin',
            nom_utilisateur: 'SuperAdmin',
            email: dto.identifier,
            email_verified: true,
            status_id: 1,
            role_app: 'super_admin' as any,
          } as any,
          tokens
        }
      };
    }

    if (!dbName) {
      throw new Error("Identifiant ou club introuvable");
    }

    return tenantContext.run({ dbName, tenantId: null, isMaster: false }, async () => {
      const user = await this.authRepository.findUserByUserId(dto.identifier);
      if (!user) throw new Error("Identifiant ou mot de passe invalide");
      if (user.peut_se_connecter === false) throw new Error("Connexion directe désactivée.");
      if (!user.active) throw new Error("Account is disabled");
      if (user.deleted_at || user.anonymized) throw new Error("Account not found");

      if (!user.password) throw new Error("Identifiant ou mot de passe invalide");
      const isPasswordValid = await PasswordService.compare(dto.password, user.password);
      if (!isPasswordValid) throw new Error("Identifiant ou mot de passe invalide");

      const tokens = JwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        userIdString: user.userId,
        role_app: user.role_app ?? UserRole.MEMBER,
      });

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);
      await this.authRepository.storeRefreshToken(user.id, tokens.refreshToken, expiry);
      await this.authRepository.updateLastLogin(user.id);

      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            userId: user.userId,
            first_name: user.first_name,
            last_name: user.last_name,
            nom_utilisateur: user.nom_utilisateur,
            email: user.email,
            email_verified: user.email_verified,
            status_id: user.status_id,
            grade_id: user.grade_id,
            abonnement_id: user.abonnement_id,
            role_app: user.role_app ?? UserRole.MEMBER,
          },
          tokens,
        },
      };
    });
  }
}
