const mongoose = require("mongoose");
const Schema = mongoose.Schema;

class ActiveIntervals {
  static asSchema() {
    return new Schema({
        weekday: {
          type: String,
          required: true
        },
        start: {
          type: String,
          required: true
        },
        end: {
          type: String,
          required: true
        }
      },
      {_id: false}
    );
  }

  constructor(weekday, start, end) {
    this.weekday = weekday
    this.start = start;
    this.end = end;
  }

  asObject() {
    return {...this};
  }
}

module.exports = ActiveIntervals
