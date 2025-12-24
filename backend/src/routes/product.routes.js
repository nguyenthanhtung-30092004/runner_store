const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const { asyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const productsController = require("../controllers/products.controller");

router.post(
  "/create",
  authAdmin,
  upload.array("imagesProduct", 100),
  asyncHandler(productsController.createProduct)
);
router.get(
  "/getAllProducts",
  authAdmin,
  asyncHandler(productsController.getAllProducts)
);
router.put(
  "/update/:slug",
  authAdmin,
  upload.array("imagesProduct", 100),
  asyncHandler(productsController.updateProduct)
);

router.delete(
  "/delete/:slug",
  authAdmin,
  asyncHandler(productsController.deleteProduct)
);

module.exports = router;
