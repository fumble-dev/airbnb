const mongoose = require('mongoose')
const initData = require('./data.js')
const Listing = require('../models/listing.js')

const MONGO_URL =process.env.MONGO_URI

main()
    .then(()=>{
            console.log("Connected to DB")
    })
    .catch((err)=>{
            console.log(err)
    })

async function main(){
   await mongoose.connect(MONGO_URL)
}

const initDB = async () => {
    await Listing.deleteMany({})
    initData.data =  initData.data.map((obj)=>({...obj,owner:"686f47def8383027731e418c"}))
    await Listing.insertMany(initData.data)
    console.log("data was initalized")
}

initDB()