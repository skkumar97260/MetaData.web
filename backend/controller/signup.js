const { sendOtp,sendMessageOtp } = require('../middleware/commonResponseHandler');
const User = require('../model/user');
const crypto = require('crypto');
exports.createUser = async (req, res) => {
    const { username, phoneNumber, email } = req.body;
    
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email}); 
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        // Generate a random OTP
        const otp = crypto.randomInt(10000, 99999).toString();
        
        // Create a new user with the generated OTP
        const user = new User({ username, phoneNumber, email, otp });
        await user.save();
        
        // Send the OTP using the sendOtp function
        const otpResponse = await sendOtp(email, otp);
        
        return res.status(200).json({  result: user,  message: "User created successfully. OTP sent.", otpResponse  });
        
    } catch (error) {
       return  res.status(500).json({ error: error.message });
    }
}

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        user.otp = null;
        await user.save();
       return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
       return  res.status(500).json({ error: error.message });
    }
}