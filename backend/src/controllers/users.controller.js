const {
  ConflictRequestError,
  BadRequestError,
} = require("../core/error.response");
const { Created } = require("../core/success.response");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
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
    new Created({
      message: "Đăng ký thành công",
      metadata: newUser,
    }).send(res);
  }
  async login(req, res) {}
}

module.exports = new UsersController();
