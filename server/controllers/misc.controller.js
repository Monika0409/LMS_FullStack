
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import sendEmail from '../utils/sendEmail.js'



export const contactUs = async (req, res, next) => {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
        return next(new AppError('All fields are required', 401))
    }
    try {
        const subject = 'Contact Us Form';
        const textMessage = `${name} - ${email} <br /> ${message}`;

        await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);

        res.status(200).json({
            success: true,
            message: 'Your request has been submitted successfully',
        });
    } catch (error) {
        return next(new AppError(error.message, 400));
    }


}


export const userStats = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments()

        const subscribedUser = await User.countDocuments({
            'subscription.status': 'active'
        })

        res.status(200).json({
            success: true,
            message: 'Users Stats',
            usersCount,
            subscribedUser,
        })
    } catch (e) {
        return next(new AppError(e.message, 400));
    }
}