require('dotenv').config({path:"./dev.env"});
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const helmet = require('helmet');
const compression = require("compression")
const cors = require('cors')
const app = express();

const PORT = process.env.PORT || 3000
console.log(process.env.PORT)

const taskRoutes = require("./routes/task")
const userRoutes = require("./routes/user")

app.use(cors())
app.use(bodyParser.json());
app.use(helmet())
app.use(compression())
app.use('/api', taskRoutes);
app.use("/api", userRoutes)

mongoose
  .connect
  (
    'mongodb+srv://bubu_ts:Ef1th2uk3il4@atlastutorial.giapl.mongodb.net/gadget_v1?retryWrites=true&w=majority',
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(_ => {
    app.listen(PORT)
    }).catch(err => {
  console.log(err)
})


