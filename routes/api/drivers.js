const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const { check, body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Driver = require("../../models/Driver");
const Load = require("../../models/Load");
const User = require("../../models/User");
const { ROLE_NAMES } = require("../../middleware/permissions");

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
    const { id: _id, orgId } = req.user;
    const query = {};
    const isAdmin = req.user.role.toLowerCase() === "admin";
    const user_drivers = await User.find({ orgId, role: ROLE_NAMES.driver }).select('firstName lastName _id role name');

    if (isAdmin)
      query['orgId'] = req.user.orgId;
    else
      query['user'] = _id;

    const drivers = await Driver.find(query).populate('user', 'firstName lastName email _id');
    const q_query = query;
    const roleRegex = new RegExp('^driver$', 'i');
    q_query['role'] = { $regex: roleRegex }
    const users = await User.find(q_query).select('email _id');
    if (!drivers) {
      return res.status(400).json({ msg: "There are no drivers for this user" });
    }
    const assignees = []
    if (drivers && drivers.length) {
      assignees.push(...drivers)
    }
    if (user_drivers && user_drivers.length) {
      assignees.push(...user_drivers);
    }
    return res.json({ drivers, users, assignees });
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
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user, firstName, lastName = null, phoneNumber, loads = [], _id } = req.body;

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
        res.status(403).json({ message: 'Err : Driver with same credentials already exists' });


      /**COMMENTED BELOW CODE: Why do we need to Update user with Driver name */
      // await User.findOneAndUpdate({ _id: user }, {
      //   name: firstName + ' ' + lastName,
      //   firstName,
      //   lastName
      // });

      const status = await Load.updateOne({ _id: { $in: newLoads } }, { $set: { user } }, { multi: true });
      console.log('Status: ', status);

      const newDriver = await Driver.create({
        user,
        firstName,
        lastName,
        phoneNumber,
        loads,
        orgId: req.user.orgId
      });

      res.json({ success: true, message: 'Driver Created', data: newDriver });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error', _dbError: err.message });
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
