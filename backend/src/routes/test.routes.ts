import { Router } from 'express';
import { getTests, getTestById, submitTestResult } from '../controllers/testController';

const router = Router();

router.get('/', getTests);
router.get('/:id', getTestById);
router.post('/:id/submit', submitTestResult);

export default router;
