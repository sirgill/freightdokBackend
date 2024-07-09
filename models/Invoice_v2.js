const mongoose = require("mongoose");

const InvoicesV2 = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
      required: true
    },
    loadNumber: {
      type: String,
      required: true,
    },
    notes: { type: String, default: '' },
    services: [
      {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    orgName: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  },

);

module.exports = mongoose.model("InvoicesV2", InvoicesV2);
