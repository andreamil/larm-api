const { User } = require('./model/User');
auth_middleware = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if(typeof bearerHeader !== 'undefined'){
      try {
          const bearer = bearerHeader.split(' ');
          const bearerToken = bearer[1];
          //jwt.verify(bearerToken, config.secret);
          User.findByToken(bearerToken).then((user) => {
            req.role=user.role;
            next();
          }).catch(err => {
            res.status(401).json(err);
          });
      } catch (err) {
          res.sendStatus(403).json(err);
      }
  }else{
      res.sendStatus(403)
  }
}
permitir = (...allowed) => {
  const isAllowed = role => allowed.indexOf(role) > -1;
  return (req, res, next) => {
    if(isAllowed(req.role))
      next();
    else {
      res.status(403).json({message: "Forbidden"});
    }
  }
}

module.exports = { auth_middleware, permitir};
