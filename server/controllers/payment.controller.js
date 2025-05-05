import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/error.util.js"
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const getRazorpayApiKey = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay API key",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError('Unauthorized, Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot purchase subscription', 400))
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID, // The unique plan ID
            customer_notify: 1,
            total_count: 12,
        });

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();
        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            subscription_id: subscription.id
        })
    } catch (e) {
        console.error(e);
        return next(new AppError(e.message, 500))
    }
}


const verifySubscription = async (req, res, next) => {
    try {
        const { id } = req.user
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        const subscriptionId = user.subscription.id
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment Unsuccessfull! Please try again', 400))
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        user.subscription.status = 'active'
        await user.save()

        res.status(200).json({
            success: true,
            message: "Verified successfully",
            subscription: user.subscription
        })

    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot cancel subscription', 400))
        }

        const subscriptionId = user.subscription.id
        const subscription = await razorpay.subscriptions.cancel(subscriptionId)

        user.subscription.status = subscription.status
        await user.save()

        res.status(200).json({
            success: true,
            message: "Subscription cancelled!"
        })

    } catch (error) {
        return next(new AppError(error.error, error.statusCode))
    }
}


const allPayments = async (req, res, next) => {
    try {
        const { count, skip } = req.query

        const subscription = await razorpay.subscriptions.all({
            count: count ? count : 100,
            skip: skip ? skip : 0
        })

        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        const monthlyWisePayments = subscription.items.map((payment) => {
            const monthsInNumbers = new Date(payment.start_at * 1000);
            return monthNames[monthsInNumbers.getMonth()];
        });

        monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if (month === objMonth) {
                    finalMonths[month] += 1;
                }
            });
        });

        const monthlySalesRecord = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
        });

        res.status(200).json({
            success: true,
            message: 'All payments',
            subscription,
            finalMonths,
            monthlySalesRecord,
        });
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


export {
    getRazorpayApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    allPayments,
} 