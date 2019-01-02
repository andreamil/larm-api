const { Usuario } = require('./model/Usuario');
const config = require('./config');

const jwt = require('jsonwebtoken');

auth_middleware = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if(typeof bearerHeader !== 'undefined'){
      try {
          const bearer = bearerHeader.split(' ');
          const bearerToken = bearer[1];
          jwt.verify(bearerToken, config.secret,(err,decoded)=>{
            if(err)res.status(403).json(err);
            else{
              req.role=decoded.role;
              req.id=decoded._id;
              next();
            }
          });
          /*Usuario.findByToken(bearerToken).then((user) => {
            req.role=user.role;
            req.id=user._id;
            next();
          }).catch(err => {
            res.status(401).json(err);
          });*/
      } catch (err) {
          console.log(err);
          res.status(403).json(err);
      }
  }else{
      res.sendStatus(403)
  }
}
permitir = (...allowed) => {
  return (req, res, next) => {
    if(allowed.indexOf(req.role) > -1)
      next();
    else {
      res.status(403).json({message: "Forbidden"});
    }
  }
}

module.exports = { auth_middleware, permitir};
