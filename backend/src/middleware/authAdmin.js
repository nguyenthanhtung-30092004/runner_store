const { verifyToken } = require("../auth/checkAuth");
const { AuthFailureError } = require("../core/error.response");
const userModel = require("../models/user.model");

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
    const userRole = await userModel.findById(decoded.userId).select("role");
    if (userRole.role !== "admin") {
      throw new AuthFailureError("Bạn không có quyền truy cập");
    }

    req.user = decoded.userId;
    next();
  } catch (error) {
    console.log("error", error);
  }
};
module.exports = { authAdmin };
