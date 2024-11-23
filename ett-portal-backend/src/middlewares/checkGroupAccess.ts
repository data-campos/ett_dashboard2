// src/middlewares/checkGroupAccess.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { AppDataSource } from '../data-source';

export const checkGroupAccess = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { grupo_empresarial_id, super_usuario } = req.user || {};
  
    // Permite acesso irrestrito para super usuários
    if (super_usuario) {
      return next();
    }
  
    if (!grupo_empresarial_id) {
      res.status(403).json({ message: 'Acesso negado. Grupo empresarial não identificado.' });
      return;
    }
  
    try {
      const result = await AppDataSource.query(
        'SELECT id FROM grupo_empresarial WHERE id = ? AND status_acesso = true',
        [grupo_empresarial_id]
      );
  
      if (result.length === 0) {
        res.status(403).json({ message: 'Acesso desativado para este grupo empresarial.' });
        return;
      }
  
      req.body.grupo_empresarial_id = grupo_empresarial_id; // Passa o ID para uso posterior
      next();
    } catch (error) {
      console.error('Erro ao verificar acesso ao grupo empresarial:', error);
      res.status(500).json({ message: 'Erro ao verificar acesso' });
    }
  };
  
