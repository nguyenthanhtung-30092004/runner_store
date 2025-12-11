const { AuthFailureError } = require("../core/error.response");
const { verifyToken } = require("../auth/checkAuth");

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
module.exports = { authUser };
