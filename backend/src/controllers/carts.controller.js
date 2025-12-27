const { default: mongoose } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const productModel = require("../models/product.model");
const cartModel = require("../models/cart.model");
const { OK } = require("../core/success.response");
const { subscribe } = require("../routes/product.routes");
class cartController {
  async createCart(req, res) {
    try {
      // lấy thông tin từ req.body
      const { productId, variantSku, quantity = 1 } = req.body;

      // lấy userId từ req.user nếu đã đăng nhập
      const userId = req.user?._id || null;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return new BadRequestError("Invalid product ID");
      }

      //kiểm tra sản phẩm và các biến thể
      const product = await productModel.findById(productId);
      if (!product) {
        return new BadRequestError("Product not found");
      }

      const variant = product.variants.find((v) => v.sku === variantSku);
      if (!variant) {
        return new BadRequestError("Variant not found");
      }

      let cart;

      // kiểm tra xem có cookie cartId không
      let cartId = req.cookies?.cartId;

      // nếu có userId thì tìm giỏ hàng theo userId, không thì theo cartId
      if (userId) {
        cart = await cartModel.findOne({ user: userId });
      } else {
        if (!cartId) {
          cartId = crypto.randomUUID();
        }
        {
          cart = await cartModel.findOne({ cartId: cartId });
        }
      }

      if (!cart) {
        cart = new cartModel({
          cartId: cartId || crypto.randomUUID(),
          userId,
          items: [],
        });
      }

      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.variantSku === variantSku
      );

      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + Number(quantity);
        if (newQuantity > variant.stock) {
          return new BadRequestError("Vượt quá số lượng tồn kho");
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({
          productId,
          variantSku,
          quantity,
        });
      }
      await cart.save();

      if (!userId) {
        res.cookie("cartId", cart.cartId, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      return new OK({
        message: "Thêm vào giỏ hàng thành công",
        metadata: cart,
      }).send(res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateCart(req, res) {
    try {
      const { productId, variantSku, quantity } = req.body;

      const userId = req.user?._id || null;

      const newQuantity = Number(quantity);
      if (!newQuantity || newQuantity < 1) {
        throw new BadRequestError("Số lượng không hợp lệ");
      }

      const product = await productModel.findById(productId);
      if (!product) {
        throw new BadRequestError("Sản phẩm không tồn tại");
      }

      const variant = product.variants.find((v) => v.sku === variantSku);
      if (!variant) {
        throw new BadRequestError("Biến thể không tồn tại");
      }

      let cart;
      const cartId = req.cookies?.cartId;
      if (userId) {
        cart = await cartModel.findOne({ userId: userId });
      } else {
        if (!cartId) {
          throw new BadRequestError("Giỏ hàng không tồn tại");
        }
        cart = await cartModel.findOne({ cartId: cartId });
      }

      if (!cart) {
        throw new BadRequestError("Giỏ hàng không tồn tại");
      }

      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.variantSku === variantSku
      );

      if (itemIndex === -1) {
        throw new BadRequestError("Sản phẩm không có trong giỏ hàng");
      }

      if (newQuantity > variant.stock) {
        throw new BadRequestError("Vượt quá số lượng tồn kho");
      }

      cart.items[itemIndex].quantity = newQuantity;
      await cart.save();
      return new OK({
        message: "Cập nhật giỏ hàng thành công",
        metadata: cart,
      }).send(res);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async removeCartItem(req, res) {
    try {
      const { productId, variantSku } = req.body;

      const userId = req.user?._id || null;
      const cartId = req.cookies?.cartId;

      let cart;

      if (userId) {
        cart = await cartModel.findOne({ userId: userId });
      } else {
        if (!cartId) {
          throw new BadRequestError("Giỏ hàng không tồn tại");
        }
        cart = await cartModel.findOne({ cartId: cartId });
      }

      if (!cart) {
        throw new BadRequestError("Giỏ hàng không tồn tại");
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.variantSku === variantSku
          )
      );

      if (cart.items.length === initialLength) {
        throw new BadRequestError("Sản phẩm không có trong giỏ hàng");
      }
      await cart.save();
      return new OK({
        message: "Xóa sản phẩm khỏi giỏ hàng thành công",
        metadata: cart,
      }).send(res);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user?._id || null;
      const cartId = req.cookies?.cartId;

      let cart;
      if (userId) {
        cart = await cartModel.findOne({ userId: userId });
      } else {
        if (!cartId) {
          throw new BadRequestError("Giỏ hàng không tồn tại");
        }
        cart = await cartModel.findOne({ cartId: cartId });
      }
      if (!cart) {
        throw new BadRequestError("Giỏ hàng không tồn tại");
      }
      cart.items = [];
      cart.coupon = undefined;
      await cart.save();
      return new OK({
        message: "Xóa toàn bộ sản phẩm khỏi giỏ hàng thành công",
        metadata: cart,
      }).send(res);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCart(req, res) {
    try {
      const userId = req.user?._id || null;
      const cartId = req.cookies?.cartId;
      let cart;

      if (userId) {
        cart = await cartModel.findOne({ userId: userId }).populate({
          path: "items.productId",
          select: "nameProduct priceProduct imagesProduct slugProduct variants",
        });
      } else {
        if (!cartId) {
          return new OK({
            message: "Lấy giỏ trống",
            metadata: { items: [], totalItems: 0, totalPrice: 0 },
          }).send(res);
        }
      }

      cart = await cartModel.findOne({ cartId: cartId }).populate({
        path: "items.productId",
        select: "nameProduct priceProduct imagesProduct slugProduct variants",
      });
      if (!cart || cart.items.length === 0) {
        return new OK({
          message: "Giỏ hàng trống",
          metadata: { items: [], totalItems: 0, totalPrice: 0 },
        }).send(res);
      }
      const items = cart.items.map((item) => {
        const product = item.productId;
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        return {
          productId: product._id,
          name: product.nameProduct,
          slug: product.slugProduct,
          image: product.imagesProduct[0],
          price: product.priceProduct,
          variantSku: item.variantSku,
          variant: {
            size: variant.size || null,
            color: variant.color || null,
            stock: variant.stock || 0,
            discountProduct: variant.discountProduct || 0,
          },
          quantity: item.quantity,
          subTotal: product.priceProduct * item.quantity,
        };
      });

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.subTotal, 0);

      return new OK({
        message: "Lấy giỏ hàng thành công",
        metadata: {
          cartId: cart.cartId,
          items,
          totalItems,
          totalPrice,
          coupon: cart.coupon || null,
        },
      }).send(res);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = new cartController();
