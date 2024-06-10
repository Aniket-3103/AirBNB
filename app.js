if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter=require("./routes/user");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


app.engine("ejs", ejsMate);     //it's used to creating common templates/section(nav,footer)

const dbUrl=process.env.ATLASDB_URL;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

//connecting to database
main().then(function () {
    console.log("connected to database");
}).catch(err => {
    console.log("Something went wrong: " + err)
});

async function main() {
    await mongoose.connect(dbUrl);
}

//Now our session will be stored on mongo atlas
const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error",(err)=>{
    console.log("Error in mongo session store", err);
});

const sessionOptions = {
    store:store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};



app.use(session(sessionOptions));
app.use(flash())                    //use flash middleware after session and before routes.


//used after session as passport uses session data so user does not have to login again if opened website
//on different tabs.
app.use(passport.initialize());     
app.use(passport.session());

//all the users should be authenticated with local strategy(username, password) by using authenticate method.
passport.use(new LocalStrategy(User.authenticate()));

//saving and unsaving user into the session.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//root URL api
app.get("/", (req, res) => {
    res.redirect("/listings");
});

//flash messages
app.use((req, res, next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    res.locals.currRoute=req.originalUrl;
    next();
});


//User
app.use("/", userRouter);


//Listings
app.use("/listings", listingRouter);

//Reviews
app.use("/listings/:id/reviews", reviewRouter);



//if user enters a URL, that isn't present, then this function will throw ExpressError.
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

//custom error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
