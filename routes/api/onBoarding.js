const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Onboarding = require('../../models/Onboarding');
const { createOtp, isEmailValid, isPhoneValid } = require("../../utils/utils");
const axios = require('axios');
const bcrypt = require('bcryptjs')
const User = require("../../models/User");

router.get('/', auth, (req, res) => {
    try {
        Onboarding.find({ isPendingApproval: true })
            .then(resp => res.status(200).send(resp));
    } catch (error) {
        res.status(400);
    }
})

router.post('/', (req, res) => {
    const form = req.body;
    const origin = req.get('origin');
    const { email } = form;
    if (!isEmailValid(form.email)) {
        return res.status(400).json({ success: false, message: 'Invalid Email' })
    }
    if (!isPhoneValid(form.phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Invalid Phone Number' })
    }
    const otp = createOtp();
    const data = { ...form, origin, isPendingApproval: true, otp };
    const onbording = new Onboarding(data)
    onbording.save((err) => {
        if (err) {
            console.log(err);
            if (err.message.includes('email_1 dup')) {
                Onboarding.findOne({ email }, (err1, result) => {
                    if (result) {
                        const { status } = result;
                        res.status(403).json({ status: false, message: 'Your registration status is ' + status })
                    }
                })
            } else
                return res.status(400).json({ success: false, message: err.message });
        }
        else res.status(201).json({ success: true, message: 'Saved Successfully' });
    })
})

router.post('/approval', auth, (req, res) => {
    const { id, isApproved } = req.body;
    if (!id) {
        return res.status(404).json({ message: 'Id not provided' })
    }
    Onboarding.findById({ _id: id }, (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(404).json({ success: false, message: err.message })
        }
        const { otp, phoneNumber, email, origin } = result;
        if (isApproved) {
            axios.post('https://mail.freightdok.io/svm', { contact: phoneNumber, otp, email, origin })
                .then(() => {
                    // res.status(200).json({ success: true, message: 'Verification SMS sent' });
                    Onboarding.updateOne({ _id: id }, { isPendingApproval: false, status: isApproved ? 'Approved' : 'Denied' }, (err, result) => {
                        if (err) {
                            console.log('Error: ', err.message);
                            return res.status(400).json({ success: false, message: err.message })
                        }
                        return res.status(200).json({ success: true, message: 'Successfully Approved. SMS sent!' })
                    })
                })
                .catch(err => {
                    console.log('error sending messge', err.message);
                    return res.status(400).json({ success: false, message: 'Error sending SMS. Please try later' })
                })
        } else {
            Onboarding.updateOne({ _id: id }, { isPendingApproval: false, status: 'Denied' }, (err, result) => {
                if (err) {
                    console.log('Error: ', err.message);
                    return res.status(400).json({ success: false, message: err.message })
                }
                return res.status(200).json({ success: true, message: 'Successfully Declined' })
            })
        }
    })
})

router.delete('/:id', auth, (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.send(404)
    }
    Onboarding.findByIdAndDelete({ _id: id })
        .then(result => {
            if (result)
                res.status(200).json({ message: 'Deleted successfully!' });
        })
        .catch(err => console.log(err))
})

router.post('/validateOtp', (req, res) => {
    const { email } = req.body;
    Onboarding.findOne({ email }, (err, result) => {
        console.log(result)
        if (err) {
            res.status(400).json({ success: true, message: 'Something went wrong', dbError: err.message });
        } else {
            if (!result) {
                res.status(400).json({ success: true, message: 'Email not found' });
            }
            else res.sendStatus(200);
        }
    })
})

router.post('/register', (req, res) => {
    const { email, password, otp } = req.body;
    //Verify otp
    Onboarding.findOne({ email }, (err, result) => {
        if (err || !result) {
            res.status(400).json({ success: true, message: 'Email not found' });
        } else {
            const { otp: storeOtp, _id, dot, phoneNumber } = result;
            if (storeOtp !== otp) {
                // Throw error if otp does not matches.
                res.status(400).json({ success: false, message: 'Invalid OTP entered' });
            } else {
                //Update the table flag userRegistrationStatus to complete
                Onboarding.findByIdAndUpdate(_id, { userRegistrationStatus: 'Complete', }, (err, result) => {
                    if (err) {
                        return res.status(400).json({ success: false, message: err.message });
                    }
                    const salt = bcrypt.genSaltSync(10);
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) {
                            console.log('Error hashing password', err.message);
                        } else {
                            const user = new User({ email, password: hash, role: 'ownerOperator', dot, phone: phoneNumber })
                            user.save(err => {
                                if (err) {
                                    console.log(err.message);
                                    return res.status(400).json({ success: false, message: 'User not created', dbError: err.message })
                                }
                                res.status(201).json({ success: true, message: 'Registration Successful' });
                            })
                        }
                    });

                })
            }
        }
    })
})

module.exports = router;