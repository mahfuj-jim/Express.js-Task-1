const fsPromise = require("fs").promises;
const path = require("path");
const {writeToLogFile} = require("../util/common.js");

class User {
  constructor() {
    this.userFilePath = path.join(
      __dirname,
      "..",
      "data",
      "users.json"
    );
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
      console.error(err);
      return { success: false, code: 500, error: "Internal Server Issue" };
    }
  }
}

module.exports = new User();
