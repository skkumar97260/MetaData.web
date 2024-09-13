const nodemailer = require('nodemailer');
const axios = require('axios');



exports. transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services
  auth: {
    user: 'skkumar97260',   //googleAccount=>security=>app password(search)
    pass: 'umkh ekrq fwfh vpic',
  }
});


 const sendOtp = async (phoneNumber,otp) => {
  const url = `https://2factor.in/API/V1/55c65099-693b-11ef-8b60-0200cd936042/SMS/+91${phoneNumber}/${otp}`;
  
  try {
      const response = await axios.get(url);
      return response.data; // Return the response data
  } catch (exception) {
      console.error(`ERROR received from ${url}:`, exception.message);
      throw new Error('Failed to send OTP');
  }
}
module.exports = { sendOtp }


