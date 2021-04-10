const Project = require("../models/Project")
const {
  ERRORS,
  ASSIGNMENT,
} = require("../util/constants")
const jwtUtils = require("../util/jwt")
const datefns = require("date-fns")
const ProjectInterval = require("../models/ProjectInterval")

const sendError = (res, error, status = 404) => res.status(status).send({error})


exports.getWeeklyReport = async (req, res) => {
  const userId = req.params.userId
  try {
    const token = req.get("Authorization")

    if (!token)
      return sendError(res, ERRORS.ERROR_TOKEN_MISSING, 401)

    try {
      const verifiedToken = jwtUtils.verifyJWT(token)
      if (verifiedToken.user._id !== userId)
        return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    } catch (error) {
      return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    }

    if (!userId)
      return sendError(res, ERRORS.ERROR_NO_SUCH_USER_FOUND)

    const date = new Date

    const data = await ProjectInterval.aggregate([
      {
        $match:
          {
            userId,
            startedAt: {
              $gte: datefns.startOfWeek(date),
              $lt: datefns.endOfWeek(date)
            },
          }
      },
      {
        $group:
          {
            _id: {$dayOfWeek: "$startedAt"},
            minutes: {$sum: "$minutes"},
          }
      }
    ]).exec()

    res.send(data)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}


exports.getOverallStats = async (req, res) => {
  const userId = req.params.userId
  try {
    const token = req.get("Authorization")

    if (!token)
      return sendError(res, ERRORS.ERROR_TOKEN_MISSING, 401)

    try {
      const verifiedToken = jwtUtils.verifyJWT(token)
      if (verifiedToken.user._id !== userId)
        return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    } catch (error) {
      return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    }

    if (!userId)
      return sendError(res, ERRORS.ERROR_NO_SUCH_USER_FOUND)


    const averageDailyMinutes = await ProjectInterval.aggregate([
      {
        $match:
          {
            userId,
          }
      },
      {
        $group:
          {
            _id: {$dayOfYear: "$startedAt"},
            minutes: {$sum: "$minutes"},
          }
      },
      {
        $group:
          {
            _id: "average daily",
            averageDailyMinutes: {$avg: "$minutes"},
          }
      }
    ]).exec()

    const totalWorked = await ProjectInterval.aggregate([
      {
        $match:
          {
            userId,
          }
      },
      {
        $group:
          {
            _id: "total time worked",
            totalTimeWorked: {$sum: "$minutes"},
          }
      },
    ]).exec()

    const totalTimeWorked = totalWorked.length > 0 ? totalWorked[0].totalTimeWorked : null
    const avgDailyMinutes = averageDailyMinutes.length > 0 ? averageDailyMinutes[0].averageDailyMinutes : null


    res.send({avgDailyMinutes, totalTimeWorked})
  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}

exports.getAssignedProjectAverages = async (req, res) => {
  const userId = req.params.userId
  try {
    const token = req.get("Authorization")

    if (!token)
      return sendError(res, ERRORS.ERROR_TOKEN_MISSING, 401)

    try {
      const verifiedToken = jwtUtils.verifyJWT(token)
      if (verifiedToken.user._id !== userId)
        return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    } catch (error) {
      return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    }

    if (!userId)
      return sendError(res, ERRORS.ERROR_NO_SUCH_USER_FOUND)


    const assignedProjects = await Project.find(
      {
        userId,
        status: ASSIGNMENT[0]
      }
    ).exec()

    console.log(assignedProjects)

    if (assignedProjects.length === 0)
      return res.send([])

    const arrayOfElements = []
    for (const project of assignedProjects) {
      const result = await ProjectInterval.aggregate([
        {
          $match:
            {
              userId,
              projectId: project._id
            }
        },
        {
          $group:
            {
              _id: "total time worked",
              totalWorked: {$sum: "$minutes"},
            }
        },
      ]).exec()
      if (result.length > 0)
        arrayOfElements.push({...result[0], _id: project._id})
      else
        arrayOfElements.push({totalWorked: 0, _id: project._id})
    }

    res.send(arrayOfElements)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}

