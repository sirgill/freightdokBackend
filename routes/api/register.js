/**
 * Deprecated
 */

const axios = require('axios');
const express = require('express');
const User = require('../../models/User');
const bcrypt = require("bcryptjs");
const FMCSA = require('../../models/FMCSA');
const router = express.Router();

const registerUser = async (req, res) => {
    const { name, email, phone, companyname: dot, password, content = {} } = req.body;

    const salt = await bcrypt.genSalt(10);
    let pass = await bcrypt.hash(password, salt);
    // name, email, password, role
    const user = new User({ name, email, password: pass, phone, dot, role: 'ownerOperator' })
    user.save()
        .then(async response => {
            const { _id } = response;
            if (_id) {
                const fmcsa = new FMCSA({ userId: _id, content })
                const fmscaSave = await fmcsa.save();
                if (fmscaSave._id) {
                    res.status(200).json({ success: true, message: 'Signup Successful. Please login to contine.' })
                }
            }
        })
        .catch(err => {
            /*
            * If email already exists in User table, throw error of duplicated user email.
            */
            console.log('error', email, err.message);
            res.status(403).json({ success: false, message: 'This Email is already registered. Kindly use a different Email' })
        })
}

router.post('/ownerOperator', async (req, res) => {
    return registerUser(req, res);

})

router.post('/fleetOwner', (req, res) => {
    return registerUser(req, res);
})

module.exports = router