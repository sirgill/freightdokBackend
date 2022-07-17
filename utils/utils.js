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