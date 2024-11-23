// src/routes/dashboardRoutes.ts
import { Router } from 'express';
import { getDashboardData, getDashboardDataByGroup } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkPartnerAccess } from '../middlewares/checkPartnerAccess';
import { checkGroupAccess } from '../middlewares/checkGroupAccess';

const router = Router();

// Modificação simples para aceitar `coligadaId` como parâmetro opcional
router.get('/dashboard/:coligadaId?', authMiddleware, checkPartnerAccess, getDashboardData, checkGroupAccess);

router.get('/dashboard-by-group', authMiddleware, getDashboardDataByGroup);

export default router;
