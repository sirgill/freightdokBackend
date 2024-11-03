const express = require("express");
const path = require("path");
const mime = require("mime");
const config = require("config");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");
const checkObjectId = require("../../middleware/checkObjectId");
const uploader = require("../../utils/uploader")
// -----------------------------------------
const url = require('url');
const { getRolePermissionsByRoleName } = require("../../utils/dashboardUtils");


const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const upload_path = path.join(__dirname, '../../documents/load');
    cb(null, upload_path)
  },
  filename: function (req, { originalname }, cb) {
    const file_new_name = Date.now() + originalname;
    cb(null, file_new_name)
  }
});
const upload = multer({ storage: storage });


const Load = require("../../models/Load");
const User = require("../../models/User");
const RolePermission = require("../../models/RolePermission");

// Array of user's who can create, read, update and delete
const allowed_members_set_1 = config.get("roles").filter(member => member !== 'user' && member !== 'driver');
// Array of user's who can read, update
const allowed_members_set_2 = allowed_members_set_1.filter(member => member !== 'afterhours');

const admin_check = async (_id, members) => (members.indexOf((await User.findOne({ _id })).role) > -1);

//@route GET api/load/me
//@desc Get current users loads
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const {
      error, allLoads, load, limit, total, totalPages, currentPage
    } = await getLoads(req.query, req.user.id, req.user);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.json({ allLoads, load, limit, total, totalPages, currentPage });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.get("/invoice_loads", auth, async (req, res) => {
  try {
    const { page = 1, limit = 4, search = '' } = req.query,
      { role, id } = req.user;

    const doesRoleHasViewPermission = await RolePermission.findOne({ 'permissions.invoices.view': true, userId: id });

    if (!doesRoleHasViewPermission) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    const { permissions: { invoices: { hasElevatedPrivileges = false } = {} } = {} } = doesRoleHasViewPermission || {};
    const [adminRoleData] = await getRolePermissionsByRoleName('admin') || [];
    const query = {
      status: 'delivered', $or: [
        { invoice_created: false },
        { invoice_created: { $exists: false } }
      ]
    };

    if (role.toLowerCase() === adminRoleData.roleName.toLowerCase() || hasElevatedPrivileges) {
      query.orgId = req.user.orgId;
    } else {
      query.user = id;
    }

    // if (search) {
    //   const regex = { $regex: to_search, $options: 'i' };
    //   query['$or'] = [
    //     { loadNumber: regex },
    //   ];
    // }
    const total = await Load.countDocuments(query);
    const loads = await Load.find(query).populate('user', ['name', 'firstName', 'lastName'])
      // .select("loadNumber brokerage rate rateConfirmation proofDelivery")
      .limit(limit * 1)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .exec();
    return res.json({
      loads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

const getLoads = async ({ page = 1, limit = 4, search = '', module = '' }, _id, reqUser) => {
  const query = {};
  if (!search) {
    if (!module || (module && module === 'loads')) {
      query['status'] = { $nin: ['Delivered', 'delivered', 'archived'] };
    } else if (module && module === 'history') {
      query['invoice_created'] = true;
    }
  } else {
    const to_search = search.toLowerCase();
    const regex = { $regex: to_search, $options: 'i' };
    const commonKeys = [
      { loadNumber: regex },
      { "pickup.pickupCity": regex },
      { "pickup.pickupState": regex },
      { "drop.dropCity": regex },
      { "drop.dropState": regex },
    ];
    const loadsKeysToSearch = [];
    const loadsStatusKeysToSearch = [
      { status: regex },
      { accessorials: { $elemMatch: regex } },
    ];
    if (module && module === 'loadsStatus')
      query['$or'] = loadsStatusKeysToSearch.concat(commonKeys);
    else {
      query['$or'] = loadsKeysToSearch.concat(commonKeys);
      // query['status'] = { $ne :'Delivered' };
    }
  }

  const doesRoleHasViewPermission = await RolePermission.findOne({ 'permissions.loads.view': true, userId: _id });

  if (!doesRoleHasViewPermission) {
    return {
      error: {
        status: 403,
        message: "Unauthorized"
      }
    };
  }
  const { permissions: { loads: { hasElevatedPrivileges = false } = {} } = {} } = doesRoleHasViewPermission || {};

  /**
   * Since all the below roles share the loads among themselves for visibility, we have to show all the loads based on orgId to them
   * Bypass admin and superadmin to view all the loads within the org
   */
  const isAdmin = ['admin', 'superadmin'].includes(reqUser.role.toLowerCase());
  if (isAdmin || hasElevatedPrivileges)
    query['orgId'] = reqUser.orgId;
  else
    query['user'] = _id;


  const allLoadsQuery = Object.assign({}, query);
  allLoadsQuery['status'] = { $ne: 'empty' };


  const allLoads = await Load.find(allLoadsQuery);

  // query['$lookup'] = {
  //   from: "drivers",
  //   localField: "_id",
  //   foreignField: "assignedTo",
  //   as: "driver"
  // }

  const load = await Load.find(query)
    .populate(["assignedTo", 'user'])
    .limit(limit * 1)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .exec();

  const count = await Load.countDocuments(query);

  if (!load) {
    return {
      error: {
        status: 400,
        message: "There are no loads for this user"
      }
    };
  }

  return {
    error: null,
    allLoads,
    load,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  };
}

router.get("/download/:file_name", auth, (req, res) => {
  const { file_name } = req.params;
  const file = path.join(__dirname, '../../documents/load', file_name);
  const mimetype = mime.lookup(file);
  res.setHeader('Content-type', mimetype);
  res.setHeader('Content-disposition', 'attachment; filename=' + file_name);
  res.download(file);
});

//@route POST api/load/
//@desc Create loads
//@access Private
router.post("/", [auth, [check("loadNumber", "Load number is required").not().isEmpty()]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");

    const { brokerage, loadNumber, rate, pickUp, dropOff } = req.body;

    const loadExists = await Load.find({ loadNumber });
    if (Array.isArray(loadExists) && loadExists.length) {
      return res.status(403).json({ message: "This Load Number already exists" })
    }

    const load = await Load.create({
      user: req.user.id,
      userId: req.user.id,
      orgId: req.user.orgId,
      brokerage,
      loadNumber,
      rate,
      pickup: pickUp,
      drop: dropOff,
    });

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.patch("/modify",
  upload.any()
  , async (req, res) => {
    const errors = validationResult(req);
    console.log("===RqBody", req.body)

    console.log("===File", req.files)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const formdata = req.body;
      const { _id } = formdata;
      console.log("==allData===", formdata)
      delete formdata._id;

      const files = req.files;
      let s3Files = await uploader(files);
      // console.log("=====Files",s3Files)
      const dbLoad = await Load.findOne({ _id });
      // console.log(dbLoad)
      if (!dbLoad)
        throw new Error('UnAuthorized Access');
      if (files.length > 0) {
        for (let key of ['rateConfirmation', 'proofDelivery']) {
          let key_files = files.filter(f => f.fieldname === key);
          if (key_files.length > 0) {
            const file_data = [];
            for (let data of key_files) {
              const { filename } = data;
              file_data.push({
                name: filename,
                date: Date.now()
              });
            }
            formdata[key] = file_data;
          }
        }
      }
      for (const key of ['accessorials', 'pickup', 'drop'])
        formdata[key] = JSON.parse(formdata[key])
      // if (formdata['assignedTo'] === 'null')
      //   formdata['assignedTo'] = null;
      const driver = formdata['assignedTo'];
      if (driver) {
        formdata['user'] = driver;
        const dbDriver = await Driver.findOne({ user: driver });
        if (dbDriver) {
          dbDriver.loads = dbDriver.loads.concat(dbLoad);
          dbDriver.save();
        }
      }
      let bktFiles = JSON.parse(formdata.bucketFiles)
      if (bktFiles) {
        if (formdata.bucketFiles && formdata.bucketFiles.length > 0) {
          let array1 = bktFiles;
          let array2 = s3Files.data;
          array1 = array1.filter(item => array2.every(item2 => item2.fileType != item.fileType));
          let main = [];
          main.push(...array1, ...array2)
          // console.log(main)
          formdata.bucketFiles = main;

        }
        else {
          formdata.bucketFiles = s3Files.data;
        }
      }
      else {
        formdata.bucketFiles = s3Files.data;
      }

      const load = await Load.findOneAndUpdate({ _id }, formdata, { new: true });
      console.log(load)
      return res.json(load);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err.message);
    }
  });

//@desc upload new document for a load
router.patch("/upload/load/:load_id/:doc_type", upload.any(), async (req, res) => {
  try {
    const { load_id, doc_type } = req.params;
    const load = await Load.findOne({ _id: load_id });
    if (!load)
      throw new Error("Load not found");
    const files = req.files;
    const file_data = [];
    for (let file of files) {
      const { filename } = file;
      file_data.push({
        name: filename,
        date: Date.now()
      });
    }
    load[doc_type] = file_data;
    await load.save();
    return res.json({ file_data });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//@desc delete document associated with a load
router.delete('/remove/doc/:load_id/:doc_type', auth, async (req, res) => {
  try {
    const { load_id, doc_type, doc_name } = req.params;
    const load = await Load.findOne({ _id: load_id });
    if (!load)
      throw new Error('Load not found');
    if (doc_name)
      load[doc_type] = load[doc_type].filter(doc => doc.name !== doc_name);
    else
      load[doc_type] = [];
    await load.save();
    return res.json({});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//@route Get api/loads
//@desc Get all loads
//@access Public

router.get('/driverLoads', async (req, res) => {
  try {
    const queryObject = url.parse(req.url, true).query;
    let { driver } = queryObject;

    console.log("----Query Params", driver)

    const loads = await Load.find({ assignedTo: driver }).populate('user', ['name']);
    res.json(loads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');

  }
});

//@route Get api/load/user/:user_id
//@desc Get load by user ID
//@access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const load = await Load.find({ user: req.params.user_id }).populate("user", ["name"]);

    if (!load) return res.status(400).json({ msg: "Load not found" });

    res.json(load);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Load not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route Delete api/load
//@desc  Delete load & driver
//@access Private

router.delete('/', auth, function (req, res) {
  const id = req.body.data.load_id;
  if (id) {
    Load.findByIdAndDelete({ _id: id }, null, (err, result) => {
      if (err) {
        console.log(err.message)
        return res.status(400).json({ success: false, message: 'Delete unsuccessful', _dbError: err.message });
      }
      res.status(200).json({ success: true, message: `Load deleted successfully` })
    })
  } else {
    res.status(404).json({ success: false, message: 'Delete failed. Invalid Load id' })
  }
});

//@route Put api/load/pickup
//@desc  add load pickup information
//@access Private

router.put("/pickup/:id", [auth, checkObjectId("id")], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    shipperName,
    pickupAddress,
    pickupCity,
    pickupState,
    pickupZip,
    pickupDate,
    pickupTime,
    pickupPo,
    pickupDeliverNumber,
    pickupReference,
  } = req.body;

  const newPickup = {
    shipperName,
    pickupAddress,
    pickupCity,
    pickupState,
    pickupZip,
    pickupDate,
    pickupTime,
    pickupPo,
    pickupDeliverNumber,
    pickupReference,
  };
  try {
    const load = await Load.findById(req.params.id);

    load.pickup.push(newPickup);

    await load.save();

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route PATCH api/load/pickup
//@desc patch pickup information
//@query load_id for the respective pickup you want to patch
//@body actual pickup object you want to patch.
//@access Private
router.patch("/pickup", auth, async (req, res) => {
  try {
    const load = await Load.findOneAndUpdate(
      {
        _id: req.query.load_id,
        "pickup._id": req.body._id,
      },
      {
        "pickup.$.pickupAddress": req.body.pickupAddress,
        "pickup.$.pickupCity": req.body.pickupCity,
        "pickup.$.pickupDate": req.body.pickupDate,
        "pickup.$.pickupDeliverNumber": req.body.pickupDeliverNumber,
        "pickup.$.pickupPO": req.body.pickupPO,
        "pickup.$.pickupReference": req.body.pickupReference,
        "pickup.$.pickupState": req.body.pickupState,
        "pickup.$.pickupZip": req.body.pickupZip,
        "pickup.$.shipperName": req.body.shipperName,
      },
      {
        new: true,
      }
    );
    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/load/pickup/:pickup_id
//@desc  add load pickup information
//@access Private
router.delete("/pickup/:pickup_id", auth, async (req, res) => {
  try {
    const load = await Load.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = load.pickup.map((item) => item.id).indexOf(req.params.pickup_id);

    load.pickup.splice(removeIndex, 1);

    await load.save();

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route Put api/load/drop
//@desc  add load drop information
//@access Private

router.put("/drop/:id", [auth, checkObjectId("id")], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { receiverName, dropAddress, dropCity, dropState, dropZip, dropDate, dropTime, dropPo, dropDeliverNumber, dropRef } = req.body;

  const newDrop = {
    receiverName,
    dropAddress,
    dropCity,
    dropState,
    dropZip,
    dropDate,
    dropTime,
    dropPo,
    dropDeliverNumber,
    dropRef,
  };
  try {
    const load = await Load.findById(req.params.id);

    load.drop.unshift(newDrop);

    await load.save();

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route PATCH api/load/drop
//@desc patch drop information
//@query load_id for the respective drop you want to patch
//@body actual drop object you want to patch.
//@access Private
router.patch("/drop", auth, async (req, res) => {
  try {
    const load = await Load.findOneAndUpdate(
      {
        _id: req.query.load_id,
        "drop._id": req.body._id,
      },
      {
        "drop.$.dropAddress": req.body.dropAddress,
        "drop.$.dropCity": req.body.dropCity,
        "drop.$.dropDate": req.body.dropDate,
        "drop.$.dropDeliverNumber": req.body.dropDeliverNumber,
        "drop.$.dropPO": req.body.dropPO,
        "drop.$.dropRef": req.body.dropRef,
        "drop.$.dropState": req.body.dropState,
        "drop.$.dropZip": req.body.dropZip,
        "drop.$.receiverName": req.body.receiverName,
      },
      {
        new: true,
      }
    );

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/load/drop/:drop_id
//@desc  add load drop information
//@access Private
router.delete("/drop/:drop_id", auth, async (req, res) => {
  try {
    const load = await Load.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = load.drop.map((item) => item.id).indexOf(req.params.drop_id);

    load.drop.splice(removeIndex, 1);

    await load.save();

    res.json(load);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post('/invoice/merge_docs', async (req, res) => {
  try {
    var fs = require('fs');
    const path = require('path');
    const PDFMerger = require('pdf-merger-js');
    const merger = new PDFMerger();

    const { invoice, docs } = req.body;
    console.log('docs :', docs);

    const fileName = Date.now() + ".pdf";
    const filePathToSave = path.join(__dirname, '../../documents/load/' + fileName);
    const finalFilePath = path.join(__dirname, '../../documents/load/output.pdf');
    const base64Data = invoice.replace(/^data:([A-Za-z-+/]+);base64,/, '');

    fs.writeFileSync(filePathToSave, base64Data, { encoding: 'base64' }, async (err) => {
      if (err) {
        console.log('Err in writing file :', err)
      }
    });

    setTimeout(async () => {
      console.log('Executing...')

      merger.add(filePathToSave);
      docs.forEach((item) => {
        if (fs.existsSync(path.join(__dirname, '../../documents/load/' + item))) {
          merger.add(path.join(__dirname, '../../documents/load/' + item));
        }
      });

      await merger.save(finalFilePath);

      const src = fs.createReadStream(finalFilePath);
      src.pipe(res);

    }, 2000)
  } catch (error) {
    return res.status(500).send('Internal Server Error').end()
  }

})

module.exports = router;
