const AdminModel = require("../models/admin_model");
const { success, failure, writeToLogFile } = require("../util/common.js");
const { generateAdminToken } = require("../util/token_generator");
const HTTP_STATUS = require("../constants/status_codes.js");
const HTTP_RESPONSE = require("../constants/status_response");
const RESPONSE_MESSAGE = require("../constants/response_message");
const bcrypt = require("bcrypt");

class AdminController {
    async signup(req, res) {
        try {
            const response = JSON.parse(req.body);
            const { email, password, securityKey, superAdmin } = response;

            const isEmailExists = await AdminModel.findOne({ email });
            if (isEmailExists) {
                writeToLogFile(`Error: Failed to Signup Admin Email: ${email} already exists`);
                return failure(res, HTTP_STATUS.CONFLICT, RESPONSE_MESSAGE.SIGNUP_FAILED, RESPONSE_MESSAGE.EMAIL_EXIST);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = {
                email: email,
                password: hashedPassword,
                securityKey: securityKey,
                superAdmin: superAdmin,
            };

            await AdminModel.create(newAdmin)
                .then(async (admin) => {
                    delete newAdmin.password;
                    const token = await generateAdminToken(newAdmin);

                    writeToLogFile(`Auth: Successfully Signup Admin and ID: ${admin._id}`);
                    return success(res, HTTP_STATUS.CREATED, RESPONSE_MESSAGE.SIGNUP_SUCCESS, {
                        token,
                        data: { id: admin._id, ...newAdmin },
                    });
                })
                .catch((err) => {
                    console.log(err);
                    writeToLogFile(`Error: Failed to Signup Admin ${err}`);
                    return failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
                });
        } catch (err) {
            console.log(err);
            writeToLogFile(`Error: Failed to Signup Admin${err}`);
            failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.SIGNUP_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }

    async login(req, res) {
        try {
            const { email, password } = JSON.parse(req.body);
            let responseData, token;

            const auth = await AdminModel.findOne({ email }).exec();
            if (!auth) {
                writeToLogFile(`Error: Failed to Login Admin with Email: ${email} Doesn't Exists`);
                return failure(res, HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGE.LOGIN_FAILED, RESPONSE_MESSAGE.EMAIL_DOESNT_EXIST);
            }

            if (auth.blockUntil && auth.blockUntil > new Date()) {
                const remainingTimeInSeconds = Math.ceil(
                    (auth.blockUntil - new Date()) / 1000
                );
                writeToLogFile(`Error: Failed to Login Admin With Email: ${email}. ID is Blocked Untill ${auth.blockUntil}`);
                return failure(res, HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGE.LOGIN_FAILED, `Account is blocked. Try again in ${remainingTimeInSeconds} seconds.`);
            }

            const isPasswordValid = await bcrypt.compare(password, auth.password);
            if (!isPasswordValid) {
                auth.loginAttempts = (auth.loginAttempts || 0) + 1;

                if (auth.loginAttempts >= 5) {
                    const blockUntil = new Date(Date.now() + 5 * 60 * 1000);
                    auth.blockUntil = blockUntil;
                    auth.loginAttempts = 0;

                    await auth.save();
                    writeToLogFile(`Error: Failed to Login With Email: ${email}. ID is Blocked Untill ${blockUntil}`);
                    return failure(res, HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGE.LOGIN_FAILED, RESPONSE_MESSAGE.BLOCK_ACCOUNT);
                }

                await auth.save();
                writeToLogFile(`Error: Failed to Login Admin With Email: ${email}. Invalid Password`);
                return failure(res, HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGE.LOGIN_FAILED, RESPONSE_MESSAGE.INVALID_CREDENTIAL);
            }

            delete auth.password;
            token = await generateAdminToken(auth);
            responseData = auth;

            auth.loginAttempts = 0;
            writeToLogFile(`Auth: Successfully Login Admin and ID: ${auth._id}`);
            return success(res, HTTP_STATUS.OK, RESPONSE_MESSAGE.LOGIN_SUCCESS, { token: token, data: responseData });
        } catch (err) {
            console.log(err);
            writeToLogFile(`Error: Failed to Login Admin${err}`);
            failure(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, RESPONSE_MESSAGE.LOGIN_FAILED, HTTP_RESPONSE.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = new AdminController();