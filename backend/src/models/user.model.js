const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userModel = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    url_image: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userModel);
