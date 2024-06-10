const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview=async (req, res) => {
    let { id } = req.params;
    let currentListing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    currentListing.reviews.push(newReview);

    await newReview.save();
    await currentListing.save();
    req.flash("success", "New review created!");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteReview=async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};
