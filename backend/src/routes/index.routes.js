const usersRoutes = require("../routes/users.routes");
const brandRoutes = require("../routes/brand.routes");
function routes(app) {
  app.use("/api/user", usersRoutes);
  app.use("/api/brand", brandRoutes);
}
module.exports = routes;
