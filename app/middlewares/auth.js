require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const WithAuth = (req, res, next) => {
  const token = rew.headers['x-acess-token'];
  if(!token)
    res.status(401).json({error: 'Não autorizado: nenhum token fornecido'});
  else{
    jwt.verify(token, secret, (err, decoded) =>{
      if(err)
        res.status(401).json({error: 'Não autorizado:  token invalido'});
      else{
        req.email = decoded.email;
        User.findOne({email: decoded.email})
        .then(user => {
          req.user = user;
          next();
        })
        .catch(err => {
          res.status(401).json({error: err});
        })
      }
    })
  }
}

module.exports = WithAuth;