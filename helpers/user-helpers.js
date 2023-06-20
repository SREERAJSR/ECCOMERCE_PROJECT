const User = require("../models/userSchema");
const twilio = require("twilio");

module.exports = {
  sendingOtp: async(phone) => {
    // return new Promise(async (resolve, reject) => {
      try {
        // Set up the Twilio client with your Account SID and Auth Token
        const accountSid = process.env.accountSid;
        const authToken = process.env.authToken;
        const client = twilio(accountSid, authToken);
        await client.verify.v2
          .services(process.env.verifySid)
          .verifications.create({ to: "+91" + phone, channel: "sms" });
        //resolve();
      } catch (err) {
      //   reject(err);
       }
     //});
  },
   validating:  (phone, otpcode) => {
    console.log('ahaaahaha'+phone);
    return new Promise(async (resolve, reject) => {
      const client =  twilio(process.env.accountSid, process.env.authToken);
      await client.verify.v2
        .services(process.env.verifySid)
        .verificationChecks.create({ to: "+91" + phone, code: otpcode })
        .then((verification_check) => {
          console.log(verification_check.status);
          resolve(); 
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  findUser:(phone)=>{
    return new Promise(async(resolve,reject)=>{

      try{
  
     let user=await User.findOne({phone})

      console.log(user);
 
      }catch(err){
        console.log(err);
      }
    })


  }
};
