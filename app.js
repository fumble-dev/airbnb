const express = require('express')
const mongoose = require('mongoose')
const ejs = require('ejs')
const Listing = require("./models/listing.js")
const app = express()
const path = require("path")
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const { listingSchema, reviewSchema } = require("./schema.js")
const Review = require("./models/review.js")

const MONGO_URL = ""

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

app.get("/", (req, res) => {
    res.send("Hi I am root")
})

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((e) => e.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((e) => e.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}



app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index", { allListings });
}))

app.get("/listings/new", (req, res) => {
    res.render("listings/new")
})

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews")
    res.render("listings/show.ejs", { listing })
}))

app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing)
    await newListing.save()
    res.redirect("/listings")
}))

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/edit", { listing })
}))

app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })
    res.redirect(`/listings/${id}`);
}))

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings')
}))

//Reviews Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // res.send("new review saved")
    res.redirect(`/listings/${listing._id}`)
}))

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)
}))

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err })
});


app.listen(8080, () => {
    console.log("Server is listening to port 8080")
})