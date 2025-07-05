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

app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index", { allListings });
}))

app.get("/listings/new", (req, res) => {
    res.render("listings/new")
})

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/show.ejs", { listing })
}))

app.post("/listings", wrapAsync(async (req, res, next) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Send Valid data for listing")
    }
    const newListing = new Listing(req.body.listing)
    await newListing.save()
    res.redirect("/listings")
}))

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/edit", { listing })
}))

app.put("/listings/:id", wrapAsync(async (req, res) => {
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



// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "My Home",
//         description : "By the beach",
//         price : 1000,
//         location : "Calangute, Goa",
//         country : "India"
//     })
//     await sampleListing.save()
//     console.log("sample listing was saved")
//     res.send("succesful testing")
// })


// app.all("*", (req, res, next) => {
//     const err = new ExpressError(404, "Page Not Found !");
//     next(err);
// });

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).send(message);
});


app.listen(8080, () => {
    console.log("Server is listening to port 8080")
})