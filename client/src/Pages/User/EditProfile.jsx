import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsPersonCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getUserData, updateProfile } from "../../Redux/Slices/AuthSlice";

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state?.auth?.data);

    const [data, setData] = useState({
        previewImage: user?.avatar?.secure_url || "",
        fullName: user?.fullName || "",
        avatar: undefined,
        userId: user?._id
    });

    function handleImageUpload(e) {
        const uploadedImage = e.target.files[0];
        if(uploadedImage) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(uploadedImage);
            fileReader.onloadend = function () {
                setData(prev => ({
                    ...prev,
                    previewImage: fileReader.result,
                    avatar: uploadedImage
                }));
            }
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function onFormSubmit(e) {
        e.preventDefault();

        if(!data.fullName) {
            toast.error("Full name is required!");
            return;
        }
        if(data.fullName.length < 3) {
            toast.error("Name must be at least 3 characters!");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", data.fullName);
        if (data.avatar) {
            formData.append("avatar", data.avatar);
        }

        await dispatch(updateProfile([data.userId, formData]));
        await dispatch(getUserData());

        navigate("/user/profile");
    }

    return (
        <HomeLayout>
            <div className="flex items-center justify-center h-[100vh]">
                <form
                    onSubmit={onFormSubmit}
                    className="flex flex-col justify-center gap-5 rounded-lg p-4 text-white w-80 min-h-[26rem] shadow-[0_0_10px_black]"
                >
                    <h1 className="text-center text-2xl font-semibold">Edit Profile</h1>

                    <label className="cursor-pointer" htmlFor="image_uploads">
                        {data.previewImage ? (
                            <img 
                                className="w-28 h-28 rounded-full m-auto"
                                src={data.previewImage}
                                alt="Profile Preview"
                            />
                        ) : (
                            <BsPersonCircle className="w-28 h-28 rounded-full m-auto" />
                        )}
                    </label>

                    <input 
                        type="file"
                        id="image_uploads"
                        name="image_uploads"
                        accept=".jpg, .jpeg, .png, .svg"
                        className="hidden"
                        onChange={handleImageUpload}
                    />

                    <div className="flex flex-col gap-1">
                        <label htmlFor="fullName" className="text-lg font-semibold">Full Name</label>
                        <input 
                            type="text"
                            name="fullName"
                            id="fullName"
                            value={data.fullName}
                            onChange={handleInputChange}
                            className="bg-transparent px-2 py-1 border"
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300 rounded-sm py-2 text-lg cursor-pointer">
                        Update Profile
                    </button>

                    <Link to="/user/profile">
                        <p className="link text-accent cursor-pointer flex items-center justify-center w-full gap-2">
                            <AiOutlineArrowLeft /> Go back to profile
                        </p>
                    </Link>
                </form>
            </div>
        </HomeLayout>
    );
}

export default EditProfile;
