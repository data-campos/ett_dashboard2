// src/types/AuthenticatedRequest.ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    empresaId?: number; // Agora aceita undefined
    grupo_empresarial_id?: number; // Também opcional
    super_usuario: boolean;
  };
}
