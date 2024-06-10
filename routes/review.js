const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
let { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const reviewController=require("../controllers/review");

//Post review route:add
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;