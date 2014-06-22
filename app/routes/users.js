'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../../app/models/user.js');

exports.life = (req, res)=>{
  res.locals.user.updateLife(req.body);
  res.locals.user.save(user=>{
    console.log('send');
    console.log(user);
    res.send(user);
  });
};

exports.jewels = (req, res)=>{
  res.locals.user.updateJewels(req.body.amount);
  res.locals.user.save(user=>{
    res.send(user);
  });
};

exports.keys = (req, res)=>{
  res.locals.user.updateKeys(req.body.amount);
  res.locals.user.save(user=>{
    res.send(user);
  });
};

exports.stats = (req, res)=>{
  res.render('users/stats');
};

exports.authenticate = (req, res)=>{
  User.login(req.body, (user)=>{
    if(user){
      req.session.userId = user._id;
      res.redirect('/game');
    } else {
      res.redirect('/');
    }
  });
};

exports.create = (req, res)=>{
  User.register(req.body, (user)=>{
    if(user){
      req.session.userId = user._id;
      res.redirect('/game');
    } else {
      res.redirect('/');
    }
  });
};

exports.lookup = (req, res, next)=>{
  User.findByUserId(req.session.userId, u=>{
    res.locals.user = u;
    next();
  });
};

exports.new = (req, res)=>{
  res.render('users/register');
};
