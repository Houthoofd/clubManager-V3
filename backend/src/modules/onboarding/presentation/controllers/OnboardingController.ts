import { Request, Response } from 'express';
import { ProvisionTenantUseCase } from '../../application/useCases/ProvisionTenantUseCase';

export class OnboardingController {
  private provisionTenantUseCase: ProvisionTenantUseCase;

  constructor() {
    this.provisionTenantUseCase = new ProvisionTenantUseCase();
  }

  public provision = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.provisionTenantUseCase.execute(req.body);
      res.status(201).json({
        message: 'Tenant provisioned successfully',
        data: result
      });
    } catch (error: any) {
      console.error('[OnboardingController] Error:', error);
      res.status(500).json({ 
        message: 'An error occurred during provisioning', 
        error: error.message 
      });
    }
  };
}
