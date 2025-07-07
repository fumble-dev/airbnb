const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require("path")
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const listings = require('./routes/listing.js')
const reviews = require('./routes/review.js')

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

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews)

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err })
});


app.listen(8080, () => {
    console.log("Server is listening to port 8080")
})