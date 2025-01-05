const { getRolePermissionsByRoleName } = require("../../utils/dashboardUtils");
const Users = require('../../models/User');
const Loads = require('../../models/Load');
const { getDollarPrefixedPrice } = require('../../utils/utils');
const mongoose = require("mongoose");
const EFSTransactionRates = require("../../models/EFSTransactionRates");
const OwnerOperatorServiceCost = require("../../models/OwnerOperatorServiceCost");

const getInsights = async (req, res) => {
    const { role, orgId, id } = req.user,
        { startDate, endDate } = req.query;

    const [adminRoleData] = await getRolePermissionsByRoleName('admin') || [{}];
    const query = {};

    //If user is admin, show list by orgId
    if (role.toLowerCase() === adminRoleData.roleName.toLowerCase()) {
        query.orgId = orgId;
    } else {
        query.userId = id;
    }

    const diffInMs = new Date(endDate) - new Date(startDate);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    Loads.aggregate([
        {
            $match: {
                orgId: mongoose.Types.ObjectId(orgId),
                updatedAt: {
                    $gt: new Date(startDate),
                    $lt: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $convert: { input: "$rate", to: "double", onError: 0, onNull: 0 } } },
                loadCount: { $sum: 1 },
                loads: { $push: "$$ROOT" },
            },
        },
    ])
        .then((data) => {
            if (data.length) {
                const result = {
                    revenue: getDollarPrefixedPrice(`${data[0].totalRevenue}`),
                    loadCount: data[0].loadCount,
                    averageRate: getDollarPrefixedPrice(`${(data[0].totalRevenue / diffInDays)}`),
                    overview: data[0].loads
                };
                res.send(result);
            } else {
                res.status(404).send({ message: "No data found." });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: "Internal Server Error" });
        });


}

const getHistoricalPerformanceByDateRange = async (req, res) => {
    const { role, orgId, id } = req.user,
        { startDate, endDate } = req.query;

    const diffInMs = new Date(endDate) - new Date(startDate);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    Loads.aggregate([
        {
            $match: {
                orgId: mongoose.Types.ObjectId(orgId),
                updatedAt: {
                    $gt: new Date(startDate),
                    $lt: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $convert: { input: "$rate", to: "double", onError: 0, onNull: 0 } } },
                loadCount: { $sum: 1 },
            },
        },
    ])
        .then((data) => {
            if (data.length) {
                const result = {
                    revenue: getDollarPrefixedPrice(`${data[0].totalRevenue}`),
                    loadCount: data[0].loadCount,
                    averageRate: getDollarPrefixedPrice(`${(data[0].totalRevenue / diffInDays)}`),
                };
                res.send(result);
            } else {
                res.status(404).send({ message: "No data found." });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: "Internal Server Error" });
        });
}

const getFinancials = async (req, res) => {
    const { role, orgId, id } = req.user;
    const { startDate, endDate } = req.query;

    console.log("ID :", id);

    const [adminRoleData] = await getRolePermissionsByRoleName('admin') || [{}];
    const query = {};

    // If user is admin, show list by orgId
    if (role.toLowerCase() === adminRoleData.roleName.toLowerCase()) {
        query.orgId = orgId;
    } else {
        query.userId = id;
    }

    const diffInMs = new Date(endDate) - new Date(startDate);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const { lease, total } = await OwnerOperatorServiceCost.findOne({ ownerOperatorId: id });
    const { transactionCost: efsAdvances } = await EFSTransactionRates.findOne({
        maxAmount: { $gte: lease }
    });

    Loads.aggregate([
        {
            $match: {
                orgId: mongoose.Types.ObjectId(orgId),
                updatedAt: {
                    $gt: new Date(startDate),
                    $lt: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $convert: { input: "$rate", to: "double", onError: 0, onNull: 0 } } },
            },
        },
    ])
    .then((data) => {
        if (data.length) {
            const net = data[0].totalRevenue - ((data[0].totalRevenue * lease) / 100) - efsAdvances;

            const result = {
                revenue: getDollarPrefixedPrice(`${data[0].totalRevenue}`),
                total: getDollarPrefixedPrice(`${total}`),
                efsAdvances: getDollarPrefixedPrice(`${efsAdvances}`),
                lease,
                net: getDollarPrefixedPrice(`${net}`)
            };
            res.send(result);
        } else {
            res.status(404).send({ message: "No data found." });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    });
}


module.exports = {
    getInsights,
    getHistoricalPerformanceByDateRange,
    getFinancials
}