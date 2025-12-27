const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../auth/checkAuth");
const cartController = require("../controllers/carts.controller");

router.post("/create", asyncHandler(cartController.createCart));
router.get("/get", asyncHandler(cartController.getCart));
router.put("/update", asyncHandler(cartController.updateCart));
router.delete("/removeItem", asyncHandler(cartController.removeCartItem));
router.delete("/clear", asyncHandler(cartController.clearCart));

module.exports = router;
