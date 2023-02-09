const mongoose = require("mongoose");

const newModel = new mongoose.Schema({
title:String,
desc:String,
discount:String,
image:String,
date:{
    type:Date,
    default:Date.now
},

});

const television = mongoose.model("television", newModel);
module.exports = television;