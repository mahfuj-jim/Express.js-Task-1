const express = require("express");
const restaurantController = require('./controllers/restaurant_controller.js');
const orderController = require('./controllers/orders_controller.js');
const userController = require('./controllers/user_controller.js');

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/restaurant', restaurantController);
app.use('/order', orderController);
app.use('/user', userController);

app.use((req, res) => {
  failure(res, 400, "Not Found", "Request not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
