const mongoose = require("mongoose");

const BidsSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendors",
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
    status: {
      type: Boolean,
      default: 0,
    },
    bidLevel: {
      type: Number,
      default: 1
    },
    vendorName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("bids", BidsSchema);

/**
 * 1 - bid placed
 * 2 - counter offer from vendor
 * 3 - counter offer by driver
 * 4 - final offer received
 */