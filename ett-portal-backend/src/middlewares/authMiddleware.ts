import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { Usuario } from '../models/Usuario';
import { AppDataSource } from '../data-source';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      empresaId?: number;
      grupo_empresarial_id?: number;
      super_usuario: boolean;
    };

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({ where: { id: decoded.userId } });

    if (!usuario) {
      res.status(401).json({ message: 'Usuário não encontrado' });
      return;
    }

    if (usuario.sessionExpiration && new Date() > new Date(usuario.sessionExpiration)) {
      res.status(401).json({ message: 'Sessão expirada, faça login novamente' });
      return;
    }

    if (!usuario.super_usuario && !usuario.grupo_empresarial?.id) {
      res.status(403).json({ message: 'Acesso negado. Grupo empresarial não identificado.' });
      return;
    }

    req.user = {
      userId: usuario.id,
      empresaId: usuario.empresa?.id,
      grupo_empresarial_id: usuario.grupo_empresarial?.id,
      super_usuario: usuario.super_usuario,
    };
    
    console.log("Usuário recuperado no middleware:", usuario);
    console.log("Grupo empresarial ID:", usuario.grupo_empresarial?.id);
    console.log("Super usuário:", usuario.super_usuario);
    console.log("Payload do token:", decoded);


    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
