const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt =require("bcrypt");
const jwt=require("jsonwebtoken");
require ("dotenv").config();

//send otp
exports.sendOTP = async (req, res) => {
    try {
        //fetch email from body of request
        const { email } = req.body;
        //check if user already exist
        const checkUserPresent = await User.findOne({ email });
        //if user is already exist then return a response
        if (checkUserPresent) {
            return res.status(401), json({
                success: false,
                message: 'User already registered',
            })
        }
        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);
        //check unique otp or not
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };

        //create an entry for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successful
        res.status(200).json({
            success: true,
            message: "otp sent successfully",
            otp,
        })
    }
    catch {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

//sign up
exports.signup = async (req, res) => {
    try {
        //data fetch from body of request
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        //validate 
        if (!firstName || !lastName || !email || !password || !confirmaPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        //2 passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and ConfirmPassword value does not match'
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered',
            });
        }

        //find most recent otp stored for user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        //validate otp
        if (recentOtp.length == 0) {
            //otp nahi mila
            return res.status(400).json({
                success: false,
                message: 'OTP not found',
            })
        }
        else if (otp !== recentOtp.otp) {
            //otp invalid
            return res.status(400).json({
                success: false,
                message: "Invalid otp",
            });
        }


        //hass password .. bcryp use hoga
        const hashedPassword = await bcrypt.hash(password, 10);
        //entry db mein create 
        //profile details for additional details
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        //return res
        return response.status(200).json({
            success:true,
            message:'User is registered succssfully',
            user,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered.'
        }) 
    }
}

// login
exports.login=async(req,res)=>{
    try{
        //get data from req body
        const {email, password}=req.body;
        //validation data
        if (!email, password){
            return res.status(403).json({
                success:false,
                message:"All fields are required."
            });
        }
        //check if user exists or not
        const user=await User.findOne({email}.populate("additionalDetails"));
        if (!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, sign up first",
            });
        }
        //generate JWT, after password matching
        if (await bcrypt.compare(password,user.password)) {
            const payload={
                email:user.email,
                id:user._id,
                role:user.accountType,
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET, {
                expires:"2h",
            });
            user.token=token;
            user.password=undefined;

        
        //create cookie and send the response
        const options={
            expires:new Date (Date.now()+ 3*24*60*60*1000),
            httpOnly:true,
        }
        res,cookie("token",token, options).status(200),json({
            success:true,
            tken,
            user,
            message:"Logged in successfully",
        })
    }
    else {
        return res.status(401).json({
            success:false,
            message:"Password is incorrect",
        });
    }
}
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure, try again."
        });
    }
};



//change password
exports.changePassword=async(req,res)=>{
    //get data from req body
    //get oldPassword, newPassword, confirmNewPassword
    //validate
    //update pwd in DB
    //send email.. pwd updated
    //return response
}