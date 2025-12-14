const brandModel = require("../models/brand.model");

class BrandControllers {
  async createBrand(req, res) {
    const { name } = req.body;
    if (!name) {
      throw new BadRequestError("Tên thương hiệu không được để trống");
    }
    const newBrand = await brandModel.create({ name });
    return res.status(201).json({
      message: "Tạo thương hiệu thành công",
      metadata: newBrand,
    });
  }
  async getAllBrands(req, res) {
    const brands = await brandModel.find();
    return res.status(200).json({
      message: "Lấy danh sách thương hiệu thành công",
      metadata: brands,
    });
  }
  async updateBrand(req, res) {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      throw new BadRequestError("Tên thương hiệu không được để trống");
    }
    const updatedBrand = await brandModel.findByIdAndUpdate(
      id,
      { name: name },
      {
        new: true,
      }
    );
    if (!updatedBrand) {
      throw new NotFoundError("Thương hiệu không tồn tại");
    }

    return res.status(200).json({
      message: "Cập nhật thương hiệu thành công",
      metadata: updatedBrand,
    });
  }

  async deleteBrand(req, res) {
    const { id } = req.params;
    const deletedBrand = await brandModel.findByIdAndDelete(id);
    if (!deletedBrand) {
      throw new NotFoundError("Thương hiệu không tồn tại");
    }
    return res.status(200).json({
      message: "Xóa thương hiệu thành công",
      metadata: deletedBrand,
    });
  }
}
module.exports = new BrandControllers();
