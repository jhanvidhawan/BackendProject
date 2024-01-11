//mongoose or schema chaiye
const mongoose =require("mongoose");
const userSchema=new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        trim:true,
    },
    accountType:{
        required:true,
        type:String,
        enum:["Admin","Student","Instructor"],
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile", //profile model ko refer kr rhe
        required:true,
    },
    //courses ka data array mein daalna hai
    courses:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref:"Courses",
        }
    ],
    image:{
        type:String, //image ka url daalne ke liye
        required:true,
    },
    token:{
        type :String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress",
    },
});
module.exports=mongoose.model("User",userSchema);