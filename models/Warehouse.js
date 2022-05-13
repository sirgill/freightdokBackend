const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const warehouseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
    averageLoadTime: {
      type: String,
      required: false,
    },
    parking: {
      type: Boolean,
    },
    appointment: {
      type: String,
    },
    serviceHours: {
      type: String,
    },
    restroom: {
      type: Boolean,
      required: true,
    },
    fcfs: {
      type: Boolean,
    },
    phone: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("warehouse", warehouseSchema);
