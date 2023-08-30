const fsPromise = require("fs").promises;
const path = require("path");
const { writeToLogFile } = require("../util/common.js");

class User {
  constructor() {
    this.userFilePath = path.join(__dirname, "..", "data", "users.json");
  }

  async getAllUserData(isSearch = false) {
    return fsPromise
      .readFile(this.userFilePath, "utf-8")
      .then((data) => {
        if (isSearch) {
          writeToLogFile("Get All User Data");
        }
        return { success: true, data: JSON.parse(data) };
      })
      .catch((err) => {
        return { success: false, error: "Internal Server Issue" };
      });
  }

  async getUserById(id) {
    try {
      const responseData = await this.getAllUserData();
      const userData = responseData.data;

      const user = userData.find((item) => item.user_id == id);

      if (typeof user != "undefined") {
        writeToLogFile(`Get User with ID ${id}`);
        return { success: true, data: user };
      } else {
        return { success: false, code: 400, error: "User ID is Not Valid" };
      }
    } catch (err) {
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async createUser(newUser) {
    try {
      const responseData = await this.getAllUserData();
      const userData = responseData.data;

      const userexist = await this.findByEmail(newUser.email);
      if (userexist) {
        return { success: false, code: 401, error: "Email Already Exist" };
      }

      newUser = {
        user_id: userData[userData.length - 1].user_id + 1,
        ...newUser,
      };

      userData.push(newUser);

      await fsPromise.writeFile(
        this.userFilePath,
        JSON.stringify(userData),
        "utf-8"
      );
      writeToLogFile(`SignUp User with ID ${userData.user_id}`);

      return {
        success: true,
        data: {
          user_id: newUser.user_id,
          name: newUser.name,
          email: newUser.email,
          phone_number: newUser.phoneNumber,
          location: newUser.location,
        },
      };
    } catch (err) {
      console.log(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }

  async findByEmail(email) {
    try {
      const responseData = await this.getAllUserData();
      const userData = responseData.data;

      const user = userData.find((item) => item.email === email);
      return user;
    } catch (err) {
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }
}

module.exports = new User();
