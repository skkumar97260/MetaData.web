const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    _id:{type:mongoose.Schema.Types.ObjectId,required:true,auto:true},
    userFrom:{type:String,required:true,ref:'User'},
    userTo:{type:String,required:true,ref:'User'},
    message:{type:String,required:true},
    sentOn: { type: String, default: () => new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      },
      sentDate: { 
        type: String,  default: () => {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
          const year = now.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },      
    senderType: { type: String },
    isSeen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    status: { type: Number, default: 1 },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: String },
    modifiedOn: { type: Date },
    modifiedBy: { type: String }

})
const chat= mongoose.model('Chat',chatSchema);
module.exports=chat;