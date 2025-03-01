import mongoose from "mongoose";
import dotenv from 'dotenv';
mongoose.set('strictQuery', false)
dotenv.config();

const connectionToDB = async () => {
    try {
        const { connection } = await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms'
        )
        if (connection) {
            console.log(`connected to MONGODB : ${connection.host}`)
        }
    }

    catch (err) {
        console.log(err)
        process.exit(1)
    }
}

export default connectionToDB