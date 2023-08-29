const express = require("express");
const restaurantRoutes = require('./routes/restaurant_route.js');
const userRoutes = require('./routes/user_route.js');
// const orderController = require('./controllers/orders_controller.js');
// const userController = require('./controllers/user_controller.js');

const PORT = 8000;
const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/restaurant', restaurantRoutes);
app.use('/user', userRoutes);
// app.use('/order', orderController);
// app.use('/user', userController);  

app.use((req, res) => {
  failure(res, 400, "Not Found", "Request not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
