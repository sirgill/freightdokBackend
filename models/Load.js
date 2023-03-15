const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const BucketFiles = new mongoose.Schema({
  fileType: {
    type: String,
  },
  fileLocation: {
    type: String
  }
})

const PickUpSchema = new mongoose.Schema(
  {
    shipperName: {
      type: String,
    },

    pickupAddress: {
      type: String,
    },

    in_time: String,
    out_time: String,

    pickupCity: {
      type: String,
    },

    pickupState: {
      type: String,
    },

    pickupZip: {
      type: String,
    },

    pickupDate: {
      type: Date,
    },

    pickupPo: {
      type: String,
    },

    pickupDeliverNumber: {
      //need to change this
      type: String,
    },

    pickupReference: {
      type: String,
    },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true,
  }
);

const DropOffSchema = new mongoose.Schema(
  {
    receiverName: {
      type: String,
    },

    dropAddress: {
      type: String,
    },

    in_time: String,
    out_time: String,
    dropCity: {
      type: String,
    },

    dropState: {
      type: String,
    },

    dropZip: {
      type: String,
    },

    dropDate: {
      type: Date,
    },

    dropPo: {
      type: String,
    },

    dropDeliverNumber: {
      type: String,
    },

    dropReference: {
      type: String,
    },
    notes: { type: String, default: '' }
  },
  {
    timestamps: true,
  }
);

const LoadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  brokerage: {
    type: String,
  },

  loadNumber: {
    type: String,
    required: true,
  },

  trailorNumber: {
    type: String,
    default: ''
  },

  assigned: {
    type: Boolean,
    default: false
  },

  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'drivers'
  },

  status: String,
  accessorials: Array,

  rateConfirmation: {
    type: Array,
    default: []
  },
  proofDelivery: {
    type: Array,
    default: []
  },
  rate: {
    type: String,
    default: ''
  },
  invoice_created: {
    type: Boolean,
    default: false
  },
  pickup: [PickUpSchema],
  drop: [DropOffSchema],
  bucketFiles: [BucketFiles]
}, {
  timestamps: true
});





module.exports = Load = mongoose.model("load", LoadSchema);
