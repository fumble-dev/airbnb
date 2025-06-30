const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {
        type : String,
        default : "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D",
        set:(v) => v === "" ? "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D" : v,
        
    },
    price : Number,
    location : String,
    country : String
})

const Listing = mongoose.model("Listing",listingSchema)
module.exports = Listing
