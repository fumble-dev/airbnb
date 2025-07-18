require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require("path")
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user.js')

const listingRouter = require('./routes/listing.js')
const reviewRouter= require('./routes/review.js')
const userRouter = require('./routes/user.js');

const MONGO_URL =process.env.MONGO_URI

main()
    .then(() => {
        console.log("Connected to DB")
    })
    .catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", 'ejs')
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname, "/public")))

const store = MongoStore.create({
    mongoUrl :process.env.MONGO_URI,
    crypto :{
        secret:process.env.SECRET
    },
    touchAfter : 24*60*60
})

store.on("error",(err)=>{
    console.log("Error in Mongo Session Store",err)
})

const sessionOptions = {
    store:store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
}


app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// app.get("/", (req, res) => {
//     res.send("Hi I am root")
// })

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    next();
})

app.get("/demouser",async(req,res)=>{
    let fakeUser = new User({
        email : "demo@gmail.com",
        username : "udanth"
    })
   const registeredUser = await User.register(fakeUser,"hello");
   res.send(registeredUser);
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)
app.use('/', userRouter);


app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err })
});


app.listen(8080, () => {
    console.log("Server is listening to port 8080")
})