import { Router } from 'express';
import { authenticateStudent } from '../middleware/auth';
import {
  getStudentLiveClasses,
  getStudentStudyMaterials,
  getStudentCourses,
} from '../controllers/studentController';

const router = Router();

router.use(authenticateStudent);

router.get('/live-classes', getStudentLiveClasses);
router.get('/study-materials', getStudentStudyMaterials);
router.get('/courses', getStudentCourses);

export default router;
