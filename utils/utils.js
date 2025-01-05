const bcrypt = require('bcryptjs');

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

const sendJson = (success, message, ...rest) => {
    return {
        success,
        message,
        ...(rest || {})
    }
}

const MAIL_SERVER_ADDRESS = 'https://mail.freightdok.io';

const encryptPassword = async (plainText = null) => {
    if (!plainText) {
        throw Error('Password param not provided')
    }
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(plainText, salt);
    } catch (error) {
        console.error(error.message)
        return null
    }
}

const sumValuesInObject = (obj) => {
    let sum = 0;

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // If the value is a number, add it to the sum
            if (typeof obj[key] === 'number') {
                sum += obj[key];
            }
            // If the value is an object, recursively call the function
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sum += sumValuesInObject(obj[key]); // Recursively sum values in the nested object
            }
        }
    }

    return sum;
};

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const getDollarPrefixedPrice = (price, showNegative = false) => {
    return showNegative ? '-' + USDollar.format(price) : USDollar.format(price)
}

module.exports = {
    sendJson,
    createOtp,
    catchErrors,
    isEmailValid,
    isPhoneValid,
    getLoadsStruct,
    encryptPassword,
    MAIL_SERVER_ADDRESS,
    sumValuesInObject,
    getDollarPrefixedPrice,
}
