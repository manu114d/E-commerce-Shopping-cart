const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../aws Config/awsConfig");
const mongoose = require("mongoose");
const { isValidName, isValidPhone, isValidEmail, isValidPassword, isValidImage, isValidRequestBody, isValid, isvalidPincode } = require("../validator/validator");

//=====================  Create User ===========================================//
const createUser = async function (req, res) {
  try {

    let { fname, lname, email, phone, password, address, ...rest } = req.body
    let files = req.files;

    if (Object.keys(req.body).length == 0)
      return res.status(400).send({ status: false, message: "Please provide details" });

    if (Object.keys(rest).length != 0)
      return res.status(400).send({ status: false, message: "Please provide details fname, lname, email, phone, password, profileImage, address only!" });

    if (!fname)
      return res.status(400).send({ status: false, message: "fname is required" });
    if (!lname)
      return res.status(400).send({ status: false, message: "lname is required" });
    if (!email)
      return res.status(400).send({ status: false, message: "email is required" });
    if (files.length === 0)
      return res
        .status(400)
        .send({ status: false, message: "profileImage must be file and required" });
    if (!phone)
      return res.status(400).send({ status: false, message: "phone is required" });
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is required" });

    if (files[0].fieldname != 'profileImage')
      return res
        .status(400)
        .send({ status: false, message: "profileImage is required" });

    if (!address) {
      return res
        .status(400)
        .send({ status: false, message: "address is required" });
    }

    address = JSON.parse(address);

    if (!address.shipping) {
      return res
        .status(400)
        .send({ status: false, message: "shipping address is required" });
    }
    if (typeof (address.shipping) != "object")
      return res
        .status(400)
        .send({ status: false, message: "shipping address must be object type" });

    if (!address.billing) {
      return res
        .status(400)
        .send({ status: false, message: "billing address is required" });
    }
    if (typeof (address.billing) != "object")
      return res
        .status(400)
        .send({ status: false, message: "billing address must be object type" });

    if (!address.shipping.street)
      return res
        .status(400)
        .send({ status: false, message: "shipping street is required" });

    if (!isValid(address.shipping.street)) {
      return res.status(400).send({
        status: false,
        message: " shipping street must be string",
      });
    }

    if (!address.shipping.city)
      return res
        .status(400)
        .send({ status: false, message: "shipping city is required" });

    if (!address.shipping.pincode)
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode is required" });

    if (!address.billing.street)
      return res
        .status(400)
        .send({ status: false, message: "billing street is required" });

    if (!address.billing.city)
      return res
        .status(400)
        .send({ status: false, message: "billing city is required" });

    if (!address.billing.pincode)
      return res
        .status(400)
        .send({ status: false, message: "billing pincode is required" });


    ///-------- validation ----------///

    if (!isValidName(fname))
      return res.status(400).send({ status: false, message: "Invalid fname" });

    if (!isValidName(lname))
      return res.status(400).send({ status: false, message: "Invalid lname" });

    if (!isValidEmail(email))
      return res.status(400).send({ status: false, message: "Invalid email" });
    const isEmailAlreadyUsed = await userModel.findOne({
      email: req.body.email,
    });

    if (isEmailAlreadyUsed)
      return res
        .status(404)
        .send({ status: false, message: "Email is already used" });

    if (!isValidPhone(phone))
      return res.status(400).send({ status: false, message: "Invalid phone should start from 6,7,8,9 only" });
    const isPhoneAlreadyUsed = await userModel.findOne({
      phone: phone,
    });

    if (isPhoneAlreadyUsed)
      return res
        .status(404)
        .send({ status: false, message: "Phone is already used" });

    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character",
      });

    if (address && typeof address !== "object") {
      return res
        .status(400)
        .send({ status: false, message: "Address must be object type" });
    }

    if (!isValid(address.shipping.city))
      return res
        .status(400)
        .send({ status: false, message: "shipping city must be string" });

    if (!isvalidPincode(address.shipping.pincode))
      return res
        .status(400)
        .send({ status: false, message: "shipping city pincode  is required" });



    if (!isValid(address.billing.street))
      return res.status(400).send({
        status: false,
        message: "street is required in billing address!",
      });

    if (!isValid(address.billing.city))
      return res.status(400).send({
        status: false,
        message: "billing city is required in billing address",
      });

    if (!isvalidPincode(address.billing.pincode))
      return res
        .status(400)
        .send({ status: false, message: "billing city pincode  is required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let uploadedFileURL;

    if (files && files.length > 0) {
      if (!isValidImage(files[0].originalname))
        return res.status(400).send({ status: false, message: "profileImage must be of extention .jpg,.jpeg,.bmp,.gif,.png" });

      uploadedFileURL = await uploadFile(req.files[0]);
    } else {
      return res.status(400).send({ message: "No file found" });
    }

    req.body.profileImage = uploadedFileURL;
    req.body.password = hashedPassword;
    req.body.address = address;

    const savedData = await userModel.create(req.body);
    return res.status(201).send({ status: true, message: "Success", data: savedData });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//====================================== LogIn ====================================//

const login = async function (req, res) {
  try {
    let credentials = req.body;
    let { email, password, ...rest } = { ...credentials };

    if (Object.keys(req.body).length == 0) {
      return res
        .status(400)
        .send({ status: false, data: "Login Credential required !!!" });
    }

    if (Object.keys(rest).length != 0) {
      return res.status(400).send({
        status: false,
        message: "Data must be email and password only."
      });
    }

    if (!email || !password) {
      return res.status(400).send({
        status: false,
        data: "Email and Password Both are required...",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).send({ status: false, data: "Invalid Email!!!" });
    }

    if (!isValidPassword(req.body.password))
      return res.status(400).send({
        status: false,
        message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character",
      });

    let user = await userModel.findOne({ email: email });
    if (!user)
      return res.status(404).send({ status: false, data: "User Not Found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send({ status: false, data: "Invalid Password" });
    } else {
      var token = jwt.sign({ user }, "shoppingCartSecreteKey", {
        expiresIn: "12hr"
      }); // will expire in 1hr
      let userId = user._id;
      let loginData = { userId, token };
      res.status(200).send({
        status: true,
        message: "Success",
        data: loginData,
      });
    }
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
};

// =========================  fetch User data =========================//

const getProfile = async function (req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.userId))
      return res
        .status(400)
        .send({ status: false, message: "invalid user Id" });

    let allProfiles = await userModel.findById(req.params.userId);
    if (!allProfiles)
      return res
        .status(404)
        .send({ status: false, message: "user id does not exist" });

    if (req.token.user._id != req.params.userId)
      return res.status(403).send({ status: false, message: "unauthorized" });

    return res.status(200).send({
      status: true,
      message: "Success",
      data: allProfiles,
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//============================ update user ========================================//

const updateUser = async (req, res) => {
  try {
    ///-------- validation ----------///

    let { fname, lname, email, phone, password, address, profileImage, ...rest } = { ...req.body }
    let copyAddress = address
    let hashedPassword;
    let uploadedFileURL;

    if (!mongoose.isValidObjectId(req.params.userId))
      return res.status(400).send({ status: false, message: "invalid user Id" });

    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({ status: false, message: "Please provide details which you want to update" });
    }


    if (Object.keys(rest).length != 0) {
      return res.status(400).send({
        status: false,
        message: "Please provide details among these fname, lname, email, phone, password, address, profileImage which you want to update",
      });
    }
    const userDetails = await userModel.findOne({ _id: req.params.userId });
    if (!userDetails) {
      return res.status(404).send({ status: false, message: "user not exist" })
    }

    if (fname) {
      if (!isValidName(fname))
        return res.status(400).send({ status: false, message: "Invalid fname" });
    }
    if (lname) {
      if (!isValidName(lname))
        return res.status(400).send({ status: false, message: "Invalid lname" });
    }

    if (email) {
      if (!isValidEmail(email))
        return res.status(400).send({ status: false, message: "Invalid email" });
      const isEmailAlreadyUsed = await userModel.findOne({
        email: email,
      });
      if (isEmailAlreadyUsed)
        return res.status(404).send({ status: false, message: "Email is already used" });
    }

    if (phone) {
      if (!isValidPhone(phone))
        return res.status(400).send({ status: false, message: "Invalid phone" });
      const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
      if (isPhoneAlreadyUsed)
        return res
          .status(404)
          .send({ status: false, message: "Phone is already used" });
    }

    if (password) {
      if (!isValidPassword(password))
        return res.status(400).send({
          status: false,
          message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character",
        });
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let userDetailsObj = userDetails.toObject()

    if (address) {
      address = JSON.parse(address);
      if (address && typeof address !== "object") {
        return res.status(400).send({ status: false, message: "Address is in wrong format" });
      }

      if (address.shipping) {
        if (!isValidRequestBody(address.shipping))
          return res.status(400).send({ status: false, message: "shipping address must be object" });

        if (address.shipping.street) {
          if (!isValid(address.shipping.street))
            return res.status(400).send({
              status: false,
              message: "street must be string in shipping address!",
            });
          userDetailsObj.address.shipping.street = address.shipping.street
        }
        if (address.shipping.city) {
          if (!isValid(address.shipping.city))
            return res.status(400).send({ status: false, message: "city must be string in shipping address!" });
          userDetailsObj.address.shipping.city = address.shipping.city
        }

        if (address.shipping.pincode) {
          if (!isvalidPincode(address.shipping.pincode))
            return res.status(400).send({
              status: false,
              message: "pincode must be numeric in shipping address!",
            });
          userDetailsObj.address.shipping.pincode = address.shipping.pincode
        }

      }

      if (address.billing) {
        if (!isValidRequestBody(address.billing))
          return res.status(400).send({ status: false, message: "billing address must be object" });

        if (address.billing.street) {
          if (!isValid(address.billing.street))
            return res.status(400).send({
              status: false,
              message: "street must be string in billing address!",
            });
          userDetailsObj.address.billing.street = address.billing.street

        }

        if (address.billing.city) {
          if (!isValid(address.billing.city))
            return res.status(400).send({
              status: false,
              message: "city must be string in billing address!",
            });
          userDetailsObj.address.billing.city = address.billing.city

        }

        if (address.billing.pincode) {
          if (!isvalidPincode(address.billing.pincode))
            return res.status(400).send({ status: false, message: "pincode must be string in billing address!" });
          userDetailsObj.address.billing.pincode = address.billing.pincode
        }
      }
    }

    if (req.token.user._id != req.params.userId)
      return res.status(403).send({ status: false, message: "unauthorized" });


    if (req.files && req.files.length > 0 && req.files[0].fieldname == "profileImage") {
      if (!isValidImage(req.files[0].originalname))
        return res
          .status(400)
          .send({ status: false, message: "profileImage must be of extention .jpg,.jpeg,.bmp,.gif,.png" });

      uploadedFileURL = await uploadFile(req.files[0]);
    }

    let updateuser = await userModel.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $set: {
          fname: fname,
          lname: lname,
          email: email,
          profileImage: uploadedFileURL,
          phone: phone,
          password: hashedPassword,
          address: userDetailsObj.address,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Success",
      data: updateuser,
    });
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = { createUser, login, getProfile, updateUser };
