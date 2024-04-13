const mongoose = require("mongoose");

const BidsSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendors",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ownerOpId: {
      type: String,
      required: true,
    },
    loadNumber: {
      type: String,
      unique: true,
    },
    bidAmount: {
      type: String,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contact",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: false
    },
    bidLevel: {
      type: Number,
      default: 1
    },
    vendorName: {
      type: String,
      required: true
    },
    offerStatus: {
      type: String,
    },
    event_data: {
      type: Object
    },
    counterAmount: {
      type: Number,
    },
    loadDetail: {
      type: Object,
      required: false
    },
    offerRequestId: {
      type: String,
    }
  },
  {
    timestamps: true,
  },

);

module.exports = mongoose.model("bids", BidsSchema);

/**
 * 1 - bid placed
 * 2 - counter offer from vendor
 * 3 - counter offer by driver
 * 4 - final offer received
 */