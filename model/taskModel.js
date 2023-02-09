const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const newTask = new mongoose.Schema({
    name:String,
    username:String,
    email:String,
    password:String,
    phone:String,
    avatar:{
        type:String,
        default:"dummy.png"
    }
});
newTask.plugin(plm)

const data = mongoose.model("data", newTask);

module.exports = data;