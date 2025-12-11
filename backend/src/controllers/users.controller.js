const { createAccessToken, createRefreshToken } = require("../auth/checkAuth");
const {
  ConflictRequestError,
  BadRequestError,
  NotFoundError,
} = require("../core/error.response");
const { Created, OK } = require("../core/success.response");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

function setCookie(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  res.cookie("logged_in", 1, {
    httpOnly: false,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
}

class UsersController {
  async register(req, res) {
    const {
      username,
      password,
      fullname,
      email,
      phone,
      address,
      url_image,
      role,
    } = req.body;
    if (!fullname || !password || !fullname || !email || !phone) {
      throw new BadRequestError("Điền thiếu thông tin");
    }
    const findUser = await userModel.findOne({ email });
    if (findUser) {
      throw new ConflictRequestError("Email đã tồn tại");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.create({
      username,
      password: hashedPassword,
      fullname,
      email,
      phone,
      address,
      url_image,
      role,
    });

    const accessToken = createAccessToken({
      userId: newUser._id,
    });

    const refreshToken = createRefreshToken({
      userId: newUser._id,
    });

    setCookie(res, accessToken, refreshToken);
    return new Created({
      message: "Đăng ký thành công",
      metadata: newUser,
    }).send(res);
  }
  async login(req, res) {
    const { username, password } = req.body;
    const findUser = await userModel.findOne({ username });
    if (!findUser) {
      throw new BadRequestError("Tài khoản không tồn tại");
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    if (!isPasswordValid) {
      throw new BadRequestError("Mật khẩu không đúng");
    }

    const accessToken = createAccessToken({
      userId: findUser._id,
    });

    const refreshToken = createRefreshToken({
      userId: findUser._id,
    });

    setCookie(res, accessToken, refreshToken);

    return new OK({
      message: "Đăng nhập thành công",
      metadata: { accessToken, refreshToken },
    }).send(res);
  }
  async authUser(req, res) {
    const userId = req.user;
    const findUser = await userModel.findById(userId);
    if (!findUser) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    return new OK({
      message: "Xác thực thành công",
      metadata: findUser,
    }).send(res);
  }

  async logout(req, res) {
    const userId = req.user;
    const findUser = await userModel.findById(userId);
    if (!findUser) {
      throw new NotFoundError("Người dùng không tồn tại");
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("logged");

    return new OK({
      message: "Đăng xuất thành công",
      metadata: findUser,
    }).send(res);
  }
}

module.exports = new UsersController();
