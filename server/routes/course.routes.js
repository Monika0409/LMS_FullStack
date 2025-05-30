
import { Router } from 'express';
import { addLectureToCourseById, createCourse, deleteLecture, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse, updateLecture } from '../controllers/course.controller.js';
import { authorizedSubscriber, authorizedUser, isLoggedIn } from '../middlewares/auth.middleware.js';
import Upload  from '../middlewares/multer.middleware.js';



const router = Router();

router
  .route('/')
  .get(getAllCourses)
  .post(isLoggedIn, authorizedUser('ADMIN'), Upload.single('thumbnail'), createCourse);

router
  .route('/:id')
  .get(isLoggedIn, authorizedSubscriber, getLecturesByCourseId)
  .put(isLoggedIn, Upload.single('thumbnail'), authorizedUser('ADMIN'), updateCourse)
  .delete(isLoggedIn, authorizedUser('ADMIN'), removeCourse)
  .post(Upload.single('lecture'), isLoggedIn, authorizedUser('ADMIN'), addLectureToCourseById);

router
  .route('/:courseId/lecture/:lectureId')
  .put(isLoggedIn, authorizedUser('ADMIN'), Upload.single('lecture'), updateLecture)
  .delete(isLoggedIn, authorizedUser('ADMIN'), deleteLecture);



export default router;

