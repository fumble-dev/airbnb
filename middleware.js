module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.flash("error", "Login To Proceed")
        return res.redirect('/login')
    }
    next();
}