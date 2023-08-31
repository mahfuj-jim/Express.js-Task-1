const express = require("express");
const cors = require("cors");
const { databaseConnection } = require("./config/database.js");
const restaurantRoutes = require("./routes/restaurant_route.js");
const userRoutes = require("./routes/user_route.js");
const orderRoutes = require("./routes/order_route.js");

const PORT = 8000;
const app = express();

// app.use(cors({origin: "www.example.com"}));
app.use(cors({ origin: "*" })); // it will set for all urls
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/restaurant", restaurantRoutes);
app.use("/user", userRoutes);
app.use("/order", orderRoutes);

app.use((req, res) => {
  failure(res, 400, "Not Found", "Request not found");
});

databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
