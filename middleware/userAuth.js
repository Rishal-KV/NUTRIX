exports.isLoggedIn = async(req,res,next) => {
  try {
      if (req.session.user || req.session.otp) {
          next()
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
