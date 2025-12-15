const usersRoutes = require("../routes/users.routes");
const brandRoutes = require("../routes/brand.routes");
const categoriesRoutes = require("../routes/categories.routes");
function routes(app) {
  app.use("/api/user", usersRoutes);
  app.use("/api/brand", brandRoutes);
  app.use("/api/category", categoriesRoutes);
}
module.exports = routes;
