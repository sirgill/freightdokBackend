const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const bcrypt = require("bcryptjs");
const roles = config.get("roles"),
  RolePermission = require('../../models/RolePermission.js'),
  DefaultRolePermission = require('../../models/DefaultRolePermissions.js');

const User = require("../../models/User");

//@route GET api/auth
//@desc Test
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"),
      defaultRoles = await DefaultRolePermission.find({ roleName: { $nin: ['Super Admin', 'super admin'] } }).select('_id roleName');
    res.json({
      user,
      roles,
      allRoles: defaultRoles
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route Post api/auth
//@desc Authenticate user and get token
//@access Public
router.post(
  "/",
  [
    check("email", "Please include valid email").isEmail(),
    check("password", "Password is required").exists()
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, superadmin = false } = req.body;

    try {
      //See if user exists
      let userObject = await User.aggregate([
        {
          $match: { email }
        },
        {
          $lookup: {
            from: 'organizations', // The name of the collection you're joining with
            localField: 'orgId',
            foreignField: '_id',
            as: 'orgDetails'
          }
        },
        {
          $unwind: '$orgDetails'
        },
        {
          $addFields: {
            orgName: '$orgDetails.name', // Add orgDetails.name as orgName
          }
        },
        {
          $project: {
            orgDetails: 0 // Exclude the original orgDetails object
          }
        }
      ]);

      if (superadmin) {
        userObject = await User.find({ email })
      }

      let user = userObject.length > 0 ? userObject[0] : null;

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }], success: false, message: `Couldn't find your freightdok Account` });
      }

      if (superadmin) {
        if (user?.role !== 'superAdmin')
          return res.status(403).json({ status: false, message: 'Only super admin has access.' })
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid Creds." }], message: 'Wrong password. Try again or click Forgot password to reset it.', success: false });
      }

      const permissions = await RolePermission.findOne({ userId: user._id }).select('permissions _id roleName'),
        defaultRoles = await DefaultRolePermission.find({ roleName: { $nin: ['Super Admin', 'super admin'] } }).select('_id roleName');

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user._id,
          email,
          role: user.role,
          name: user.name,
          orgId: user.orgId,
          firstName: user.firstName,
          lastName: user.lastName,
          orgName: user.orgName
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, supportsNewPermission: !!permissions, roles, userPermissions: permissions, allRoles: defaultRoles });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


//@route Patch api/auth
//@desc Update Profile
//@access Public
router.patch("/", auth, async (req, res) => {
  const allowedFields = ["name", "password"]; // Field allowed to update
  const _id = req.user.id;
  try {
    const user = await User.findOne({ _id });
    if (!user)
      throw new Error('User not found.');
    const toUpdate = req.body;
    for (let field of Object.keys(toUpdate)) {
      if (allowedFields.indexOf(field) < 0)
        throw new Error('Invalid data provided');
    }
    const password = toUpdate.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      toUpdate.password = await bcrypt.hash(password, salt);
    }
    for (let field of Object.keys(toUpdate)) {
      user[field] = toUpdate[field];
    }
    await user.save();
    return res.json({
      message: 'User has been updated'
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
