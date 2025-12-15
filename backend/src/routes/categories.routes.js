const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const categoriesController = require("../controllers/categories.controller");
router.post(
  "/create",
  authAdmin,
  asyncHandler(categoriesController.createCategory)
);
router.get(
  "/getAllCategories",
  authAdmin,
  asyncHandler(categoriesController.getAllCategories)
);
router.put(
  "/update/:slug",
  authAdmin,
  asyncHandler(categoriesController.updateCategory)
);

router.delete(
  "/delete/:slug",
  authAdmin,
  asyncHandler(categoriesController.deleteCategory)
);

module.exports = router;
