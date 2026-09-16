import { Router } from 'express';
import { submitAdmission } from '../controllers/admissionController';

const router = Router();

router.post('/submit', submitAdmission);
router.post('/', submitAdmission);

export default router;
