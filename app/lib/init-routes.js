'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var game = traceur.require(__dirname + '/../routes/game.js');
  var users = traceur.require(__dirname + '/../routes/users.js');

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);

  app.get('/users/new', dbg, users.new);
  app.post('/users/login', dbg, users.authenticate);
  app.post('/users', dbg, users.create);
  app.get('/users/stats', dbg, users.stats);
  app.put('/users/life', dbg, users.life);

  app.get('/game', dbg,  game.index);


  console.log('Routes Loaded');
  fn();
}
