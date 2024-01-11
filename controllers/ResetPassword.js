const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt=require("bcrypt");

//resetpasswordtoken
exports.resetPasswordToken = async (req, res) => {
try{
        //get email from req body
        const email = req.body.email;
        //check user for this email, email validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: 'Your email is not registered.'
            })
        }
        //generate token
        const token = crypto.randomUUID();
        //update user by adding token and expiration date
        const updatedDetails = await User.findOneAndUpdate({ email: email }, {
            token: token,
            resetPasswordExpires: Date.now() + 5 * 60 * 1000,   
        },
        {new:true}); //udated document aa jaega
    
        //create url
        const url = `http://localhost:3000/update-password/${token}`
        //send mail containing the url
        await mailSender(email, "Password reset link", `Password reset link is : ${url}`);
        //return response
        return res.json({
            success:true,
            message:"Email sent successfully, check mail and you can change password",
        })
}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"something went wrong while reset pwd mail",
    })
}
}
//resetpassword 
exports.resetPassword=async(req,res)=>{
try{
        //data fetch
        const {password, confirmPassword, token}=req.body;
        //validation
        if (password != confirmPassword){
            return res.json({
                success:false,
                message:"password is not matching",
            });
        }
        //get userdetails from db using token
        const userDetails=await User.findOne({token:token});
        //if no entry.. invalid token
        if (!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid",
            });
        }
        //token time check
        if (userDetails.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:"token is expired , please regenerate",
            });
        }
        //hash pwd
        const hashedPassword=await bcrypt.hash(password,10);
    
        //update pwd
        await User.findOneAndUpdate (
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
    
        //return response
        return res.status(200).json({
            success : true,
            message: "Password reset successful"
        });
}
catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"something went wrong while reset pwd mail",
    })
}
}
