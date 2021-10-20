var express = require('express');
var router = express.Router();
const User = require('../models/user.js');
const withAuth = require('../middlewares/auth');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;



router.post('/register', async function(req, res) {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save()
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({error: " Erro ao registrar novo usuário, tente novamente."});
  }
});

router.post('/login', async(req, res) => {
  console.log('hi');
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if(!user)
      res.status(401).json({error: 'Senha ou email incorretos'});
    else {
      user.isCorrectPassword(password, function(err, same){
        if(!same)
          res.status(401).json({error: 'Senha ou email incorretos'});
        else {
          const token = jwt.sign({email}, secret, { expiresIn: '10d' });
          res.json({user: user, token: token});
        }
      })
    }
  } catch (error) {
    res.status(500).json({error: 'Erro interno, por favor tente novamente'});
  }
});

router.put('/', withAuth, async function(req, res) {
  const { name, email } = req.body;

  try {
    var user = await User.findOneAndUpdate(
      {_id: req.user._id}, 
      { $set: { name: name, email: email}}, 
      { upsert: true, 'new': true }
    )
    res.json(user);
  } catch (error) {
    res.status(401).json({error: error});
  }
});

router.put('/password', withAuth, async function(req, res) {
  const { password } = req.body;

  try {
    var user = await User.findOne({_id: req.user._id})
      user.password = password
      user.save()
      res.json(user);
    
    res.json(user);
  } catch (error) {
    res.status(401).json({error: error})
  }
});

router.delete('/', withAuth, async function(req, res) {
  try {
    let user = await User.findOne({_id: req.user._id });
    await user.delete();
    res.json({message: 'OK'}).status(201);
  } catch (error) {
    res.status(500).json({error: error});
  }
});



module.exports = router;
