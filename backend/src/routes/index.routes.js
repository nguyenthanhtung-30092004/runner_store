const usersRoutes = require("../routes/users.routes");

function routes(app) {
  app.use("/api/user", usersRoutes);
}
module.exports = routes;
