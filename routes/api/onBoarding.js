const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Onboarding = require('../../models/Onboarding');
const { createOtp, isEmailValid, isPhoneValid } = require("../../utils/utils");
const axios = require('axios');

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
    const { email } = form;
    if (!isEmailValid(form.email)) {
        return res.status(400).json({ success: false, message: 'Invalid Email' })
    }
    if (!isPhoneValid(form.phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Invalid Phone Number' })
    }
    const otp = createOtp();
    const data = { ...form, isPendingApproval: true, otp };
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
        const { otp, phoneNumber, email } = result;
        if (isApproved) {
            axios.post('https://mail.freightdok.io/svm', { contact: phoneNumber, otp, email })
                .then(() => {
                    res.status(200).json({ success: true, message: 'Verification SMS sent' });
                    Onboarding.updateOne({ _id: id }, { isPendingApproval: false, status: isApproved ? 'Approved' : 'Denied' }, (err, result) => {
                        if (err) {
                            console.log('Error: ', err.message);
                            return res.status(400).json({ success: false, message: err.message })
                        }
                        return res.status(200).json({ success: true, message: 'Successfully Approved' })
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

module.exports = router;