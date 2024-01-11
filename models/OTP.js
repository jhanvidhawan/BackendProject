const mongoose=require("mongoose");
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true, 
    },
    createdAt:{
        type:String,
        default:Date.now(),
        expires:5*60,
    }
});

//create a function
//kisko mail bhejni hai or kya otp bhejna hai
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse=await mailSender(email, "Verification Email from StudyNotion",otp);
        console.log("Email sent successfully", mailResponse);
    }
    catch(error){
        console.log("error occured while sending an email:",error);
        throw error;
    }
}

//pre middleware
OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports=mongoose.model("OTP", OTPSchema);