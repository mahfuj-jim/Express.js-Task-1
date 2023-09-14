const express = require("express");
const cors = require("cors");
const { failure } = require("./util/common.js");
const { databaseConnection } = require("./config/database.js");
const adminRoutes = require("./routes/admin_routes.js");
const authRoutes = require("./routes/auth_routes.js");
const userRoutes = require("./routes/user_routes.js");
const restaurantRoutes = require("./routes/restaurant_routes.js");
const reviewRoutes = require("./routes/review_routes.js");
const cartRoutes = require("./routes/cart_routes.js");
const orderRoutes = require("./routes/order_routes.js");
const transactionRoutes = require("./routes/transaction_routes.js");

const PORT = 8000;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/review", reviewRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/transaction", transactionRoutes);

app.set("view engine", "ejs");

app.get("/hello", (req, res) => {
  console.log("Hello");
  return res.render("hello.ejs");
});

app.use((req, res) => {
  return failure(res, 404, "Not Found", "Request Not Found");
});

databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
