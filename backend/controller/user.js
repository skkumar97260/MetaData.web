const User = require('../model/user');

exports.getUser = async (req, res) => {
    try {
        const user = await User.find({isDeleted: false});
      return res.status(200).json({ result: user, message: 'User fetched successfully' });
    } catch (error) {   
       return res.status(500).json({ message: 'Internal server error' });
    }
}