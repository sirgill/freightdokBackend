const mongoose = require("mongoose");
const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Organizations = require('../../models/Organizations');


router.get('/', (req, resp) => {
    const { orgId = '', page = null, limit = null } = req.query
    let queryParams = {}
    if (orgId) {
        Object.assign(queryParams, { _id: mongoose.Types.ObjectId(orgId) })
    }

    const query = [
        {
            $match: queryParams
        },
        {
            $lookup: {
                from: 'users', // Replace 'users' with the actual collection name of Users
                localField: 'adminId',
                foreignField: '_id',
                as: 'adminData'
            }
        },
        {
            $unwind: '$adminData'
        },
        {
            $project: {
                _id: 1,
                name: 1,
                adminId: 1,
                otherOrgMetaData: 1,
                adminData: {
                    name: '$adminData.name',
                    email: '$adminData.email',
                    firstName: '$adminData.firstName',
                    lastName: '$adminData.lastName',
                }
            }
        }
    ]

    if (page && limit) {
        query.push(
            {
                $skip: (+page - 1) * limit // Skip records based on page number and page size
            },
            {
                $limit: +limit // Limit records per page
            })
    }

    Organizations.aggregate(query)
        .exec((err, organizations) => {
            if (err) {
                console.error(err);
                resp.status(404).json({ data: [], message: 'Organizations not found' })
            } else {
                if (page && limit) {
                    query.pop();
                }
                Organizations.aggregate([
                    {
                        $match: queryParams
                    },
                    {
                        $group: {
                            _id: null,
                            totalCount: { $sum: 1 } // Calculate total count of matching documents
                        }
                    }
                ]).exec((count_error, result) => {
                    if (count_error) {
                        return resp.json(count_error);
                    }
                    resp.status(200).json({ data: organizations, totalCount: result.length > 0 ? result[0].totalCount : 0 })
                })
            }
        });
})

router.post("/", auth, (req, res) => {
    Organizations.create({ ...req.body }).then((response) => {
        if (response._id) {
            res.status(200).send({ success: true, message: "organization created successfully! ", data: response })
        }
    }).catch(err => {
        res.status(400).send({ success: false, message: err.message })
    })

})


module.exports = router