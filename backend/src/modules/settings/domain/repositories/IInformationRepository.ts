/**
 * IInformationRepository
 * Interface du repository informations (Domain Layer)
 * Contrat pour les opérations de gestion des paramètres en base de données
 */

import type {
  Information,
  CreateInformation,
  UpdateInformation,
  InformationsListResponse,
  ListInformationsQuery,
} from '@clubmanager/types';

export interface IInformationRepository {
  findAll(query: ListInformationsQuery): Promise<InformationsListResponse>;
  findByKey(cle: string): Promise<Information | null>;
  findById(id: number): Promise<Information | null>;
  create(data: CreateInformation): Promise<Information>;
  update(id: number, data: UpdateInformation): Promise<Information>;
  upsert(data: CreateInformation): Promise<Information>;
  bulkUpsert(informations: CreateInformation[]): Promise<Information[]>;
  delete(id: number): Promise<void>;
  keyExists(cle: string): Promise<boolean>;
}
