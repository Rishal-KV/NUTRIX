const User = require('../model/userModel');
exports.isLoggedIn = async(req,res,next) => {
  try {
       
      if (req.session.user)  {
      const userId = req.session.userId
     
        const user = await User.findOne({_id : userId})
     
        if (user.blocked) {
            req.session.destroy();
            res.redirect('/login')
        }else{
            next();
        }
      
      }else{
          res.redirect('/login')
      }
  } catch (error) {
      console.log(error.message);
  }
}

exports.isLoggedOut = async(req, res, next) =>{
  try {
      if (req.session.user ) {
          res.redirect('/home');
      } else {
          next()
      }
  } catch (error) {
      console.log(error.message);
  }
}
