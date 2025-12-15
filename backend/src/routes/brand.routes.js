const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/brands");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const { asyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const brandsController = require("../controllers/brands.controller");
router.post(
  "/create",
  authAdmin,
  upload.single("imageBrand"),
  asyncHandler(brandsController.createBrand)
);
router.get(
  "/getAllBrand",
  authAdmin,
  asyncHandler(brandsController.getAllBrands)
);
router.put(
  "/update/:id",
  authAdmin,
  upload.single("imageBrand"),
  asyncHandler(brandsController.updateBrand)
);

router.delete(
  "/delete/:id",
  authAdmin,
  asyncHandler(brandsController.deleteBrand)
);

module.exports = router;
