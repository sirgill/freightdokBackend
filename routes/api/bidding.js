const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Bid = require("../../models/Bids");
const path = require("path");
const { default: axios } = require("axios");
const { FetchSecret } = require("../../secrets");

router.get("/", auth, (req, res) => {
  const { bidReq } = req.query;

  const params = JSON.parse(decodeURIComponent(bidReq) || "");
  const bid = new Bid(params);

  bid
    .save(params)
    .then((resp) => {
      if (params.status) {
        res.sendFile(
          path.join(__dirname, "./../../templates/bidsuccesspage.html")
        );
      } else {
        res.sendFile(
          path.join(__dirname, "./../../templates/biddeclinepage.html")
        );
      }
    })
    .catch((err) => {
      res.send({
        message: "Error : This Load is already queued at our end !",
        success: false,
      });
      console.log(err.message);
    });
});

router.get("/biddings", auth, async (req, res) => {
  let match_query;
  const { role, orgId, id } = req.user || {};

  if (!role.includes('superAdmin')) {
    const result = await FetchSecret(orgId);
    if (!result.success) {
      return res.status(404).json({ success: false, data: [], message: 'Please enter Broker credentials in the Carrier Profile Tab to see all the Loads available' })
    }
  }

  if (role === "admin" || role === 'superAdmin')
    match_query = { orgId };
  else
    match_query = { userId: id }

  Bid.find({ ...match_query, isActive: { $in: [true, undefined] } })
    .then((bid) => {
      res.status(200).json({ totalCount: bid.length, data: bid });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(400).json({ totalCount: 0, data: {}, error: err.message });
    });
});

/**
 * {IMPORTANT} - This route is To be used strictly in babylonion server
 */
router.get("/allBiddingsForBabylonion", (req, res) => {
  Bid.find({ isActive: { $in: [true, undefined] } })
    .then((bid) => {
      res.status(200).json({ totalCount: bid.length, data: bid });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(400).json({ totalCount: 0, data: {}, error: err.message });
    });
});


router.post("/newTrulBidding/:loadNumber", auth, (req, res) => {
  const { params: { loadNumber = '' } = {} } = req;
  const body = req.body;
  const dbPayload = {
    orgId: req.user.orgId,
    status: false,
    loadNumber,
    bidAmount: body.offer_amount,
    vendorName: body.vendorName,
    ownerOpId: req.user.id,
    userId: req.user.id,
    offerStatus: false,
    loadDetail: body.loadDetail
  }
  saveBid(dbPayload, res)
})

router.post('/saveChOfferRequestId', auth, (req, res) => {
  const dbPayload = { ...req.body, status: false, ownerOpId: req.user.id, userId: req.user.id, orgId: req.user.orgId };
  return saveBid(dbPayload, res)
})

const saveBid = (data, res) => {
  const bid = new Bid(data);
  bid.save()
    .then(resp => {
      res.status(200).json({ success: true, message: 'Bid saved Successfully.' })
    })
    .catch(err => {
      console.log(err)
      if (err.code === 11000) {
        return res.status(404).json({ success: false, message: `Load Number: ${loadNumber} already present.` })
      }
      res.status(500).json({ success: false, message: 'Bid not saved.', err: err.message });
    })
}

router.delete('/deleteBidByLoadNumber/:loadNumber', auth, (req, res) => {
  const { params: { loadNumber = '' } = {} } = req;
  if (!loadNumber) {
    return res.status(404).json({ status: false, message: 'Invalid Loadnumber' });
  }
  Bid.deleteOne({ loadNumber }, (err, result) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Load Not Found', _dbError: err.message });
    }
    res.status(200).json({
      success: true, message: "Successfully Deleted"
    })
  })
})

module.exports = router;
