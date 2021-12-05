const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const bcrypt = require("bcryptjs");
const roles = config.get("roles");

const User = require("../../models/User");

//@route GET api/auth
//@desc Test
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      user,
      roles
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route Post api/auth
//@desc Authrnticate user and get tokrn
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

    const { email, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid Creds." }] });
      }

      const isMatch = true//await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Invalid Creds." }] });
      }

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, roles });
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
