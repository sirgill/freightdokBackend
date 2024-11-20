const mongoose = require("mongoose");
const { encryptPassword } = require("../utils/utils");
const Schema = mongoose.Schema;

const factoringPartners = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    host: String,
    port: String,
    noticeText: {
        required: true,
        type: String
    },
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, {
    timestamps: true
})

factoringPartners.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            const encryptedPass = await encryptPassword(this.password);

            if (!encryptedPass) {
                throw new Error('Password encryption failed in pre save hook');
            }

            this.password = encryptedPass;
        }

        next();
    } catch (error) {
        next(error);
    }
});

factoringPartners.pre('findOneAndUpdate', async function (next) {
    try {
        const update = this.getUpdate();
        if (update.password) {
            const encryptedPass = await encryptPassword(update.password);
            if (!encryptedPass) {
                throw new Error('Password encryption failed in pre update hook');
            }
            update.password = encryptedPass;
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('factoringPartners', factoringPartners);