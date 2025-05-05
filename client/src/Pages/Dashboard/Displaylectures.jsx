import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { deleteCourseLecture, getCourseLectures, updateCourseLecture } from "../../Redux/Slices/LectureSlice";

function Displaylectures() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const { lectures } = useSelector((state) => state.lecture);
    const { role } = useSelector((state) => state.auth);

    const [currentVideo, setCurrentVideo] = useState(0);
    const [editingLectureId, setEditingLectureId] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [lectureFile, setLectureFile] = useState(null);

    async function onLectureDelete(courseId, lectureId) {
        await dispatch(deleteCourseLecture({ courseId: courseId, lectureId: lectureId }));
        await dispatch(getCourseLectures(courseId));
    }

    async function onLectureUpdate(courseId, lectureId) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (lectureFile) formData.append("lecture", lectureFile);

        await dispatch(updateCourseLecture({
            courseId,
            lectureId,
            title,
            description,
            lecture: lectureFile
        }));
        
        await dispatch(getCourseLectures(courseId));
        setEditingLectureId(null); // close edit mode
        setTitle("");
        setDescription("");
        setLectureFile(null);
    }

    function startEditing(lecture) {
        setEditingLectureId(lecture._id);
        setTitle(lecture.title);
        setDescription(lecture.description);
        setLectureFile(null);
    }

    useEffect(() => {
        if (!state) navigate("/courses");
        dispatch(getCourseLectures(state._id));
    }, []);

    return (
        <HomeLayout>
            <div className="flex flex-col gap-10 items-center justify-center min-h-[90vh] py-10 text-wihte mx-[5%]">
                <div className="text-center text-2xl font-semibold text-yellow-500">
                    Course Name: {state?.title}
                </div>

                {(lectures && lectures.length > 0) ? (
                    <div className="flex justify-center gap-10 w-full">
                        {/* left section for playing videos */}
                        <div className="space-y-5 w-[28rem] p-2 rounded-lg shadow-[0_0_10px_black]">
                            <video
                                src={lectures && lectures[currentVideo]?.lecture?.secure_url}
                                className="object-fill rounded-tl-lg rounded-tr-lg w-full"
                                controls
                                disablePictureInPicture
                                muted
                                controlsList="nodownload"
                            ></video>
                            <div>
                                <h1>
                                    <span className="text-yellow-500"> Title: </span>
                                    {lectures && lectures[currentVideo]?.title}
                                </h1>
                                <p>
                                    <span className="text-yellow-500 line-clamp-4">
                                        Description: 
                                    </span>
                                    {lectures && lectures[currentVideo]?.description}
                                </p>
                            </div>
                        </div>

                        {/* right section for list of lectures */}
                        <ul className="w-[28rem] p-2 rounded-lg shadow-[0_0_10px_black] space-y-4">
                            <li className="font-semibold text-xl text-yellow-500 flex items-center justify-between">
                                <p>Lectures list</p>
                                {role === "ADMIN" && (
                                    <button onClick={() => navigate("/course/addlecture", { state: { ...state } })} className="btn-primary px-2 py-1 rounded-md font-semibold text-sm text-gray-500">
                                        Add new lecture
                                    </button>
                                )}
                            </li>

                            {lectures && lectures.map((lecture, idx) => (
                                <li className="space-y-2" key={lecture._id}>
                                    <p className="cursor-pointer" onClick={() => setCurrentVideo(idx)}>
                                        <span> Lecture {idx + 1}: </span>
                                        {lecture?.title}
                                    </p>

                                    {role === "ADMIN" && (
                                        <div className="flex gap-2">
                                            <button onClick={() => onLectureDelete(state?._id, lecture?._id)} className="btn-accent px-2 py-1 rounded-md font-semibold text-sm text-green-500">
                                                Delete
                                            </button>

                                            <button onClick={() => startEditing(lecture)} className="btn-primary px-2 py-1 rounded-md font-semibold text-sm text-blue-500">
                                                Edit
                                            </button>
                                        </div>
                                    )}

                                    {/* Show Update Form for selected lecture */}
                                    {editingLectureId === lecture._id && (
                                        <form onSubmit={(e) => { e.preventDefault(); onLectureUpdate(state._id, lecture._id); }} className="mt-2 flex flex-col gap-2">
                                            <input
                                                type="text"
                                                placeholder="New title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="p-2 border rounded"
                                            />
                                            <textarea
                                                placeholder="New description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="p-2 border rounded"
                                            ></textarea>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setLectureFile(e.target.files[0])}
                                            />
                                            <button type="submit" className="btn-primary p-2 rounded bg-green-500 text-white">
                                                Save Changes
                                            </button>
                                        </form>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    role === "ADMIN" && (
                        <button onClick={() => navigate("/course/addlecture", { state: { ...state } })} className="btn-primary px-2 py-1 rounded-md font-semibold text-sm text-green-500">
                            Add new lecture
                        </button>
                    )
                )}
            </div>
        </HomeLayout>
    );
}

export default Displaylectures;
