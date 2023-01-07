const express = require('express');
// const bodyParser = require('body-parser');
const route = require('./routes/route');
const { default: mongoose } = require('mongoose');
const multer = require('multer')

const app = express();
app.use(express.json());   // object to  json 
// app.use(bodyParser.json());
app.use(multer().any())    // form-data 

mongoose.connect("mongodb+srv://Lucky:ejIoY6iVVc1sRKbS@cluster0.byhslvl.mongodb.net/group28Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is Connected."))
    .catch(error => console.log(error))

app.use('/', route) // global middle ware 

app.use(function (req, res) {
    var err = new Error("Not Found.")
    err.status = 404
    return res.status(404).send({ status: false, msg: "Path not Found." })
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express App Running on Port: ' + (process.env.PORT || 3000))
});