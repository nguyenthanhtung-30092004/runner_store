const { BadRequestError } = require("../core/error.response");
const { Created, OK } = require("../core/success.response");
const productModel = require("../models/product.model");
const cloudinary = require("../config/cloudDinary");
const slugify = require("../utils/slugify");
const fs = require("fs/promises");

class ProductController {
  async createProduct(req, res) {
    let uploadedPublicIds = [];

    try {
      // lấy ảnh
      if (!req.files || req.files.length === 0) {
        throw new BadRequestError("Ảnh sản phẩm không được để trống.");
      }
      const {
        nameProduct,
        priceProduct,
        description,
        categoryProduct,
        brandProduct,
        variants,
      } = req.body;

      if (
        !nameProduct ||
        !priceProduct ||
        !description ||
        !categoryProduct ||
        !brandProduct ||
        !variants
      ) {
        await Promise.all(req.files.map((file) => fs.unlink(file.path)));
        throw new BadRequestError("Thiếu thông tin của sản phẩm");
      }

      const slugProduct = slugify(nameProduct); //duong dan

      const imagesProduct = [];
      const imagePublicIds = [];

      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          resource_type: "image",
        });

        imagesProduct.push(uploadResult.secure_url);
        imagePublicIds.push(uploadResult.public_id);
        uploadedPublicIds.push(uploadResult.public_id);

        try {
          await fs.access(file.path);
          await fs.unlink(file.path);
        } catch (err) {
          // file không tồn tại thì bỏ qua
        }
      }

      const newProduct = await productModel.create({
        nameProduct,
        priceProduct,
        slugProduct,
        description,
        imagesProduct,
        imagePublicIds,
        categoryProduct,
        brandProduct,
        variants: JSON.parse(variants),
      });
      return new Created({
        message: "Tạo sản phẩm thành công",
        metadata: newProduct,
      }).send(res);
    } catch (error) {
      if (uploadedPublicIds.length > 0) {
        await Promise.all(
          uploadedPublicIds.map((id) => cloudinary.uploader.destroy(id))
        );
      }
      console.log(error);
    }
  }
  async getAllProducts(req, res) {
    try {
      const products = await productModel.find({});
      return res.status(200).json({
        message: "Lấy tất cả sản phẩm thành công",
        metadata: products,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;
      const product = await productModel.findOne({ slugProduct: slug });
      if (!product) {
        throw new BadRequestError("Sản phẩm không tồn tại");
      }
      return new OK({
        message: "Lấy sản phẩm thành công",
        metadata: product,
      }).send(res);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateProduct(req, res) {
    let updatedPublicIds = [];
    try {
      const { slug } = req.params;
      const product = await productModel.findOne({ slugProduct: slug });
      if (!product) {
        throw new BadRequestError("Sản phẩm không tồn tại");
      }
      console.log(product.imagesProduct);
      const {
        nameProduct,
        priceProduct,
        description,
        categoryProduct,
        brandProduct,
        variants,
      } = req.body;

      let imagesProduct = product.imagesProduct;
      let imagePublicIds = product.imagePublicIds;

      if (req.files && req.files.length > 0) {
        const newImagesProduct = [];
        const newImagePublicIds = [];

        for (const file of req.files) {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            resource_type: "image",
          });
          newImagesProduct.push(uploadResult.secure_url);
          newImagePublicIds.push(uploadResult.public_id);
          updatedPublicIds.push(uploadResult.public_id);
          try {
            await fs.access(file.path);
            await fs.unlink(file.path);
          } catch (err) {}
        }

        if (imagesProduct.length > 0) {
          await Promise.all(
            imagePublicIds.map((id) => cloudinary.uploader.destroy(id))
          );
        }

        imagesProduct = newImagesProduct;
        imagePublicIds = newImagePublicIds;
      }
      const updatedProduct = await productModel.findOneAndUpdate(
        { slugProduct: slug },
        {
          nameProduct,
          priceProduct,
          slugProduct: slugify(nameProduct),
          description,
          imagesProduct,
          imagePublicIds,
          categoryProduct,
          brandProduct,
          variants: variants ? JSON.parse(variants) : product.variants,
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Cập nhật sản phẩm thành công",
        metadata: updatedProduct,
      });
    } catch (error) {
      if (updatedPublicIds.length > 0) {
        await Promise.all(
          updatedPublicIds.map((id) => cloudinary.uploader.destroy(id))
        );
      }
      console.log(error);
      throw error;
    }
  }
  async deleteProduct(req, res) {
    const { slug } = req.params;
    const product = await productModel.findOneAndDelete({
      slugProduct: slug,
    });
    let imagePublicIds = product.imagePublicIds;
    if (!product) {
      throw new BadRequestError("Sản phẩm không tồn tại");
    }
    if (imagePublicIds.length > 0) {
      await Promise.all(
        imagePublicIds.map((id) => cloudinary.uploader.destroy(id))
      );
      return res.status(200).json({
        message: "Xóa sản phẩm thành công",
        metadata: product,
      });
    }
  }
}
module.exports = new ProductController();
