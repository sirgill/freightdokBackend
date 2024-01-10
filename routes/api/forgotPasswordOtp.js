const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require('bcryptjs');
const { default: axios } = require("axios");
const ForgotPasswordOtp = require('../../models/forgotPasswordOtp');
const { isEmailValid, createOtp, sendJson } = require("../../utils/utils");

const url = 'http://localhost:9999/sendForgotPasswordOtpMail'// 'https://mail.freightdok.io/sendForgotPasswordOtpMail'
// send OTP to mail server
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email && !isEmailValid(email)) {
        return res.status(400).json({ message: 'Invalid Email' })
    }

    const userExists = await User.checkUserExistsByEmail(email);

    if (!userExists) {
        return res.status(404).json({ message: 'User Not Found' })
    }

    const otp = createOtp();
    const forgotPassword = new ForgotPasswordOtp({ otp, email, expired: false })

    axios.post(url, { email, otp })
        .then(async resp => {
            console.log('OTP sent to', email);
            await forgotPassword.save();
            return res.status(resp.status).json({ message: 'OTP sent' });
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).json(sendJson(false, 'Error Sending OTP. Please try later.'));
        })
})

router.put('/', (req, res) => {
    const { newPass, confirmPass, otp, email } = req.body;

    if (newPass !== confirmPass) {
        return res.status(400).json({ message: 'Passwords do not match' })
    }

    ForgotPasswordOtp.findOneAndDelete({ otp }, (err, result) => {
        if (err || !result) {
            res.status(400).json({ message: 'OTP Invalid' });
            return console.log(err)
        } else {
            const salt = bcrypt.genSaltSync(10);
            const password = bcrypt.hashSync(newPass, salt);
            User.findOneAndUpdate({ email }, { password }, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Error saving New Password. Please try again" });
                } else if (result)
                    res.status(201).json({ message: 'Password Changed Successfully' });
                else {
                    res.status(404).json({ message: 'Email not found' })
                }
            })
        }
    })
})

module.exports = router;