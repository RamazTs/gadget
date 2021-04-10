const mongoose = require('mongoose')
const { STATUSES } = require('../util/constants')
const Schema = mongoose.Schema

const mongoosePaginate = require('mongoose-paginate-v2');

const projectInterval = new Schema({
  _id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: STATUSES,
    required: true
  },
  userId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true
  },
  startedAt: {
    type: Schema.Types.Date,
    required: true,
  },
  finishedAt: {
    type: Schema.Types.Date,
    default: null
  },
  minutes: {
    type: Number,
    default: 0
  }
}, {_id: false, versionKey: false})

projectInterval.plugin(mongoosePaginate);

module.exports = mongoose.model('ProjectInterval', projectInterval)
