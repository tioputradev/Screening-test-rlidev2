const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

/**
 * @swagger
 *
 * /users/login:
 *   post:
 *     summary: Login
 *     tags:
 *       - Authentication
 *     description: Login to get access token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: credentials
 *         description: email and password
 *         in: body
 *         required: true
 *         schema:
 *           properties:
 *             email:
 *               type: string
 *               required: true
 *               example: jhondoe@gmail.com
 *             password:
 *               type: string
 *               required: true
 *               example: passwordku
 *     responses:
 *       200:
 *         description: login
 */
exports.userLogin = async (req, res) => {
  try {
    // get data from request body
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ where: { email: email } });

    // if user not found return 404
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email didn't exists" });

    // if password doesn't match return with 401 unauthorize
    if (!bcrypt.compareSync(password, user.password))
      return res
        .status(401)
        .json({ success: false, message: "Wrong password" });

    // generate access token
    const token = jwt.sign({ id: user.id }, "secret");

    // return with 200 status code with token
    res.status(200).json({ message: "success", accessToken: token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @swagger
 *
 * /users/register:
 *   post:
 *     summary: Register
 *     tags:
 *       - Authentication
 *     description: Register a user and get access token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: credentials
 *         description: email, name, and password
 *         in: body
 *         required: true
 *         type: string
 *         schema:
 *           properties:
 *             email:
 *               type: string
 *               required: true
 *               example: jhondoe@gmail.com
 *             name:
 *               type: string
 *               required: true
 *               example: jhon doe
 *             password:
 *               type: string
 *               required: true
 *               example: passwordku
 *     responses:
 *       200:
 *         description: register
 */
exports.userRegister = async (req, res) => {
  try {
    // get data
    const { email, name, password } = req.body;

    // check if email already exists
    const findUser = await User.findOne({ where: { email: email } });
    if (findUser)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    // generate salt and hash for password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // create user
    const user = await User.create({
      email,
      name,
      password: hash
    });

    // generate access token
    const token = jwt.sign({ id: user.id }, "secret");

    // return 200 successful
    res.status(200).json({
      success: true,
      data: { name: user.name, email: user.email, accessToken: token }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};