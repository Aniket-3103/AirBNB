require("dotenv").config();

const mongoose = require("mongoose");
const allListing = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;


const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}


const initDB = async () => {
  await Listing.deleteMany({});

  for (let listing of allListing) {
    let response = await geocodingClient.forwardGeocode({
      query: listing.location,
      limit: 1,
    }).send();
    listing.geometry = response.body.features[0].geometry;
  }

  const updatedData = allListing.map((obj) => ({
    ...obj, owner: "664f3a095c9eb20acb26e8ef"
  }));

  await Listing.insertMany(updatedData);
  console.log("Data was initialized");
};

initDB();