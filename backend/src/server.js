const express = require("express");

const app = express();
const port = 3000;

const bodyParser = require("body-parser");

const bcrypt = require("bcrypt");

const connectDB = require("./config/connectDB");
const routes = require("./routes/index.routes");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

routes(app);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi server",
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
