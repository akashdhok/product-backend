const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const morgan = require("morgan")
require("dotenv").config()
const userRoute = require("./routes/user.routes")
const Port = process.env.PORT 

app.use(cors())
app.use(morgan("dev"))
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))
app.use("/api/user", userRoute)
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});



app.listen(Port , ()=>{
    console.log(`Server is running on port ${Port}`)
})