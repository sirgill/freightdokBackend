const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Onboarding = require('../../models/Onboarding');
const { createOtp, isEmailValid, isPhoneValid } = require("../../utils/utils");

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
    if (!isEmailValid(form.email)) {
        return res.status(400).json({ success: false, message: 'Invalid Email' })
    }
    if (!isPhoneValid(form.phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Invalid Phone Number' })
    }
    const data = { ...form, isPendingApproval: true, otp: createOtp() };
    const onbording = new Onboarding(data)
    onbording.save((err) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(201).json({ success: true, message: 'Saved Successfully' });
    })
})

router.post('/approval', auth, (req, res) => {
    const { id, isApproved } = req.body;
    if (!id) {
        return res.status(404).json({ message: 'Id not provided' })
    }
    Onboarding.updateOne({ _id: id }, { otp: null, isPendingApproval: !isApproved }, (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ message: err.message, success: false })
        }
        const message = isApproved ? "Approval Successful" : 'Deny Successful'
        res.status(204).json({ success: true, message })
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