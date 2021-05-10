const Project = require("../models/Project")
const {
  ERRORS,
  SORTING,
  STATUSES,
  ASSIGNMENT,
} = require("../util/constants")
const {v4: uuidv4} = require('uuid');
const jwtUtils = require("../util/jwt")
const datefns = require("date-fns")
const ProjectInterval = require("../models/ProjectInterval")
const isIsoDate = require("is-iso-date")
const [ASSIGNED, IDLE] = ASSIGNMENT

const sendError = (res, error, status = 404) => res.status(status).send({error})
const [STARTED_NEWEST, STARTED_OLDEST, FINISHED_NEWEST, FINISHED_OLDEST, CREATED_NEWEST, CREATED_OLDEST] = SORTING
const [ACTIVE, FINISHED] = STATUSES
const convertToUTC = (dateString) => (
  datefns.addHours(datefns.parse(dateString, "dd/MM/yyyy", new Date()), 4)
)

exports.getAllProjects = async (req, res) => {
  const query = {}
  query.userId = req.params.userId
  try {
    const token = req.get("Authorization")
    if (!token)
      return sendError(res, ERRORS.ERROR_TOKEN_MISSING, 401)

    try {
      const verifiedToken = jwtUtils.verifyJWT(token)
      if (verifiedToken.user._id !== query.userId)
        return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    } catch (error) {
      return sendError(res, ERRORS.ERROR_INVALID_TOKEN)
    }

    const sorting = req.query.sorting ?? CREATED_NEWEST

    let page = 1;
    if (req.query.page)
      page = req.query.page

    if (req.query.status)
      query.status = req.query.status

    const paginationOptions = {
      page,
      limit: 10,
    };
    if (sorting) {
      if (!(SORTING.slice(3).includes(sorting)))
        return sendError(res, ERRORS.ERROR_SUCH_SORTING_NOT_FOUND)
      switch (sorting) {
        case CREATED_NEWEST:
          paginationOptions.sort = {"createdAt": -1}
          break;
        case CREATED_OLDEST:
          paginationOptions.sort = {"createdAt": 1}
          break;
        default:
      }
    }

    const projects = await Project.paginate(query, paginationOptions)

    res.send(projects)
  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};

exports.addNewProject = async (req, res) => {
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

    const title = req.body.title
    const description = req.body.description ?? undefined
    const activeIntervals = req.body.activeIntervals
    const startDate = req.body.startDate
    const endDate = req.body.endDate

    if (!title)
      return sendError(res, ERRORS.ERROR_FIELD_TASK_MISSING)
    if (typeof title !== "string" || title.length > 200)
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-title`)

    if (description && typeof description !== "string")
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-description`)

    if (!activeIntervals)
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-activeIntervals`)

    if (!startDate)
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-startDate`)

    if (!endDate)
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-endDate`)


    let start = null
    if (isIsoDate(startDate)) {
      start = startDate
    } else {
      try {
        start = convertToUTC(startDate)
      } catch (error) {
        return sendError(res, `${ERRORS.ERROR_INVALID_START_DATE}`)
      }
    }

    let stop = null
    if (isIsoDate(endDate)) {
      stop = endDate
    } else {
      try {
        stop = convertToUTC(endDate)
      } catch (error) {
        return sendError(res, `${ERRORS.ERROR_INVALID_STOP_DATE}`)
      }
    }

    const projectEntry = await new Project({
      _id: `PROJECT-${uuidv4()}`,
      userId,
      title,
      description,
      activeIntervals,
      endDate: stop,
      startDate: start,
      createdAt: new Date()
    }).save()

    res.status(200).send(projectEntry)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};


exports.updateProject = async (req, res) => {
  try {
    const userId = req.params.userId

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

    const _id = req.body._id
    const title = req.body.title
    const description = req.body.description ?? null
    const activeIntervals = req.body.activeIntervals
    const startDate = req.body.startDate
    const endDate = req.body.endDate

    if (!_id)
      return sendError(res, ERRORS.ERROR_FIELD_TASK_ID_MISSING)
    if (typeof _id !== "string")
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-_id-malformed`)

    if (!title)
      return sendError(res, ERRORS.ERROR_FIELD_TASK_MISSING)
    if (typeof title !== "string" || title.length > 500)
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-title-malformed`)

    if (!activeIntervals)
      return sendError(res, ERRORS.ERROR_ACTIVE_INTERVALS_MISSING)


    let start = null
    if (isIsoDate(startDate)) {
      start = startDate
    } else {
      try {
        start = convertToUTC(startDate)
      } catch (error) {
        return sendError(res, `${ERRORS.ERROR_INVALID_START_DATE}`)
      }
    }

    let stop = null
    if (isIsoDate(endDate)) {
      stop = endDate
    } else {
      try {
        stop = convertToUTC(endDate)
      } catch (error) {
        return sendError(res, `${ERRORS.ERROR_INVALID_STOP_DATE}`)
      }
    }

    const oldTask = await Project.findOne({
      _id,
      userId,
    }).exec()

    if (!oldTask)
      return sendError(res, `${ERRORS.ERROR_NO_SUCH_PROJECT_FOUND_WITH_ID}-${_id}`)

    oldTask.title = title
    oldTask.description = description
    oldTask.activeIntervals = activeIntervals
    oldTask.startDate = start
    oldTask.endDate = stop

    await oldTask.save()

    res.status(200).send(oldTask)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};


exports.removeProject = async (req, res) => {
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

    const _id = req.body._id

    if (!_id)
      return sendError(res, ERRORS.ERROR_FIELD_TASK_ID_MISSING)
    if (typeof _id !== "string")
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-_id-malformed`)

    const oldTask = await Project.findOneAndDelete({
      _id,
      userId,
    }).exec()

    if (!oldTask)
      return sendError(res, `${ERRORS.ERROR_NO_SUCH_PROJECT_FOUND_WITH_ID} ${_id}`)

    res.status(200).send(oldTask)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};

/**
 * json body params: plateNumber, _id
 * header: Auth
 */
exports.assignProject = async (req, res) => {
  const assignProject = async (userId, _id, plateNumber) => {
    const record = await Project.findOne({
      userId,
      _id
    }).exec()

    if (!record)
      return sendError(res, `${ERRORS.ERROR_NO_SUCH_PROJECT_FOUND_WITH_ID}-projectId`)

    record.status = ASSIGNED
    record.plateNumber = plateNumber
    await record.save()
    res.status(200).send(record)
  }

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


    const plateNumber = req.body.plateNumber
    const _id = req.body._id

    if (!_id || typeof _id !== "string")
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-_id`)

    if (plateNumber === 0) {
      const record = await Project.findOne({
        userId,
        _id
      }).exec()

      if (!record)
        return sendError(res, `${ERRORS.ERROR_NO_SUCH_PROJECT_FOUND_WITH_ID}-projectId`)

      record.status = IDLE
      record.plateNumber = plateNumber
      await record.save()
      return res.status(200).send(record)
    }


    if (plateNumber === null || plateNumber === undefined || typeof plateNumber !== "number" || plateNumber > 4 || plateNumber < 0)
      return sendError(res, `${ERRORS.ERROR_INVALID_FIELD}-plateNumber`)

    const projectsAssigned = await Project.find({
      userId,
      status: ASSIGNED
    }).exec()

    if (!projectsAssigned || projectsAssigned.length === 0) {
      return await assignProject(userId, _id, plateNumber)
    }


    const alreadyAssignedProject = projectsAssigned.find(x => x.plateNumber === plateNumber)

    if (!alreadyAssignedProject)
      return await assignProject(userId, _id, plateNumber)


    alreadyAssignedProject.plateNumber = 0
    alreadyAssignedProject.status = IDLE
    await alreadyAssignedProject.save()

    return await assignProject(userId, _id, plateNumber)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
}
/**
 * query params: status, sorting
 * header: Auth
 */
exports.getIntervals = async (req, res) => {
  const userId = req.params.userId
  try {
    const query = {}
    query.userId = userId

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
    if (req.query.status)
      query.status = req.query.status

    if (req.query._id)
      query._id = req.query._id

    if (req.query.projectId)
      query.projectId = req.query.projectId

    const sorting = req.query.sorting ?? STARTED_NEWEST

    let page = 1;
    if (req.query.page)
      page = req.query.page

    const paginationOptions = {
      page,
      limit: 10,
    };


    if (sorting) {
      if (!(SORTING.includes(sorting)))
        return sendError(res, ERRORS.ERROR_SUCH_SORTING_NOT_FOUND)

      switch (sorting) {
        case STARTED_NEWEST:
          paginationOptions.sort = {"startedAt": -1}
          break;
        case STARTED_OLDEST:
          paginationOptions.sort = {"startedAt": 1}
          break;
        case FINISHED_NEWEST:
          paginationOptions.sort = {"finishedAt": -1}
          break;
        case FINISHED_OLDEST:
          paginationOptions.sort = {"finishedAt": 1}
          break;
        default:
      }
    }

    console.log(query)

    const projectIntervals = await ProjectInterval.paginate(query, paginationOptions)

    res.status(200).send(projectIntervals)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};

exports.createInterval = async (req, res) => {
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

    const projectId = req.body.projectId

    if (!projectId)
      return sendError(res, `${ERRORS.ERROR_FIELDS_MISSING}-projectId`)

    const date = datefns.subHours(new Date, 2)

    const newProjectInterval = await new ProjectInterval({
      _id: `PROJECT-INTERVAL-${uuidv4()}`,
      status: ACTIVE,
      userId,
      projectId,
      startedAt: date
    }).save()

    res.status(200).send(newProjectInterval)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};

exports.stopInterval = async (req, res) => {
  const userId = req.params.userId
  try {
    const query = {}
    query.userId = userId

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

    const _id = req.body._id

    const record = await ProjectInterval.findOne({
      _id,
      userId,
      status: ACTIVE,
    }).exec()

    if (!record)
      return sendError(res, `${ERRORS.ERROR_NO_INTERVAL_FOUND_WITH_ID}-${_id} that was active`)

    const finishedAt = new Date()

    record.status = FINISHED
    record.finishedAt = finishedAt
    record.minutes = datefns.differenceInMinutes(
      finishedAt,
      record.startedAt
    )
    await record.save()

    res.status(200).send(record)

  } catch (error) {
    console.log(error)
    sendError(res, ERRORS.ERROR_INTERNAL_SERVER_ERROR, 500)
  }
};



