const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Bid = require("../../models/Bids");
const path = require("path");
const { default: axios } = require("axios");

router.get("/", auth, (req, res) => {
  const { bidReq } = req.query;

  const params = JSON.parse(decodeURIComponent(bidReq) || "");
  console.log("-- params --", params);
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

router.get("/biddings", (req, res) => {
  Bid.find()
    .then((bid) => {
      res.status(200).json({ totalCount: bid.length, data: bid });
    })
    .catch((err) => {
      console.log(error.message);
      res.status(400).json({ totalCount: 0, data: {}, error: err.message });
    });
});

router.post("/newTrulBidding/:loadNumber", auth, (req, res) => {
  const { params: { loadNumber = '' } = {} } = req;
  const body = req.body;
  console.log(body)
  const dbPayload = {
    status: true,
    loadNumber,
    bidAmount: body.offer_amount,
    vendorName: body.vendorName,
    ownerOpId: req.user.id
  }
  const bid = new Bid(dbPayload);
  bid.save()
    .then(resp => {
      res.status(200).json({ success: true, message: 'Bid saved Successfully.' })
    })
    .catch(err => {
      console.log(err)
      if (err.code === 11000) {
        return res.status(404).json({ success: false, message: `Load Number: ${loadNumber} already present.` })
      }
      res.status(500).json({ success: false, message: 'Bid not saved.' });
    })
})

module.exports = router;
