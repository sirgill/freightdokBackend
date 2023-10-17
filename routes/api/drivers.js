const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const { check, body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Driver = require("../../models/Driver");
const Load = require("../../models/Load");
const User = require("../../models/User");

// Array of user's who can create, read, update and delete
const allowed_members_set_1 = config.get("roles").filter(member => member !== 'user');
// Array of user's who can read, update
const allowed_members_set_2 = allowed_members_set_1.filter(member => member !== 'afterhours');

const admin_check = async (_id, members) => (members.indexOf((await User.findOne({ _id })).role) > -1);

//@route GET api/drivers/me
//@desc Get current users drivers
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const _id = req.user.id;
    const query = {};
    const isAdmin = await admin_check(req.user.id, allowed_members_set_1);
    if (!isAdmin)
      query['user'] = _id;
    const drivers = await Driver.find(query).populate("user", ["name"]);
    const users = await User.find({ role: 'driver' }).select('email');
    if (!drivers) {
      return res.status(400).json({ msg: "There are no drivers for this user" });
    }
    return res.json({ drivers, users });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//@route Post api/drivers
//@desc  Create a driver
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("user", "Please select a driver first").not().isEmpty(),
      check("firstName", "First Name is required").not().isEmpty(),
      check("lastName", "Last Name is required").not().isEmpty(),
      check("phoneNumber", "Phone number is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user, firstName, lastName, phoneNumber, loads, _id } = req.body;

      if (_id) {
        const updater = await Driver.updateOne({ _id }, { firstName, lastName, phoneNumber });
        console.log('updater', updater);
        return res.json({ success: true, message: 'Driver Updated' });
      }

      const newLoads = loads.reduce((array, data) => {
        array.push(data._id);
        return array;
      }, []);

      const driver = await Driver.findOne({ user });
      if (driver)
        throw new Error('Driver with same credentials already exists');

      await User.findOneAndUpdate({ _id: user }, {
        name: firstName + ' ' + lastName
      });

      const status = await Load.update({ _id: { $in: newLoads } }, { $set: { user } }, { multi: true });
      console.log('Status: ', status);

      const newDriver = await Driver.create({
        user,
        firstName,
        lastName,
        phoneNumber,
        loads,
      });

      res.json({ success: true, message: 'Driver Created' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route Get api/drivers
//@desc  Get drivers by user(dispatcher)
//@access Private

router.get("/user/:user_id", auth, async (req, res) => {
  try {
    const driver = await Driver.find({ user: req.params.user_id }).populate("user", ["name"]);

    if (!driver) return res.status(400).json({ msg: "drivers not found" });

    res.json(driver);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Drivers not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/drivers
//@desc  Delete a driver
//@access Private

router.delete("/", auth, [body("driver_id", "Driver id is required").not().isEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await Load.update({ user: req.body.driver_id }, { $set: { user: req.user.id } }, { multi: true });
    const driver = await Driver.findOneAndDelete({ user: req.body.driver_id });

    if (!driver)
      return res.status(404).json({ msg: "Driver not found" });

    //check if user driver
    // if (driver.user.toString() !== req.user.id) {
    //   return res.status(401).json({ msg: "User not authorized" });
    // }
    // console.log("THE RES IS:         ", driver);
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Drivers not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route PATCH api/drivers/loads
//@desc patch loads array for driver
//@query driver_id for the respective driver you want to patch
//@body actual load array you want to patch
//@access Private
router.patch("/loads", auth, [body("loads", "Array of Loads is required").not().isEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newLoads = req.body.loads.reduce((array, data) => {
      array.push(data._id);
      return array;
    }, []);
    await Load.update({ user: req.query.driver_id }, { $set: { user: req.user.id } }, { multi: true });
    await Load.update({ _id: { $in: newLoads } }, { $set: { user: req.query.driver_id } }, { multi: true });
    const driver = await Driver.findOneAndUpdate(
      {
        user: req.query.driver_id,
      },
      {
        loads: req.body.loads,
      },
      {
        new: true,
      }
    );
    req.body.loads.forEach((load) => {
      Load.findByIdAndUpdate({ _id: load._id }, { assigned: true });
    });
    res.json(driver);
  } catch (err) {
    console.log(err);
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/drivers/loads
//@desc delete a load from a driver
//@query driver_id, load_id
//@access Private

router.delete(
  "/loads",
  auth,
  [body("driver_id", "Driver id is required").not().isEmpty(), body("load_id", "Load id is requied").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const driver = await Driver.findOne({ user: req.body.driver_id });
      driver.loads.pull(req.body.load_id);
      driver.save();
      await Load.findByIdAndUpdate(
        {
          _id: req.body.load_id,
        },
        {
          assigned: false,
          user: req.user.id
        }
      );
      res.json(driver);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
