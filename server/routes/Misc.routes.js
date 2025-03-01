
import { Router } from "express";

import { isLoggedIn, authorizedUser } from "../middlewares/auth.middleware.js";
import { contactUs, userStats } from "../controllers/misc.controller.js";

const router = Router();

router.route('/admin/stats').get(isLoggedIn, authorizedUser('ADMIN'), userStats);
router.post('/contact', contactUs)

export default router;