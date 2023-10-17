const getLoadsStruct = ({ assigned = false, loadNumber, rate, userId, brokerage, pickup = {}, drop, bucketFiles = [], status }) => {
    return {
        "trailorNumber": "",
        "assigned": assigned,
        "accessorials": [],
        "rateConfirmation": [],
        "proofDelivery": [],
        "rate": rate,
        "invoice_created": false,
        "user": userId,
        "brokerage": brokerage,
        "loadNumber": loadNumber,
        "pickup": [pickup],
        "drop": [drop],
        "bucketFiles": [bucketFiles],
        "createdAt": {
            "$date": "2022-06-27T09:58:12.850Z"
        },
        "updatedAt": {
            "$date": "2022-07-17T07:17:23.085Z"
        },
        "__v": 0,
        "assignedTo": {
            "$oid": "62b5f793b1494436945be188"
        },
        "status": status
    }
}

const catchErrors = () => {
    process.on('uncaughtException', (err) => {
        console.error('uncaughtException', (err && err.stack) ? err.stack : err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.log('Unhandled Rejection at:', (reason && reason.stack) ? reason.stack : reason);
    });
};

const createOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

const isEmailValid = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const isPhoneValid = (num) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    return re.test(String(num).toLowerCase());
}

const sendJson = (success, message) => {
    return {
        success,
        message
    }
}

module.exports = {
    sendJson,
    createOtp,
    catchErrors,
    isEmailValid,
    isPhoneValid,
    getLoadsStruct
}
