const { BadRequestError, NotFoundError } = require("../core/error.response");
const brandModel = require("../models/brand.model");
const clouddinary = require("../config/cloudDinary");

const fs = require("fs/promises");
const { Created } = require("../core/success.response");

class BrandControllers {
  async createBrand(req, res) {
    const { name } = req.body;
    if (!name) {
      throw new BadRequestError("Tên thương hiệu không được để trống");
    }
    if (!req.file) {
      throw new BadRequestError("Ảnh thương hiệu không được để trống");
    }
    const findBrand = await brandModel.findOne({ name: name });
    if (findBrand) {
      await fs.unlink(req.file.path);
      throw new BadRequestError("Thương hiệu đã tồn tại");
    }
    const uploadResult = await clouddinary.uploader.upload(req.file.path, {
      folder: "brands",
      resource_type: "image",
    });
    const newBrand = await brandModel.create({
      name,
      imageBrand: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    });
    await fs.unlink(req.file.path);
    return new Created({
      message: "Tạo thương hiệu thành công",
      metadata: newBrand,
    }).send(res);
  }
  async getAllBrands(req, res) {
    const brands = await brandModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Lấy danh sách thương hiệu thành công",
      metadata: brands,
    });
  }
  async updateBrand(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      await fs.unlink(req.file.path);
      throw new BadRequestError("Tên thương hiệu không được để trống");
    }

    const brand = await brandModel.findById(id);
    if (!brand) {
      await fs.unlink(req.file.path);
      throw new NotFoundError("Thương hiệu không tồn tại");
    }
    //sau khi gửi req thì kiếm tra tên đã tồn tại chưa
    const existedBrand = await brandModel.findOne({
      name: name,
      _id: { $ne: id },
    });

    if (existedBrand) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      throw new BadRequestError("Thương hiệu đã tồn tại");
    }
    // cập nhật hình ảnh nếu có
    if (req.file) {
      const uploadResult = await clouddinary.uploader.upload(req.file.path, {
        folder: "brands",
      });

      // Xóa ảnh cũ
      await clouddinary.uploader.destroy(brand.imagePublicId);
      brand.imageBrand = uploadResult.secure_url;
      brand.imagePublicId = uploadResult.public_id;
      await fs.unlink(req.file.path);
    }

    brand.name = name;
    await brand.save();

    return res.status(200).json({
      message: "Cập nhậts thương hiệu thành công",
      metadata: brand,
    });
  }

  async deleteBrand(req, res) {
    const { id } = req.params;
    const brand = await brandModel.findById(id);
    if (!brand) {
      throw new NotFoundError("Thương hiệu không tồn tại");
    }
    // xóa ảnh cloudinary
    await clouddinary.uploader.destroy(brand.imagePublicId);

    await brand.deleteOne();
    return res.status(200).json({
      message: "Xóa thương hiệu thành công",
      metadata: brand,
    });
  }
}
module.exports = new BrandControllers();
