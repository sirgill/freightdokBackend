const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const config = require("config");
const auth = require("../../middleware/auth");
const User = require("../../models/User");

// Array of user's who can create, read, update and delete
const allowed_members_set_1 = config.get("roles").filter(member => member !== 'user');
// Array of user's who can read, update
// const allowed_members_set_2 = allowed_members_set_1.filter(member => member !== 'afterhours');

const admin_check = async (_id, members) => (members.indexOf((await User.findOne({ _id })).role) > -1);
//@route Get api/users
//@desc Get All the users
//@access Public
router.get("/", auth, async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const isAdmin = await admin_check(req.user.id, allowed_members_set_1);
    if (!isAdmin)
      throw new Error('Forbidden', 403);
    const count = await User.countDocuments({_id: { $ne: [req.user.id] }});
    const users = await User
    .find({_id: { $ne: [req.user.id] }})
    .limit(limit * 1)
    .sort('-date')
    .skip((page - 1) * limit)
    .select('name email role')
    .exec();
    res.json({
      users,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page - 1
    });
  } catch (e) {
    res.status(500).send(e.message); 
  }
});

//@route Post api/users
//@desc Register user route
//@access Public
router.post(
  "/",
  [
    check("email", "Please include valid email").isEmail(),
    check(
      "password",
      "Please enter password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, role } = req.body;
    const isAdmin = await admin_check(req.user.id, allowed_members_set_1);
    if (!isAdmin && !name) {
      return res.status(400).json({ errors: [{ msg: "Name is required" }] });
    }
    try {
      //See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }
      const newUser = { email, password };
      if (!isAdmin)
        newUser['name'] = name;
      else {
        newUser['role'] = role;
        newUser['created_by'] = req.user.id;
      }
      user = new User(newUser);
      //Encrypt passoword
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      if (!isAdmin) {
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
            res.json({ token });
          }
        );
      } else {
        return res.send({ email, role, _id: user.id });
      }
    } catch (err) {
      res.status(500).send("Server error");
    }
  }
);

//@route Post api/users/:_id
//@desc Update user
//@access Public
router.put("/:_id", auth, async (req, res) => {
  const allowedFields = ["email", "password", "role"]; // Field allowed to update
  const { _id } = req.params;
  try {
    const isAdmin = await admin_check(req.user.id, allowed_members_set_1);
    if (!isAdmin)
      throw new Error('Forbidden', 403);
    const toUpdate = req.body;
    for (let field of Object.keys(toUpdate)) {
      if (allowedFields.indexOf(field) < 0)
        throw new Error('Invalid data provided');
    }
    let password = '';
    if (toUpdate.password) {
      password = toUpdate.password;
      delete toUpdate.password;
    }
    const user = await User.findOne({ _id });
    if (password) {
      if (user.role === 'admin')
        throw new Error('Cannot update password');
      const salt = await bcrypt.genSalt(10);
      toUpdate.password = await bcrypt.hash(password, salt);
    }
    if (toUpdate.email && user.email !== toUpdate.email) {
      const emailExist = await User.findOne({ email: toUpdate.email });
      if (emailExist) throw new Error("Email already exists");
    }
    for (let key of Object.keys(toUpdate))
      user[key] = toUpdate[key]
    user['last_updated_by'] = req.user.id;
    await user.save();
    const newUser = user.toObject();
    delete newUser.password;
    res.json(newUser);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

//@route Post api/users/:_id
//@desc Delete user
//@access Public
router.delete("/:_id", auth, async (req, res) => {
  const { _id } = req.params;
  try {
    const isAdmin = await admin_check(req.user.id, allowed_members_set_1);
    if (!isAdmin)
      throw new Error('Forbidden', 403);
    const user = await User.findOne({ _id});
    if (user.role === 'admin')
      throw new Error('Cannot delete a user');
    await user.remove();
    return res.status(200).send('User deleted.');
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
