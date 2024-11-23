/*import { Router } from 'express';
import { getFuncionarios } from '../controllers/funcionarioController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/funcionarios/:codColigada', authMiddleware, getFuncionarios);

export default router;*/

import { Router } from 'express';
import { getFuncionarios } from '../controllers/funcionarioController';

const router = Router();

router.get('/funcionarios', getFuncionarios);

export default router;

