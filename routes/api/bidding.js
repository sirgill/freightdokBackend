const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Bid = require("../../models/Bids");
const path = require("path");
const { truncate } = require("fs");

router.get("/", (req, res) => {
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

module.exports = router;
