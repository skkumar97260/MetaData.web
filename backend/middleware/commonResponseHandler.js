const nodemailer = require('nodemailer');
const axios = require('axios');



const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services
  auth: {
    user: 'skkumar97260',   //googleAccount=>security=>app password(search)
    pass: 'umkh ekrq fwfh vpic',
  }
});

   let  sendOtp=async(email,otp)=>{
            if(!email){throw new Error("email is not register")}
                      const mailOptions = {
                      from: 'pixalivetech@gmail.com',
                      to: email,
                      subject: 'Email Verification OTP',
                      text: `Your verification OTP: ${otp}`,
                    };
              await transporter.sendMail(mailOptions);
      
      }
//  const sendOtp = async (phoneNumber,otp) => {
//   const url = `https://2factor.in/API/V1/2372fa0e-5edd-11eb-8153-0200cd936042/SMS/+91${phoneNumber}/${otp}`;
  
//   try {
//       const response = await axios.get(url);
//       return response.data; // Return the response data
//   } catch (exception) {
//       console.error(`ERROR received from ${url}:`, exception.message);
//       throw new Error('Failed to send OTP');
//   }
// }
module.exports = { sendOtp }


