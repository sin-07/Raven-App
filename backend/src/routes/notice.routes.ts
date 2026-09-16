import { Router } from 'express';
import { getNotices } from '../controllers/noticeController';

const router = Router();

router.get('/', getNotices);

export default router;
