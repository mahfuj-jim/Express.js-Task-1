const jwt = require("jsonwebtoken");

const generateAdminToken = async (admin) => {
  const token = jwt.sign(
    {
      admin: {
        _id: admin.id,
        securityKey: admin.securityKey,
        superAdmin: admin.superAdmin,
      },
      role: "admin",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return token;
};

const generateUserToken = async (user) => {
  const token = jwt.sign(
    {
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phoneNumber,
        location: user.location,
      },
      role: "user",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return token;
};

const generateRestaurantToken = async (restaurant) => {
  const token = jwt.sign(
    {
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        location: restaurant.location,
        cuisine: restaurant.cuisine,
        contactNumber: restaurant.contactNumber,
        owner: restaurant.owner,
        email: restaurant.email,
      },
      role: "restaurant",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return token;
};

const generateRiderToken = async (rider) => {
  const token = jwt.sign(
    {
      rider: {
        _id: rider._id,
        email: rider.email,
        name: rider.name,
        phoneNumber: rider.phoneNumber,
        nidNumber: rider.nidNumber
      },
      role: "rider",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3d",
    }
  );

  return token;
};


module.exports = {
  generateAdminToken,
  generateUserToken,
  generateRestaurantToken,
  generateRiderToken
};