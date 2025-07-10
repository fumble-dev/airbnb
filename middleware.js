const Listing = require('./models/listing')
const ExpressError = require('./utils/ExpressError')
const {listingSchema,reviewSchema} = require('./schema')
const Review = require('./models/review')

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.flash("error", "Login To Proceed")
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/login')
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(! listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","No access !")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((e) => e.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((e) => e.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(! review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not author of this review !")
        return res.redirect(`/listings/${id}`)
    }
    next()
}
