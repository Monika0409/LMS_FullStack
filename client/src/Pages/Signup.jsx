import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsPersonCircle } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { isEmail, isValidPassword } from '../Helpers/regexMatcher';
import HomeLayout from '../Layouts/HomeLayout';
import { createAccount } from '../Redux/Slices/AuthSlice';

function Signup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [previewImage, setPreviewImage] = useState("");
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        password: "",
        avatar: "",
        role: "USER",    // Default Role
    });

    function handleUserInput(e) {
        const { name, value } = e.target;
        setSignupData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function getImage(event) {
        const uploadedImage = event.target.files[0];
        if (uploadedImage) {
            setSignupData(prev => ({
                ...prev,
                avatar: uploadedImage
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(uploadedImage);
        }
    }

    async function createNewAccount(event) {
        event.preventDefault();

        const { fullName, email, password, avatar, role } = signupData;

        if (!fullName || !email || !password || !avatar) {
            toast.error("Please fill all the fields");
            return;
        }
        if (fullName.length < 5) {
            toast.error("Name must be at least 5 characters");
            return;
        }
        if (!isEmail(email)) {
            toast.error("Invalid email address");
            return;
        }
        if (!isValidPassword(password)) {
            toast.error("Password should be 6-16 characters with number and special character");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("avatar", avatar);
        formData.append("role", role);

        try {
            const response = await dispatch(createAccount(formData));

            if (response?.payload?.success) {
                toast.success("Account created successfully!");
                navigate("/");
            } else {
                toast.error(response?.payload?.message || "Signup failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }

        setSignupData({
            fullName: "",
            email: "",
            password: "",
            avatar: "",
            role: "USER"
        });
        setPreviewImage("");
    }

    return (
        <HomeLayout>
            <div className='flex overflow-x-auto items-center justify-center h-[100vh]'>
                <form noValidate onSubmit={createNewAccount} className='flex flex-col gap-4 rounded-lg p-6 text-white w-96 shadow-[0_0_10px_black]'>
                    <h1 className="text-center text-2xl font-bold">Registration</h1>

                    <label htmlFor="image_uploads" className="cursor-pointer self-center">
                        {previewImage ? (
                            <img src={previewImage} alt="avatar" className="w-24 h-24 rounded-full" />
                        ) : (
                            <BsPersonCircle className="w-24 h-24" />
                        )}
                    </label>
                    <input
                        onChange={getImage}
                        type="file"
                        id="image_uploads"
                        name="image_uploads"
                        className="hidden"
                        accept="image/*"
                    />

                    {/* Full Name */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="fullName" className="font-semibold">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="Enter your full name"
                            className="bg-transparent px-2 py-1 border"
                            value={signupData.fullName}
                            onChange={handleUserInput}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="font-semibold">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            className="bg-transparent px-2 py-1 border"
                            value={signupData.email}
                            onChange={handleUserInput}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="font-semibold">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            className="bg-transparent px-2 py-1 border"
                            value={signupData.password}
                            onChange={handleUserInput}
                            required
                        />
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="role" className="font-semibold">Select Role</label>
                        <select
                            id="role"
                            name="role"
                            className="bg-transparent px-2 py-1 border"
                            value={signupData.role}
                            onChange={handleUserInput}
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="mt-4 bg-yellow-600 hover:bg-yellow-500 rounded-md py-2 font-semibold text-lg transition-all"
                    >
                        Create Account
                    </button>

                    <p className="text-center">
                        Already have an account?{" "}
                        <Link to="/login" className="text-yellow-400 hover:underline">Login</Link>
                    </p>
                </form>
            </div>
        </HomeLayout>
    );
}

export default Signup;
