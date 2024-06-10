const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //storing the URL from where user was sent to login page.
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


//function to validate listing for adding and editing listing: Joi validation
module.exports.validateListing=(req, res, next)=>{

    //If user only selects one category, it converts the string to [string]
    //for schema validations.
    if (typeof req.body.listing.category === 'string') {
        req.body.listing.category = [req.body.listing.category];
    }


    let { error } = listingSchema.validate(req.body);
    if (error) {

        //if there is an error, extract details and throw ExpressError.
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}

//function to validate review for adding reviews: Joi validation
module.exports.validateReview=(req, res, next)=>{
    let { error } = reviewSchema.validate(req.body);
    if (error) {

        //if there is an error, extract details and throw ExpressError.
        let errMsg=error.details.map(el=> el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } 
    else {
        next();
    }
}