var express = require('express');
var router = express.Router();
const upload = require("./multer")
const fs = require("fs");
const path = require("path");
const watch = require("../model/newModelss");
const girls = require("../model/girlsModel");
const mens = require("../model/mensModel ");
const kids = require("../model/kidsModel");
const offer = require("../model/offerModel");
const laptop = require ("../model/newModelsss");
const television = require("../model/televisionModel");
const printer = require("../model/printnewModel");
const gser = require("../model/newModels");
const User = require("../model/newModel");
const Data = require("../model/taskModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(Data.authenticate()));


router.get('/',   function(req, res, next) {
  User.find()
  .then((card) => res.render('index', { card,  }))
  .catch ((err) => res.send (err))
});
// -----------------------------------------Add-routes-Start-------------------------------------------
router.get('/add', function(req, res, next) {
  res.render('add', { title: 'Express' });
});

router.post('/add', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    User.create ({
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
      image: req.file.filename,
    })
    
    .then((createdtask) =>  res.redirect('/'))
    .catch((err) => res.send(err.message))
  })
});

// -----------------------------------------Add-routes-end-------------------------------------------

// -----------------------------------------Update-routes-delete-start-------------------------------------------

router.get('/update/:id', function(req, res, next) { 
  User.findById(req.params.id)
  .then((card) => res.render('update', { card }))
  .catch((err) => res.send(err.message))
});


router.post("/update/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedata = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {

      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedata.image = req.file.filename
  }
  User
    .findByIdAndUpdate(req.params.id, updatedata)
    .then((updatedata) => res.redirect('/'))
    .catch((err) => res.send(err));
  })
});

router.get('/delete/:id', function(req, res, next) {
  User.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/")
  })
  .catch((err) => res.send(err))
});

// -----------------------------------------Update-routes-delete-end-------------------------------------------

// ------------------------------------------------------------------------------------------------

// -----------------------------------------FORM-SECTION-START------------------------------------------------------

// -----------------------------------login-form-start-----------------------------------

router.get('/login', function(req, res, next) {
  res.render('Login', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
  const {name, username, email, password, phone} = req.body;
  const newuser = new Data({
    name,
    username,
    email,
    phone,
  })
  Data.register(newuser, password)
  .then(() => res.redirect("/signin"))
  .catch((err) => res.send(err.message))
});

// -----------------------------------login-form-end-----------------------------------

// -------------------------------------------------signin-form-start--------------------------------

router.get('/signin', function(req, res, next) {
  res.render('signin', { title: 'Express' });
});

router.post('/signin', passport.authenticate ("local",{
successRedirect: "/",
failureRedirect: "/signin"
}),
 function(req, res, next) {
});


// -------------------------------------------------signin-form-End--------------------------------

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile', { user: req.session.passport.user});
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    next()
    return;
  }
  res.redirect("/")
}

router.get('/account', isLoggedIn, function(req, res, next) {
  res.render('account', { user:req.user});
});

router.post("/account", isLoggedIn, function(req,res,next){
  Data.findByIdAndUpdate(req.user._id, req.body)
  .then(() =>{
    res.redirect("/account")
  })
  .catch((err) => res.send(err))
})

// ---------------------------------Delet-User-Signout-start-------------------------------------------------

router.get('/signout', isLoggedIn, function(req, res, next) {
  req.logOut(function (){
    res.redirect("/login")
  })
});

router.get('/delete', isLoggedIn, function(req, res, next) {
  Data.findByIdAndDelete(req.user.id)
  .then(() =>{
    res.redirect('/signout');
  })
  .catch((err) => res.send(err))
});

// ---------------------------------Delet-User-Signout-End-------------------------------------------------

// ---------------------------------Reset-password-start-------------------------------------------------

router.get('/reset',  function(req, res, next) {
  res.render('reset', { user:req.user});
});

router.post('/reset-password', isLoggedIn, function(req, res, next) {
  req.user.changePassword(
    req.body.oldpassword,
    req.body.newpassword,
    function(err){
      if(err) return res.send(err);
      res.redirect("/signin")
    }
  )
});

// ---------------------------------Reset-password-END-------------------------------------------------


// --------------------- FORGET-PASSWORD-START-------------------------------------------------------

router.get("/forget-password", function (req, res, next) {
  res.render("forget", { user: req.user });
});

router.post("/forget-password", function (req, res, next) {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.send("Not found <a href='/forget-password'>Try Harder!</a>");

      // next page url
      const pageurl =
      req.protocol +
      "://" +
      req.get("host") +
      "/change-password/" +
      user._id;

      // send email to the email with gmail
      const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: "siddhantsahu503@gmail.com",
          pass: "nhogjnkkunnkkhgr",
        },
      });

      const mailOptions = {
        from: "Siddhant Pvt. Ltd.<siddhantsahu503@gmail.com>",
        to: req.body.email,
        subject: "Password Reset Link",
        text: "Do not share this link to anyone.",
        html: `<a href=${pageurl}>Password Reset Link</a>`,
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) return res.send(err);
        console.log(info);
        user.resetPasswordToken = 1;
        user.save();
        return res.send(
          "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        );
      });
      // ------------------------------
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/change-password/:id", function (req, res, next) {
  res.render("changepassword", { id: req.params.id });
});

router.post("/change-password/:id", function (req, res) {
  User.findById(req.params.id)
      .then((user) => {
          if (user.resetPasswordToken === 1) {
              user.setPassword(req.body.password, function (err) {
                  if (err) return res.send(err);
                  user.resetPasswordToken = 0;
                  user.save();
                  res.redirect("/signout");
              });
          } else {
              res.send(
                  "Link Expired! <a href='/forget-password'>Try Again.</a>"
              );
          }
      })
      .catch((err) => res.send(err));
});

// --------------------- FORGET-PASSWORD-END-------------------------------------------------------






// ---------------------------------Mobile-Routes-Start-------------------------------------------------

router.post('/adding', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    gser.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/mobile', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/mobile', function(req, res, next) {
  gser.find()
  .then((card) => res.render('mobile',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updated/:id', function(req, res, next) { 
  gser.findById(req.params.id)
  .then((card) => res.render('updated', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updated/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  gser
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/mobile'))
    .catch((err) => res.send(err));
  })
});

router.get('/deleted/:id', function(req, res, next) {
  gser.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/mobile")
  })
  .catch((err) => res.send(err))
});


// ---------------------------------Mobile-Routes-End-------------------------------------------------

// ---------------------------------Watch-Routes-Start-------------------------------------------------

router.post('/addings', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    watch.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/watch', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/watch', function(req, res, next) {
  watch.find()
  .then((card) => res.render('watch',  { card, }))
  .catch ((err) => res.send (err))
});


router.get('/updating/:id', function(req, res, next) { 
  watch.findById(req.params.id)
  .then((card) => res.render('updating', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updating/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  watch
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/watch'))
    .catch((err) => res.send(err));
  })
});

router.get('/deleting/:id', function(req, res, next) {
  watch.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/watch")
  })
  .catch((err) => res.send(err))
});


// ---------------------------------Watch-Routes-End-------------------------------------------------

// ---------------------------------Laptop-Routes-Start-------------------------------------------------

router.post('/addingss', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    laptop.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/laptop', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/laptop', function(req, res, next) {
  laptop.find()
  .then((card) => res.render('laptop',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updatings/:id', function(req, res, next) { 
  laptop.findById(req.params.id)
  .then((card) => res.render('updatings', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updatings/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  laptop
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/laptop'))
    .catch((err) => res.send(err));
  })
});

router.get('/deletings/:id', function(req, res, next) {
  laptop.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/laptop")
  })
  .catch((err) => res.send(err))
});

// ---------------------------------Laptop-Routes-End-------------------------------------------------

// ---------------------------------Printer-Routes-Start-------------------------------------------------

router.post('/addingsss', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    printer.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/printer', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/printer', function(req, res, next) {
  printer.find()
  .then((card) => res.render('printer',  { card, }))
  .catch ((err) => res.send (err))
});


router.get('/updateprinter/:id', function(req, res, next) { 
  printer.findById(req.params.id)
  .then((card) => res.render('updateprinter', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updateprinter/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  printer
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/printer'))
    .catch((err) => res.send(err));
  })
});

router.get('/printdeletings/:id', function(req, res, next) {
  printer.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/printer")
  })
  .catch((err) => res.send(err))
});

// ---------------------------------Printer-Routes-End-------------------------------------------------

// ---------------------------------Girls-Routes-Start-------------------------------------------------

router.post('/addingssss', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    girls.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/girls', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/girls', function(req, res, next) {
  girls.find()
  .then((card) => res.render('girls',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updategirls/:id', function(req, res, next) { 
  girls.findById(req.params.id)
  .then((card) => res.render('updategirls', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updategirls/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  girls
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/girls'))
    .catch((err) => res.send(err));
  })
});

router.get('/girlsdeletings/:id', function(req, res, next) {
  girls.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/girls")
  })
  .catch((err) => res.send(err))
});


// ---------------------------------Girls-Routes-End-------------------------------------------------

// ---------------------------------Men's-Routes-Start-------------------------------------------------

router.post('/addingsssss', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    mens.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    .then((createdtask) =>  res.redirect('/mens', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/mens', function(req, res, next) {
  mens.find()
  .then((card) => res.render('mens',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updatemens/:id', function(req, res, next) { 
  mens.findById(req.params.id)
  .then((card) => res.render('updatemens', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updatemens/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  mens
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/mens'))
    .catch((err) => res.send(err));
  })
});

router.get('/mensdeletings/:id', function(req, res, next) {
  mens.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/mens")
  })
  .catch((err) => res.send(err))
});
// ---------------------------------Men's-Routes-End-------------------------------------------------

// ---------------------------------television-Routes-Start-------------------------------------------------

router.post('/tvadding', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    television.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/television', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/television', function(req, res, next) {
  television.find()
  .then((card) => res.render('television',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updatetelevision/:id', function(req, res, next) { 
  television.findById(req.params.id)
  .then((card) => res.render('updatetelevision', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updatetelevision/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  television
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/television'))
    .catch((err) => res.send(err));
  })
});

router.get('/tvdeletings/:id', function(req, res, next) {
  television.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/television")
  })
  .catch((err) => res.send(err))
});
// ---------------------------------Television's-Routes-End-------------------------------------------------

// ---------------------------------Men's-Routes-Start-------------------------------------------------

router.post('/addingsssss', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    mens.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    .then((createdtask) =>  res.redirect('/mens', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/mens', function(req, res, next) {
  mens.find()
  .then((card) => res.render('mens',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updatemens/:id', function(req, res, next) { 
  mens.findById(req.params.id)
  .then((card) => res.render('updatemens', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updatemens/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  mens
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/mens'))
    .catch((err) => res.send(err));
  })
});

router.get('/mensdeletings/:id', function(req, res, next) {
  mens.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/mens")
  })
  .catch((err) => res.send(err))
});
// ---------------------------------Men's-Routes-End-------------------------------------------------

// ---------------------------------Offer-Routes-Start-------------------------------------------------

router.post('/offeradding', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    offer.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/offer', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/offer', function(req, res, next) {
  offer.find()
  .then((card) => res.render('offer',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updateoffer/:id', function(req, res, next) { 
  offer.findById(req.params.id)
  .then((card) => res.render('updateoffer', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updateoffer/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  offer
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/offer'))
    .catch((err) => res.send(err));
  })
});

router.get('/offerdeletings/:id', function(req, res, next) {
  offer.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/offer")
  })
  .catch((err) => res.send(err))
});
// ---------------------------------Offer's-Routes-End-------------------------------------------------

// ---------------------------------Kid's-Routes-Start-------------------------------------------------

router.post('/kidsadding', function(req, res, next) {
  upload(req,res, function(err){
    if(err) return res.send(err);
    kids.create ({
      title: req.body.title,
      desc: req.body.desc,
      image: req.file.filename,
      discount: req.body.discount,

    })
    
    .then((createdtask) =>  res.redirect('/kids', ))
    .catch((err) => res.send(err.message))
  })
});

router.get('/kids', function(req, res, next) {
  kids.find()
  .then((card) => res.render('kids',  { card, }))
  .catch ((err) => res.send (err))
});

router.get('/updatekids/:id', function(req, res, next) { 
  kids.findById(req.params.id)
  .then((card) => res.render('updatekids', { card }))
  .catch((err) => res.send(err.message))
});

router.post("/updatekids/:id", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedat = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {
      fs.unlinkSync(
        path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      );
    updatedat.image = req.file.filename
  }
  kids
    .findByIdAndUpdate(req.params.id, updatedat)
    .then(() => res.redirect('/kids'))
    .catch((err) => res.send(err));
  })
});

router.get('/kidsdeletings/:id', function(req, res, next) {
  kids.findByIdAndDelete(req.params.id)
  .then((deletedData) =>{
    fs.unlinkSync(
      path.join(
        __dirname, "..", "public", "uploads",deletedData.image))
    res.redirect("/kids")
  })
  .catch((err) => res.send(err))
});
// ---------------------------------Kid's-Routes-End-------------------------------------

// ---------------------------------Cart-Routes-Start-------------------------------------

// router.get('/cart',   function(req, res, next) {
//  res.render("cart")
// });


router.get('/cart', function(req, res, next) { 
  User.findById(req.params.id)
  .then((card) => res.redirect('/cart', { card }))
  .catch((err) => res.send(err.message))
});


router.post("/carts", function (req, res, next) {
  upload(req, res, function (err) {
    if (err) return res, send(err);
    const updatedata = {
      title: req.body.title,
      desc: req.body.desc,
      discount: req.body.discount,
    };
    if (req.file) {

      // fs.unlinkSync(
      //   path.join(__dirname, "..", "public", "uploads", req.body.oldgallery)
      // );
    updatedata.image = req.file.filename
  }
  User
    .findByIdAndUpdate(req.params.id, updatedata)
    .then((updatedata) => res.redirect('/cart'))
    .catch((err) => res.send(err));
  })
});

// router.get('/delete/:id', function(req, res, next) {
//   User.findByIdAndDelete(req.params.id)
//   .then((deletedData) =>{
//     fs.unlinkSync(
//       path.join(
//         __dirname, "..", "public", "uploads",deletedData.image))
//     res.redirect("/")
//   })
//   .catch((err) => res.send(err))
// });

module.exports = router;
