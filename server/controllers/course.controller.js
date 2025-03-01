import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js"
import cloudinary from 'cloudinary'
import fs from 'fs/promises'


const getAllCourses = async (req, res, next) => {
    try {
        const course = await Course.find({}).select('-lectures')

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        
        res.status(200).json({
            success: true,
            message: "All Courses ",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params
        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        res.status(200).json({
            success: true,
            message: "Course lecture fetched successfully",
            lectures: course.lectures
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, createdBy } = req.body

        if (!title || !description || !category || !createdBy ) {
            return next(new AppError('All Fields are required', 400))
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: 'Dummy',
                secure_url: 'Dummy'
            }
        })

        if (!course) {
            return next(new AppError('Course is not created', 500))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            })

            if (result) {
                course.thumbnail.public_id = result.public_id
                course.thumbnail.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        await course.save()

        res.status(200).json({
            success: true,
            message: "Course created successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            {
                runValidators: true
            }
        );

        if(!course){
            return next(
                new AppError('Course with given id does not exist' , 500)
            )
        }

        await course.save()
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params

        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        await Course.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const addLectureToCourseById = async (req, res, next) => {

    try {
        const { id } = req.params

        const { title, description } = req.body

        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        if (!title || !description) {
            return next(new AppError('All fields are required', 400))
        }

        const lectureData = {
            title,
            description,
            lecture: {
                public_id: '',
                secure_url: '',
            }
        }

        if (!lectureData) {
            return next(new AppError('Failed to save lecture', 400))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: 'video'
            })

            if (result) {
                lectureData.lecture.public_id = result.public_id
                lectureData.lecture.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        course.lectures.push(lectureData)
        course.numberOfLecture = course.lectures.length

        await course.save()

        res.status(200).json({
            success: true,
            message: "Lectures successfully added to the course",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const updateLecture = async (req, res, next) => {
    try {
        const { id } = req.params
        const { lectureId } = req.params

        const { title, description } = req.body

        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        if (title) {
            course.lectures[lectureIndex].title = await title
        }

        if (description) {
            course.lectures[lectureIndex].description = await description
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                resource_type: 'video'
            })

            if (result) {
                course.lectures[lectureIndex].lecture.public_id = result.public_id
                course.lectures[lectureIndex].lecture.secure_url = result.secure_url
            }
            fs.rm(`uploads/${req.file.filename}`)
        }

        await course.save()

        res.status(200).json({
            success: true,
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const deleteLecture = async (req, res, next) => {
    try {
        const { id } = req.params
        const { lectureId } = req.params

        const course = await Course.findById(id)

        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
                resource_type: 'video',
            }
        );

        course.lectures.splice(lectureIndex, 1)
        course.numberOfLecture = course.lectures.length

        await course.save()

        res.status(200).json({
            status: true,
            message: "Lecture deleted successfully",
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


export{
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    updateLecture,
    deleteLecture
}