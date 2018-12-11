const { User } = require('./model/User');
const jwt = require('jsonwebtoken');
let auth_middleware = (req, res, next) => {
  let token = req.headers['authorization']; // Express headers are auto converted to lowercase
  token = token.slice(7, token.length);

    User.findByToken(token).then(() => {
      next();
    }).catch(err => {
        res.status(401).json(err);
    });

};
let auth_middleware_user = (req, res, next) => {
  let token = req.headers['authorization']; // Express headers are auto converted to lowercase
  token = token.slice(7, token.length);

    User.findByToken(token).then(() => {
      if(jwt.decode(token).payload.role==='user'){
      console.log(role);
      next();
      }else{
        res.status(401).json(err);
      }
    }).catch(err => {
        res.status(401).json(err);
    });

};
let auth_middleware_admin = (req, res, next) => {
  console.log(req.rawHeaders);
  let token = req.headers['authorization']; // Express headers are auto converted to lowercase
  token = token.slice(7, token.length);
    User.findByToken(token).then(() => {
      console.log(jwt.decode(token).role);
      if(jwt.decode(token).role=='admin'){      
      next();
      }else{
        res.json({success: false, msg: 'Não autorizado'});
      }
    }).catch(err => {
        res.status(401).json(err);
    });

};

module.exports = { auth_middleware,auth_middleware_user ,auth_middleware_admin };
