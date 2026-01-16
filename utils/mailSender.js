// Utility function for sending emails using Nodemailer
const nodemailer = require('nodemailer');

// Reuse transporter across calls to avoid repeated connection setup
let transporter;
function getTransporter() {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
        secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        pool: true
    });

    return transporter;
}

const mailSender = async (email, title, body) => {
    try {
        const tx = getTransporter();

        const info = await tx.sendMail({
            from: '<' + process.env.MAIL_USER + '>',
            to: email,
            subject: title,
            html: body
        });

        return info;
    } catch (error) {
        throw new Error('Error while sending mail: ' + error.message);
    }
}

module.exports = mailSender;