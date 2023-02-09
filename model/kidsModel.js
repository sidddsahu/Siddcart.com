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

const kids = mongoose.model("kids", newModel);
module.exports = kids;