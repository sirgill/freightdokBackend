const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const FormData = require('form-data');
const fs = require("fs")
const path = require("path")
const axios = require('axios')

const auth = require("../../middleware/auth");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const uploader = require("../../utils/uploader");
var multer = require('multer')
var upload = multer({ dest: 'documents/profile_images/' })


//@route Get api/profile/me
//@desc Get current users profile
//@access Private

router.get('/me', auth, async (req, res) => {

  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate("user", [
      "name"
    ]).lean();

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile data for this user" });
    }

    if (profile.image) {
      profile.imageUrl = profile.image;
    }

    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }

});


//@route Post api/load
//@desc Create or update user profile
//@access Private

router.post(
  "/",
  [
    auth,
    [
      check("company", "company is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { company = '', title, name, image } = req.body;

    try {
      if (req.files.file) {
        const data = new FormData();
        const readStream = fs.createReadStream(req.files.file.path);
        data.append("sampleFile", readStream);
        const config = {
          method: 'post',
          url: 'http://3.6.22.119:7777/upload',
          headers: {
            ...data.getHeaders()
          },
          data: data
        }
        let success = false
        axios(config).then(async ({ status, data = {} }) => {
          if (status === 200) {
            const { fileData: { Location = '' } = {} } = data;
            success = true;
            const profileFields = {
              user: req.user.id,
              company,
              title,
              name,
              image: Location
            };
            let profile = await Profile.findOneAndUpdate(
              { user: req.user.id },
              { $set: profileFields },
              { new: true, upsert: true }
            ).lean();

            if (profile.image) {
              profile.imageUrl = Location;
            }

            res.json(profile);
          }
          else {
            res.json({ message: 'Something went wrong! Please try later.', success: false })
          }
        })
          .catch(err => {
            console.log(err);
          })
      }
      else {
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: { company, title, name } },
          { new: true, upsert: true }
        ).lean();

        res.json(profile);
        return;
      }


      //update
      // let imageName = null;

      // if (image && image.includes('data:image')) {
      //   const currentTime = new Date().getTime();
      //   const type = image.split(';')[0].split('/')[1];
      //   const base64Data = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      //   imageName = `${currentTime}.${type}`;
      //   const pathOfImage = `documents/profile_images/${imageName}`;

      //   require("fs").writeFile(pathOfImage, base64Data[2], 'base64', function (err) {
      //     console.log(err);
      //   });

      //   profileFields.image = imageName;
      // }

      // if (profileFields.image.includes('http')) {
      //   delete profileFields.image;
      // }



    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route Get api/profile
//@desc Get all profiles
//@access Public

// router.get('/', (req, res) => {
//   try {
//     const profiles = await Profile.find().populate('user', ['name']);
//     res.json(profiles);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
//
// });

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.find({ user: req.params.user_id }).populate('user', ['name']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');

  }
});


// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user loads
    //await Load.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user...still need to figure out how to remove user and loads
    //await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: ' deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
