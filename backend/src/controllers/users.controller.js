const { createAccessToken, createRefreshToken } = require("../auth/checkAuth");
const SendMailForgotPassword = require("../utils/mailForgotPassword");
const {
  ConflictRequestError,
  BadRequestError,
  NotFoundError,
} = require("../core/error.response");

const { Created, OK } = require("../core/success.response");
const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

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

  async forgotPassword(req, res) {
    const { email } = req.body;
    const findUser = await userModel.findOne({ email });
    if (!findUser) {
      throw new NotFoundError("Người dùng không tồn tại");
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const tokenForgotPassword = jwt.sign(
      { email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    res.cookie("tokenForgotPassword", tokenForgotPassword, {
      httpOnly: false,
      secure: true,
      maxAge: 5 * 60 * 1000,
      sameSite: "strict",
    });

    await otpModel.create({
      otp,
      email,
    });

    await SendMailForgotPassword(email, otp);

    return new OK({
      message: "Gửi mã OTP thành công",
      metadata: true,
    }).send(res);
  }

  async verifyForgotPassword(req, res) {
    const { otp, password } = req.body;
    const tokenForgotPassword = req.cookies.tokenForgotPassword;
    if (!tokenForgotPassword) {
      throw new BadRequestError("Token hết hạn, vui lòng thử lại");
    }

    const decoded = jwt.verify(
      tokenForgotPassword,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!decoded) {
      throw new BadRequestError("Token không hợp lệ, vui lòng thử lại");
    }

    const email = decoded.email;
    const findOtp = await otpModel.findOne({ email, otp });
    if (!findOtp) {
      throw new BadRequestError("Mã OTP không hợp lệ");
    }

    const findUser = await userModel.findOne({ email });
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    findUser.password = hashedPassword;
    await findUser.save();
    await otpModel.deleteMany({ email });
    res.clearCookie("tokenForgotPassword");

    return new OK({
      message: "Đặt lại mật khẩu thành công",
      metadata: true,
    }).send(res);
  }
}

module.exports = new UsersController();
