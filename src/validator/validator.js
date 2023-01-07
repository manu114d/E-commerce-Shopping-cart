
const isValidName = function (body) {
  const nameRegex = /^[a-zA-Z_ ]*$/;
  return nameRegex.test(body);
};
const isValidTitle = function (body) {
  const nameRegex = /^[0-9a-zA-Z_ ]*$/;
  return nameRegex.test(body);
};
const isValidDescription = function (body) {
  const nameRegex = /^[a-zA-Z_><?:",.;'~!@#$%^&* ]*$/;
  return nameRegex.test(body);
};
const isValidprice = function (body) {
  const nameRegex = /^\d{0,8}[.]?\d{1,4}$/;
  return nameRegex.test(body);
};
const isValidInstallment = function (body) {
  const nameRegex = /^[0-9]+$/;
  return nameRegex.test(body);
};

const isValidPhone = function (body) {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(body);
};

const isValidEmail = function (body) {
  const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  return emailRegex.test(body);
};

const isValidPassword = function (body) {
  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
  return passwordRegex.test(body);
};

const isValidRequestBody = function (request) {
  return Object.keys(request).length > 0;
};
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "string") return true;
};
const isvalidPincode = function (pincode) {
  if (/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(pincode)) return true;
  return false;
};
const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

const isValidStatus = function (status) {
  return ["pending", "completed", "cancelled"].indexOf(status) !== -1;
};

const isValidImage = function (image) {
  return /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/.test(image)
}

/////////////////////////////////////////////////// userValidation /////////////////////////////////////////////////////////

module.exports = {
  isValidName, isValidPhone, isValidEmail, isValidPassword, isValidRequestBody, isValid, isValidImage,
  isvalidPincode, isValidObjectId, isValidprice, isValidInstallment, isValidDescription, isValidStatus,
  isValidTitle
};
