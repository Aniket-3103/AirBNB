const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

//passpost local mongoose will create username, password itself.
const userSchema=new Schema({
    email:{
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User", userSchema);



