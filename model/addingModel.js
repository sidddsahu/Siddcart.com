const mongoose = require("mongoose");

const newModel = new mongoose.Schema({
title:String,
desc:String,
image:String,
date:{
    type:Date,
    default:Date.now
},

});

const Gser = mongoose.model("gser", newModel);
module.exports = Gser;