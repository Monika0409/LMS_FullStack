
import { model, Schema } from 'mongoose';

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [5, 'Title must be at least 5 characters'],
        maxLength: [59, 'Title should be less than 60 characters'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minLength: [5, 'Description must be at least 200 characters'],
        maxLength: [500, 'Description should be less than 500 characters'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    lectures: [
        {
            title: {
                type: String,
                required: [true, 'Title is required'],
                minLength: [8, 'Title must be at least 8 characters'],
                maxLength: [100, 'Title should be less than 100 characters'],
                trim: true,
            },
            description: {
                type: String,
                required: [true, 'Description is required'],
                minLength: [5, 'Description must be at least 30 characters'],
                maxLength: [400, 'Description should be less than 400 characters'],
                trim: true,
            },
            lecture: {
                public_id: {
                    type: String,
                    required: true
                },
                secure_url: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Course = model('Course', courseSchema);

export default Course;