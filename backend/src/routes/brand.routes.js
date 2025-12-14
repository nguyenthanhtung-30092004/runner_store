const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const brandsController = require("../controllers/brands.controller");
router.post("/create", authAdmin, asyncHandler(brandsController.createBrand));
router.get(
  "/getAllBrand",
  authAdmin,
  asyncHandler(brandsController.getAllBrands)
);
router.put(
  "/update/:id",
  authAdmin,
  asyncHandler(brandsController.updateBrand)
);

router.delete(
  "/delete/:id",
  authAdmin,
  asyncHandler(brandsController.deleteBrand)
);

module.exports = router;
