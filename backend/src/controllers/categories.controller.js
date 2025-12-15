const { BadRequestError, NotFoundError } = require("../core/error.response");
const categoryModel = require("../models/category.model");
const slugify = require("../utils/slugify");

class CategoryController {
  async createCategory(req, res) {
    const { name } = req.body;
    if (!name) {
      throw new BadRequestError("Tên danh mục không được để trống");
    }
    const slug = slugify(name);
    const findSlug = await categoryModel.findOne({ slug: slug });
    if (findSlug) {
      throw new BadRequestError("Danh mục đã tồn tại");
    }
    const newCategory = await categoryModel.create({ name, slug });
    return res.status(201).json({
      message: "Tạo danh mục thành công",
      metadata: newCategory,
    });
  }
  async getAllCategories(req, res) {
    const categories = await categoryModel.find();
    return res.status(200).json({
      message: "Lấy danh sách danh mục thành công",
      metadata: categories,
    });
  }
  async updateCategory(req, res) {
    const { slug } = req.params;
    const { name } = req.body;
    if (!name) {
      throw new BadRequestError("Tên thương hiệu không được để trống");
    }
    const newSlug = slugify(name);
    const findSlug = await categoryModel.findOne({ slug: newSlug });
    if (findSlug) {
      throw new BadRequestError("Danh mục đã tồn tại");
    }
    const updatedCategory = await categoryModel.findOneAndUpdate(
      { slug },
      { name: name, slug: newSlug },
      {
        new: true,
      }
    );
    if (!updatedCategory) {
      throw new NotFoundError("Danh mục không tồn tại");
    }
    return res.status(200).json({
      message: "Cập nhật danh mục thành công thành công",
      metadata: updatedCategory,
    });
  }

  async deleteCategory(req, res) {
    const { slug } = req.params;
    const deleteCategory = await categoryModel.findOneAndDelete({ slug });
    if (!deleteCategory) {
      throw new NotFoundError("Danh mục không tồn tại");
    }
    return res.status(200).json({
      message: "Xóa danh mục thành công",
      metadata: deleteCategory,
    });
  }
}
module.exports = new CategoryController();
