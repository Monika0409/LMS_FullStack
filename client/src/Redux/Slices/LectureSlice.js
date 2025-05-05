import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosInstance";

const initialState = {
    lectures: []
}


export const getCourseLectures = createAsyncThunk("/course/lecture/get", async (cid) => {
    try {
        const response = axiosInstance.get(`/courses/${cid}`);
        toast.promise(response, {
            loading: "Fetching course lectures",
            success: "Lectures fetched successfully",
            error: "Failed to load the lectures"
        });
        return (await response).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
});

export const addCourseLecture = createAsyncThunk("/course/lecture/add", async (data) => {
    try {
        const formData = new FormData();
        formData.append("lecture", data.lecture);
        formData.append("title", data.title);
        formData.append("description", data.description);

        const responsePromise = axiosInstance.post(`/courses/${data.id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true, // if using cookies/sessions
        });

        const response = await toast.promise(responsePromise, {
            loading: "Adding course lecture...",
            success: "Lecture added successfully!",
            error: "Failed to add the lecture",
        });

        return response.data;

    } catch(error) {
        toast.error(error?.response?.data?.message);
        throw error;
    }
});

export const deleteCourseLecture = createAsyncThunk("/course/lecture/delete", async (data) => {
    try {
        const response = axiosInstance.delete(`/courses/${data.courseId}/lecture/${data.lectureId}`);
        toast.promise(response, {
            loading: "Deleting course lecture...",
            success: "Lecture deleted successfully!",
            error: "Failed to delete the lecture.",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
    }
});

export const updateCourseLecture = createAsyncThunk("/course/lecture/update", async (data) => {
    try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        if (data.lecture) {
            formData.append("lecture", data.lecture); // new video (optional)
        }

        const response = axiosInstance.put(`/courses/${data.courseId}/lecture/${data.lectureId}`, formData);
        
        toast.promise(response, {
            loading: "Updating course lecture...",
            success: "Lecture updated successfully!",
            error: "Failed to update the lecture",
        });

        return (await response).data;

    } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
    }
});


const lectureSlice = createSlice({
    name: "lecture",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getCourseLectures.fulfilled, (state, action) => {
            console.log(action);
            state.lectures = action?.payload?.lectures;
        })
        .addCase(addCourseLecture.fulfilled, (state, action) => {
            console.log(action);
            state.lectures = action?.payload?.course?.lectures;
        })
    }
});

export default lectureSlice.reducer;