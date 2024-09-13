const Chat = require ('../model/chat.js');

exports.userSendMessage = async (req,res) =>{
    const {userFrom,userTo,message,senderType,sentOn}=req.body;
    try{
         const user = new Chat ({userFrom,userTo, message,senderType});
        await user.save();
        return res.status(200).json({message:"Message sent successfully"});
    }
    catch{
       return res.status(500).json({message:"Something went wrong"});
    }
}

exports.getChat = async (req,res) =>{
    try{
        const chat = await Chat.find({isDeleted: false});
        return res.status(200).json({result:chat,message:"Chat fetched successfully"});
    }
    catch{
       return res.status(500).json({message:"Something went wrong"});
    }
}
