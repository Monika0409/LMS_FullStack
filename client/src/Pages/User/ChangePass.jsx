import { useState } from "react";
import { useDispatch } from "react-redux";
import { changePassword } from "../../Redux/Slices/AuthSlice";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import HomeLayout from "../../Layouts/HomeLayout";

function ChangePassword() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: ""
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.oldPassword || !formData.newPassword) {
            toast.error("All fields are required!");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters!");
            return;
        }

        try {
            const res = await dispatch(changePassword(formData)).unwrap();
            toast.success(res.message || "Password changed successfully!");
            navigate("/user/profile");
        } catch (err) {
            toast.error(err?.payload?.message || "Password change failed!");
        }
    }

    return (
        <HomeLayout>
            <div className="flex items-center justify-center h-[90vh]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 bg-gray-800 p-8 rounded-lg shadow-lg text-white w-96"
                >
                    <h1 className="text-2xl font-bold text-center">Change Password</h1>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="oldPassword" className="font-semibold">Old Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            id="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            className="bg-transparent border px-3 py-2 rounded-md"
                            placeholder="Enter old password"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="newPassword" className="font-semibold">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="bg-transparent border px-3 py-2 rounded-md"
                            placeholder="Enter new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-yellow-600 hover:bg-yellow-500 transition-all py-2 rounded-md font-semibold"
                    >
                        Change Password
                    </button>

                    <Link to="/user/profile" className="text-accent text-center underline">
                        Go back to profile
                    </Link>
                </form>
            </div>
        </HomeLayout>
    );
}

export default ChangePassword;
