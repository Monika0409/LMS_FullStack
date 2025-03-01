import { Router } from "express";
import { allPayments, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from "../controllers/payment.controller.js";
import { authorizedSubscriber, authorizedUser, isLoggedIn } from "../middlewares/auth.middleware.js";


const router = Router()

router.get('/razorpay-key', isLoggedIn, getRazorpayApiKey);
router.post('/subscribe', isLoggedIn, buySubscription)
router.post('/verify', isLoggedIn, verifySubscription)
router.post('/unsubscribe', isLoggedIn, authorizedSubscriber, cancelSubscription)
router.get('/', isLoggedIn, authorizedUser('ADMIN'), allPayments)

export default router;
