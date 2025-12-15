const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const brandModel = new Schema(
  {
    name: { type: String, required: true },
    imageBrand: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("brands", brandModel);
