const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const variantSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    stock: { type: Number, requied: true, default: 0, min: 0 },
    discountProduct: { type: Number, default: 0 },
    sale_start_date: { type: Date },
    sale_end_date: { type: Date },
  },
  { _id: false }
);

const productModel = new Schema(
  {
    nameProduct: { type: String, required: true },
    priceProduct: { type: Number, required: true, min: 0 },
    slugProduct: { type: String, required: true },
    description: { type: String, require: true },
    imagesProduct: [{ type: String, required: true }],
    imagePublicIds: [{ type: String, required: true }],
    categoryProduct: {
      type: mongoose.Schema.ObjectId,
      ref: "categories",
      required: true,
    },
    brandProduct: {
      type: mongoose.Schema.ObjectId,
      ref: "brands",
      required: true,
    },
    variants: [variantSchema],
  },
  { timestamps: true }
);
module.exports = mongoose.model("products", productModel);
