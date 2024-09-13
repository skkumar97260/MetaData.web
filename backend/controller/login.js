const User= require('../model/user');
const {sendOtp}=require('../middleware/commonResponseHandler');
const crypto = require('crypto');
const { createJwtToken } = require('../middleware/tokenManager');
require('dotenv').config();
exports.login = async(req,res)=>{
     const {phoneNumber}=req.body;
     try{
        const userFound= await User.findOne({phoneNumber});
        if(!userFound){
            return res.status(400).json({message:"User not found"});
        }
        const otp= crypto.randomInt(10000, 99999).toString();
        const user = await User.findOneAndUpdate(
            { phoneNumber }, // Find the user by phone number
            { otp: otp }, // Update the OTP
            { new: true } // Return the updated document
        );
        const otpResponse= await sendOtp(phoneNumber,otp);  
        return res.status(200).json({result:user,message:"OTP sent successfully",otpResponse});
        
    }
    catch(error)
    {
       return res.status(500).json({error:error.message});
    }
}

exports.verifyOtp= async(req,res)=>{
    const {phoneNumber,otp}=req.body;
    try{
        const user= await User.findOne({phoneNumber:phoneNumber});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        if(user.otp!==otp){
            return res.status(400).json({message:"Invalid OTP"});
        }
        user.otp=null;
        await user.save();
        const token = createJwtToken({userId:user._id,phoneNumber:user.phoneNumber},process.env.SECRET_KEY);
        if(!token)
        {
           res.status(500).json({message:"Token generation failed"}); 
        }
        return res.status(200).json({result:user,message:"OTP verified successfully",token});
    }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
}