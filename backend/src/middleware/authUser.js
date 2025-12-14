const { AuthFailureError } = require("../core/error.response");
const { verifyToken } = require("../auth/checkAuth");
const userModel = require("../models/user.model");

const authUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new AuthFailureError("Vui lòng đăng nhập lại");
    }
    const decoded = await verifyToken(accessToken);
    console.log("decoded", decoded);
    if (!decoded) {
      throw new AuthFailureError("Vui lòng đăng nhập lại");
    }
    req.user = decoded.userId;
    next();
  } catch (error) {
    throw new AuthFailureError("Vui lòng đăng nhập lại");
  }
};

const authAdmin = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new AuthFailureError("Vui lòng đăng nhập lại");
    }
    const decoded = await verifyToken(accessToken);
    if (!decoded) {
      throw new AuthFailureError("Vui lòng đăng nhập lại");
    }
    const findUser = await userModel.findById(decoded.userId);
    console.log("findUser", findUser);
    if (!findUser) {
      throw new AuthFailureError("Người dùng không tồn tại");
    }
    if (findUser.role !== "admin") {
      throw new AuthFailureError("Bạn không có quyền truy cập");
    }
    next();
  } catch (error) {
    console.log("error", error);
  }
};
module.exports = { authUser, authAdmin };
