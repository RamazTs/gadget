// console.log('No value for FOO yet:', process.env.FOO);
//
// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }
//
// console.log('Now the value for FOO is:', process.env.FOO);

const datefns = require("date-fns")
//
// const date = datefns.addHours(datefns.parse("5/3/2020", "dd/MM/yyyy", new Date()), 4)
// console.log(date)
//
// const result = datefns.differenceInHours(
//   new Date(2014, 6, 2, 19, 0),
//   new Date(2014, 6, 2, 6, 50)
// )
//
// console.log(result)

const ProjectIntervals = require("./models/ProjectInterval")
const startOfWeek = datefns.startOfWeek(new Date)

const getWeekDays = async () => (
  await ProjectIntervals.aggregate([
    {
      $match:
        {
          createdAt: {
            $gte:  datefns.startOfWeek(new Date),
            $lt:  datefns.endOfWeek(new Date)
          },
        }
    },
    {
      $project:
        {
          day: {$dayOfWeek: "$startDate"}
        }
    }
  ]).exec()
)

getWeekDays().then(res => console.log(res))
