import nodemailer from 'nodemailer'


const sendEmail = async function (email, subject, message) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: false,
        auth: {
            user: process.env.SMPT_USERNAME,
            pass: process.env.SMPT_PASSWORD
        }
    });

   
    await transporter.sendMail({
        from: process.env.SMPT_FROM_EMAIL, 
        to: email, 
        subject: subject, 
        html: message,
    });
}

export default sendEmail;

