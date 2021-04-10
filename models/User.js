const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const saltRounds = 12;
const Schema = mongoose.Schema

const userSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  registered_at: {
    type: Schema.Types.Date,
    required: true,
  }
}, {_id: false, versionKey: false})

userSchema.pre("save", async function (next) {
  if (this.isNew)
    this.password = bcrypt.hashSync(this.password, saltRounds)

  next();
});

module.exports = mongoose.model('User', userSchema)
