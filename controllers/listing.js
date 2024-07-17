const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      }).send();


    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;

    newListing.geometry=response.body.features[0].geometry;

    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalUrl=listing.image.url;
    originalUrl=originalUrl.replace("/upload", "/upload/h_250,w_250");
    res.render("listings/edit.ejs", { listing, originalUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    //for checking if location was changed and to generate new coordinates
    let oldListing=await Listing.findById(id);         

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    //if location was changed, change the coordinates.
    if(listing.location!==oldListing.location){
        let response=await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();
    
        listing.geometry=response.body.features[0].geometry;
        await listing.save();
    }

    //if an image is provided, only then update the filename and url.
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };

        await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};

module.exports.filterListings=async(req, res)=>{
    let category=req.query.filter;
    let allListings=await Listing.find({}).where('category').in(category);    
    res.render("listings/category.ejs", {allListings: allListings, category: category});
};


module.exports.searchListings=async(req, res)=>{
    let {searchInput}=req.query;

    //My way: Not so efficient when dataset grows.
    // let allListings=await Listing.find({});
    // let searchedListing=allListings.filter((listing)=>{
    //     return (listing.title.indexOf(searchInput)>=0 || listing.country.indexOf(searchInput)>=0 || listing.location.indexOf(searchInput)>=0 || listing.description.indexOf(searchInput)>=0);
    // });

    const regex=new RegExp(searchInput, "i");
    let searchedListing=await Listing.find({
        $or:[
            {title: {$regex: regex}},
            {description: {$regex:regex}},
            {location: {$regex: regex}},
            {country: {$regex:regex}},
            {category: {$regex: regex}}
        ]
    });
    res.render("listings/category.ejs",{allListings: searchedListing, category: searchInput});
};
