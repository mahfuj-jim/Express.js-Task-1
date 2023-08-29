const path = require("path");
const fsPromise = require("fs").promises;

const success = (res, message, result = null) => {
  res.status(200).send({ status: true, message: message, data: result });
};

const failure = (res, code, message, error = null) => {
  res.status(code).send({ status: false, message: message, error: error });
};

const getCurrentDateTime = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const writeToLogFile = async (message) => {
  const logFilePath = path.join(__dirname, "..", "server", "server.log");
  const formattedMessage = `${getCurrentDateTime()} - ${message}\n`;

  return fsPromise.appendFile(logFilePath, formattedMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
};

module.exports = { success, failure, writeToLogFile, getCurrentDateTime };
