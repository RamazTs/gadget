const User = require("../models/User.js")
const {ERRORS} = require("../util/constants")
const {v4: uuidv4} = require('uuid');
const sendError = (res, error, status = 404) => res.status(status).send({error})
const bcrypt = require("bcryptjs")
const jwtUtils = require("../util/jwt")
const validations = require("../util/validations")

exports.register = async (req, res) => {
  try {
    const name = req.body.name
    const lastname = req.body.lastname
    const password = req.body.password
    const email = req.body.email

    if (!email || !lastname || !password || !name)
      return sendError(res, ERRORS.ERROR_FIELDS_MISSING)

    if (!email || !validations.emailRegex(email))
      return sendError(res, ERRORS.ERROR_INVALID_EMAIL)

    const user = await User.findOne({email}).exec()

    if (user)
      return sendError(res, ERRORS.ERROR_EMAIL_ALREADY_IN_USE)

    if (!name || !validations.nameRegex(name))
      return sendError(res, ERRORS.ERROR_INVALID_NAME)

    if (!lastname || !validations.nameRegex(name))
      return sendError(res, ERRORS.ERROR_INVALID_LASTNAME)

    if (!password || !validations.fullPasswordValidation(password))
      return sendError(res, ERRORS.ERROR_INVALID_PASSWORD)


    const body = {
      _id: `USER-${uuidv4()}`,
      name,
      lastname,
      password,
      email,
      registered_at: new Date()
    }

    const createdUser = await new User(body).save()

    res.send({...createdUser._doc, password: undefined})
  } catch (error) {
    sendError(res,ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}


exports.login = async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || typeof email !== "string")
    return sendError(res, ERRORS.ERROR_FIELDS_EMAIL_MALFORMED_OR_MISSING)

  if (!password || typeof password !== "string")
    return sendError(res, ERRORS.ERROR_FIELDS_PASSWORD_MALFORMED_OR_MISSING)

  try {
    const user = await User.findOne({email}).exec()
    if (!user) {
      console.log("user not found")
      return sendError(res, ERRORS.ERROR_INVALID_EMAIL_OR_PASSWORD)
    }
    if (!bcrypt.compareSync(password, user.password)) {
      console.log("password was not correct")
      return sendError(res, ERRORS.ERROR_INVALID_EMAIL_OR_PASSWORD)
    }
    const jwt = jwtUtils.generateJWT(user)
    res.send({jwt, userId: user._id})
  } catch (error) {
    sendError(res,ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}


exports.getProfile = async (req, res) => {

  const token = req.get("Authorization")
  if (!token)
    return sendError(res, ERRORS.ERROR_TOKEN_MISSING, 401)

  try {
    jwtUtils.verifyJWT(token)
  } catch (error) {
    return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
  }

  const userId = req.params.userId
  if (!userId)
    return sendError(res, ERRORS.ERROR_NO_SUCH_USER_FOUND)

  try {
    const user = await User.findOne({_id: userId}).exec()
    console.log(userId)
    console.log(user)
    if (!user)
      return sendError(res, ERRORS.ERROR_NO_SUCH_USER_FOUND, 404)
    res.send({...user._doc, password: undefined})
  } catch (error) {
    return sendError(res,ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}
