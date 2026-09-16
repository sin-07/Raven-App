import { Router } from 'express';
import { getCourses, getCourseById } from '../controllers/courseController';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);

export default router;
