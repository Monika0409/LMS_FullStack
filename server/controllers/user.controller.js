import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"
import cloudinary from 'cloudinary';
import fs from 'fs/promises'
import bcrypt from 'bcryptjs'
import sendEmail from "../utils/sendEmail.js"
import crypto from 'crypto'
import validator from 'validator';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'None',
}

const register = async (req, res, next) => {
    try {
        const { fullName, email, password, role } = req.body; // role is coming

        if (!fullName || !email || !password) {
            return next(new AppError('All fields are required', 400));
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            return next(new AppError('Email already registered', 409));
        }

        const user = await User.create({
            fullName,
            email,
            password,
            role: role || 'USER', // 👈 if no role, default to USER
            avatar: {
                publicId: '',
                secure_url: 'https://res.cloudinary.com/dvg8cjdil/image/upload/apj.jpg'
            }
        });

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill',
                });
                user.avatar.publicId = result.public_id;
                user.avatar.secure_url = result.secure_url;
            } catch (err) {
                return next(new AppError('Avatar upload failed', 500));
            }
        }

        await user.save(); // Save updated avatar if uploaded
        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions);

        user.password = undefined;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                role: user.role,    // 👈 sending role back
            }
        });

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Email and Password are required', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('Invalid Email or Password', 401));
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new AppError('Invalid Email or Password', 401));
        }

        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                avatar: user.avatar,
                role: user.role,  // 👈 send role to frontend after login
            }
        });

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};


const logout = (req, res) => {
    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        });
        res.status(200).json({ success: true, message: "User Logged out successfully" })
    }
    catch (e) {
        return res.status(500).json({ success: false, message: e.message })
    }
}

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        res.status(200).json({
            success: true,
            message: "User Details",
            user
        });
    }
    catch (err) {
        return next(new AppError("Failed to fetch profile" + err.message, 500))
    }
};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError("Email is Required", 400))
    }

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError("Email is not registered", 400))
    }

    const resetToken = await user.generatePasswordResetToken()
    await user.save()

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    console.log(resetPasswordURL)
    const subject = 'Reset Password'
    const message = `Reset your Password by clicking on this link <a href=${resetPasswordURL}>Reset Password</a>`


    try {
        await sendEmail(email, subject, message)

        res.status(200).json({
            success: true,
            message: `Password reset link has been sent to your ${email}`
        })


    } catch (e) {
        user.forgetPasswordExpiry = undefined
        user.forgetPasswordToken = undefined

        await user.save()
        return next(new AppError(e.message, 500))
    }

}

const resetPassword = async (req, res, next) => {
    try {

        const { resetToken } = req.params;

        const { password } = req.body

        const forgetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            forgetPasswordToken,
            forgetPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return next(new AppError('Token is Invalid or expired! please resend it', 400))
        }

        if (!password) {
            return next(new AppError('Please Enter new Password', 400))
        }

        user.password = password;
        user.forgetPasswordToken = undefined
        user.forgetPasswordExpiry = undefined

        await user.save()

        res.status(200).json({
            success: true,
            message: 'Password reset successfull'
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }

}

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both old and new password are required." });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Old password is incorrect." });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully!" });

    } catch (error) {
        console.error("Error changing password", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}

const updateUser = async (req, res, next) => { 
    try {
        const { id } = req.params;
        const { fullName } = req.body;
    
        const user = await User.findById(id);
    
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
    
        if (fullName) user.fullName = fullName;
    
        if (req.file) {
          // Delete old avatar if exists
          if (user.avatar && user.avatar.url) {
            fs.unlink(user.avatar.url, (err) => {
              if (err) console.error("Failed to delete old avatar:", err);
            });
          }
    
          // Update new avatar
          user.avatar = {
            public_id: req.file.filename,
            url: req.file.path.replace(/\\/g, "/"),
          };
        }
    
        await user.save();
    
        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          user,
        });
    
      } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
      }
}


export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}