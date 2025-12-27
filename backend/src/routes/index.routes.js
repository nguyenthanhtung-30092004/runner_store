const usersRoutes = require("../routes/users.routes");
const brandRoutes = require("../routes/brand.routes");
const categoriesRoutes = require("../routes/categories.routes");
const productRoutes = require("../routes/product.routes");
const cartRoutes = require("../routes/cart.routes");
function routes(app) {
  app.use("/api/user", usersRoutes);
  app.use("/api/brand", brandRoutes);
  app.use("/api/category", categoriesRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/cart", cartRoutes);
}
module.exports = routes;
