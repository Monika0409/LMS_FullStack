import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = req.cookies; // Ensure token is sent in cookies

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized! Please login again",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT token

        req.user = await User.findById(decoded.id).select("-password"); // Attach user to request
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again",
            });
        }

        next(); // Move to next middleware
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token! Please login again",
        });
    }
}

const authorizedUser = (...role) => async (req, res, next) => {
    const userRole = await req.user.role

    if (!role.includes(userRole)) {
        return next(new AppError('Unauthenticated! You dont have permission to change this', 404))
    }

    next()
}

const authorizedSubscriber = async (req, res, next) => {

    const user = await User.findById(req.user.id)
    const subscription = user.subscription.status
    const role = user.role

    if (subscription !== 'active' && role !== 'ADMIN') {
        return next(new AppError('Unauthenticated! You dont have permission to access this. please subscribe', 404))
    }

    next()
}

export { isLoggedIn , authorizedUser, authorizedSubscriber}