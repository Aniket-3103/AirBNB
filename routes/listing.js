const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

const listingController = require("../controllers/listing");
const multer=require("multer");
const {storage}=require("../cloudConfig");
const upload=multer({storage});

router.route("/")
    .get(wrapAsync(listingController.index))        //index route
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));     //create route

/*use listing/:id later because it can consider even listings/new or listings/anything as id for get req*/

//add listing: new route(get), take new listings data from user
router.get("/new", isLoggedIn, listingController.renderNewForm);

//filter category route
router.get("/category", wrapAsync(listingController.filterListings));

//search route
router.get("/search", listingController.searchListings);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))      //show route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))  //update route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));               //delete route


//Edit route(get): get edited info from user
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;
