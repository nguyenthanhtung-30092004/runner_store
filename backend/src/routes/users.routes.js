const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../auth/checkAuth");
const { authUser } = require("../middleware/authUser");
const usersController = require("../controllers/users.controller");

router.post("/register", asyncHandler(usersController.register));
router.post("/login", asyncHandler(usersController.login));
router.get("/auth", authUser, asyncHandler(usersController.authUser));
router.get("/logout", authUser, asyncHandler(usersController.logout));

module.exports = router;
