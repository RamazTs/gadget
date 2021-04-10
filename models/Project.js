const mongoose = require('mongoose')

const mongoosePaginate = require('mongoose-paginate-v2');
const ActiveIntervals = require('./ActiveIntervals')
const Schema = mongoose.Schema
const {ASSIGNMENT} = require("../util/constants")
const [_, IDLE] = ASSIGNMENT

const project = new Schema({
  _id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: false,
    enum: ASSIGNMENT,
    default: IDLE
  },
  plateNumber: {
    type: Number,
    required: false,
    default: 0,
    enum: [0, 1, 2, 3, 4]
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: null
  },
  activeIntervals: {
    type: [ActiveIntervals.asSchema()],
    required: true
  },
  startDate: {
    type: Schema.Types.Date,
    required: true,
  },
  endDate: {
    type: Schema.Types.Date,
    required: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    required: true,
  },
  updatedAt: {
    type: Schema.Types.Date,
    required: false,
    default: null
  },
}, {_id: false, versionKey: false})

project.pre("save", async function(next) {
  if (this.isNew) this.started_at = new Date();
  this.updatedAt = new Date();
  next();
});

project.plugin(mongoosePaginate);

module.exports = mongoose.model('Project', project)
