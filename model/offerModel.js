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

const offer = mongoose.model("offer", newModel);
module.exports = offer;