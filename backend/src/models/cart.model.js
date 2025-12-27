const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartModel = new Schema({
  cartId: { type: String, required: true, unique: true },

  userId: { type: mongoose.Schema.ObjectId, ref: "users", default: null },

  items: [
    {
      productId: {
        type: mongoose.Schema.ObjectId,
        ref: "products",
        required: true,
      },
      variantSku: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 },
    },
  ],
  coupon: {
    code: { type: String },
    discount: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("carts", cartModel);
