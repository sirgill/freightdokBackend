const mongoose = require("mongoose");

const InvoicesV2 = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    loadNumber: {
      type: String,
      unique: true,
    },
    notes: { type: String, default: '' },
    services: [
        {
          type: mongoose.Schema.Types.Mixed,
          default: {}
        }
      ]
  },
  {
    timestamps: true,
  },

);

module.exports = mongoose.model("InvoicesV2", InvoicesV2);
