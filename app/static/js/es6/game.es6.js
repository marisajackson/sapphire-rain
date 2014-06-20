/* global Phaser, ajax, _ */

(function(){
  'use strict';
  var game;
  var lazyPlayerCaught;

  $(document).ready(init);

  function init(){
    game = new Phaser.Game(800, 640, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render});
    getStats();
    lazyPlayerCaught = _.debounce(playerCaught, 1000, {leading:true, trailing:false});
  }

  function getStats(){
    ajax('/users/stats', 'get', null, html=>{
      $('#stats').empty().append(html);
    });
  }

  function preload(){
    game.load.tilemap('background', 'img/assets/background.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('collisions', 'img/assets/collision.json', null, Phaser.Tilemap.TILED_JSON);
    // game.load.tilemap('jewels', 'img/assets/jewels.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tallgrass', 'img/assets/tallgrass.png');
    game.load.image('bush', 'img/assets/bush.png');
    // game.load.image('littleshrooms', 'img/littleshrooms.png');
    // game.load.image('terrain', 'img/terrain.png');
    game.load.spritesheet('character', 'img/assets/main-player.png', 64, 64);
    game.load.spritesheet('enemy', 'img/assets/enemy.png', 48, 64);
    game.load.spritesheet('icons', 'img/assets/icons.png', 24, 24);
    game.load.spritesheet('blueJewel', 'img/assets/blue-jewels.png', 32, 32);
    game.load.spritesheet('greenJewel', 'img/assets/green-jewels.png', 32, 32);
    game.load.spritesheet('redJewel', 'img/assets/red-jewels.png', 32, 32);
    game.load.spritesheet('pinkJewel', 'img/assets/pink-jewels.png', 32, 32);
    game.load.spritesheet('yellowJewel', 'img/assets/yellow-jewels.png', 32, 32);
  }

  var gameHeight = 640;
  var gameWidth = 800;
  var tile = 32;
  var cursors;
  var player;
  var collisions;
  var background;
  var collisionMap;
  var terrain;
  var enemies;
  var enemy1, enemy2, enemy3, enemy4;
  var key;
  var greenJewels, blueJewels, yellowJewels, pinkJewels, redJewels, jewels;

  function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    addBackgroundMap();
    addCollisionMap();
    addEnemySprites();
    addItems();
    jewels = game.add.group();
    jewels.enableBody = true;
    addJewels();
    addPlayerSprite();
  }

  function addItems(){
    key = game.add.sprite(5, gameHeight - (tile * 7), 'icons', 82);
    key.scale.setTo(1.25, 1.25);
    game.physics.enable(key);
  }

  function addJewel(x, y, color, sprite){
    jewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, sprite));
    jewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    jewels.callAll('play', null, 'spin');
    // game.phyics.enable(color);
  }

  // function addJewel(x, y){
  //   greenJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'greenJewels'));
  //   greenJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
  //   greenJewels.callAll('play', null, 'spin');
  // }
  //
  // function addJewel(x, y){
  //   blueJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'blueJewels'));
  //   blueJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
  //   blueJewels.callAll('play', null, 'spin');
  // }
  //
  // function addJewel(x, y){
  //   yellowJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'yellowJewels'));
  //   yellowJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
  //   yellowJewels.callAll('play', null, 'spin');
  // }
  //
  // function addJewel(x, y){
  //   pinkJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'pinkJewels'));
  //   pinkJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
  //   pinkJewels.callAll('play', null, 'spin');
  // }
  //
  // function addRedJewels(x, y){
  //   redJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'redJewels'));
  //   redJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
  //   redJewels.callAll('play', null, 'spin');
  // }

  function addEnemySprites(){
    enemies = game.add.group();

    enemy1 = game.add.sprite(10, gameHeight - (tile * 5), 'enemy');
    createEnemyAnimations(enemy1);

    enemy2 = game.add.sprite(10, tile * 2, 'enemy');
    createEnemyAnimations(enemy2);

    enemy3 = game.add.sprite(tile * 3, tile * 5, 'enemy');
    createEnemyAnimations(enemy3);

    enemy4 = game.add.sprite(gameWidth - (tile * 4.75), 0, 'enemy');
    createEnemyAnimations(enemy4);
  }

  function createEnemyAnimations(enemy){
    game.physics.enable(enemy);
    enemy.body.setSize(32, 32, 8, 32);
    enemy.body.collideWorldBounds = true;
    enemy.animations.add('right', [8, 9, 10, 11], 5, true);
    enemy.animations.add('left', [4, 5, 6, 7], 5, true);
    enemy.animations.add('down', [0, 1, 2, 3], 5, true);
    enemy.animations.add('up', [12, 13, 14, 15], 5, true);
    enemy.right = true;
    enemy.down = true;
    enemy.body.immovable = true;
    enemies.add(enemy);
  }

  function addPlayerSprite(){
    player = game.add.sprite(128, 630, 'character');
    game.physics.enable(player);
    player.body.setSize(32, 32, 16, 32);
    player.body.collideWorldBounds = true;
    player.life = 3;
    player.jewels = 0;
    player.keys = 0;
    player.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
    player.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 10, true);
    player.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 10, true);
    player.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34], 10, true);
  }

  function addBackgroundMap(){
    background = game.add.tilemap('background');
    background.addTilesetImage('tallgrass');
    terrain = background.createLayer('Background');
  }

  function addCollisionMap(){
    collisionMap = game.add.tilemap('collisions');
    collisionMap.addTilesetImage('bush');
    collisionMap.setCollision(1);
    collisions = collisionMap.createLayer('collision');
  }

  function update(){
    game.physics.arcade.collide(player, collisions);
    cursors = game.input.keyboard.createCursorKeys();
    playerMove();
    enemiesMove(enemy1, 'horizontal');
    enemiesMove(enemy2, 'horizontal');
    enemiesMove(enemy3, 'horizontal');
    enemiesMove(enemy4, 'vertical');
    game.physics.arcade.collide(player, enemies, lazyPlayerCaught);
    game.physics.arcade.overlap(player, jewels, collectJewel);
    game.physics.arcade.overlap(player, key, collectKey);
  }

  function collectKey(player, key){
    key.kill();
    player.keys += 1;
    ajax('/users/keys', 'put', {amount: player.keys}, ()=>{
      getStats();
    });
  }

  function collectJewel(player, jewel){
    console.log(jewel.key);
    var amount;
    switch(jewel.key){
      case 'greenJewel':
        amount = 1;
        break;
      case 'blueJewel':
        amount = 5;
        break;
      case 'redJewel':
        amount = 20;
        break;
      case 'pinkJewel':
        amount = 100;
        break;
      case 'yellowJewel':
        amount = 50;
        break;
    }
    player.jewels += amount;
    jewel.kill();
    ajax('/users/jewels', 'put', {amount: player.jewels}, ()=>{
      getStats();
    });
  }

  function playerCaught(){
    var dead;
    player.life -= 1;
    if(player.life <= 0){
      player.body.x = 128;
      player.body.y = 630;
      player.life = 3;
      dead = true;
    } else {
      dead = false;
    }
    ajax('/users/life', 'put', {life: player.life, dead: dead}, ()=>{
      getStats();
    });
  }

  function enemiesMove(enemy, direction){
    if(direction === 'horizontal'){
      if(game.physics.arcade.collide(enemy, collisions)){
        enemy.right = !enemy.right;
      }
      if(enemy.right){
        enemy.body.velocity.x = 125;
        enemy.animations.play('right');
      } else {
        enemy.body.velocity.x = -125;
        enemy.animations.play('left');
      }
    } else {
      if(game.physics.arcade.collide(enemy, collisions)){
        enemy.down = !enemy.down;
      }
      if(enemy.down){
        enemy.body.velocity.y = 125;
        enemy.animations.play('down');
      } else {
        enemy.body.velocity.y = -125;
        enemy.animations.play('up');
      }
    }

  }

  function playerMove(){
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    if(cursors.left.isDown){
      player.body.velocity.x = -150;
      player.animations.play('left');
    } else if(cursors.right.isDown) {
      player.body.velocity.x = 150;
      player.animations.play('right');
    } else if(cursors.up.isDown){
      player.body.velocity.y = -150;
      player.animations.play('up');
    } else if(cursors.down.isDown){
      player.body.velocity.y = 150;
      player.animations.play('down');
    } else {
      player.animations.stop();
      player.frame = 23;
    }
  }

  function addJewels(){
    // greenJewels = game.add.group();
    // greenJewels.enableBody = true;
    //
    // blueJewels = game.add.group();
    // blueJewels.enableBody = true;
    //
    // pinkJewels = game.add.group();
    // pinkJewels.enableBody = true;
    //
    // yellowJewels = game.add.group();
    // yellowJewels.enableBody = true;
    //
    // redJewels = game.add.group();
    // redJewels.enableBody = true;

    addJewel(7,8, greenJewels, 'greenJewel');
    addJewel(7,9, greenJewels, 'greenJewel');
    addJewel(7,10, greenJewels, 'greenJewel');
    addJewel(8,8, blueJewels, 'blueJewel');
    addJewel(8,9, blueJewels, 'blueJewel');
    addJewel(8,10, greenJewels, 'greenJewel');
    addJewel(9,10, greenJewels, 'greenJewel');
    addJewel(9,9, greenJewels, 'greenJewel');
    addJewel(9,8, greenJewels, 'greenJewel');
    addJewel(10,8, greenJewels, 'greenJewel');
    addJewel(10,9, blueJewels, 'blueJewel');
    addJewel(10,10, blueJewels, 'blueJewel');
    addJewel(10,11, greenJewels, 'greenJewel');
    addJewel(10,12, greenJewels, 'greenJewel');
    addJewel(10,13, pinkJewels, 'pinkJewel');
    addJewel(11,8, greenJewels, 'greenJewel');
    addJewel(11,9, greenJewels, 'greenJewel');
    addJewel(11,10, blueJewels, 'blueJewel');
    addJewel(11,11, greenJewels, 'greenJewel');
    addJewel(11,12, greenJewels, 'greenJewel');
    addJewel(11,13, greenJewels, 'greenJewel');
    addJewel(12,8, greenJewels, 'greenJewel');
    addJewel(12,9, greenJewels, 'greenJewel');
    addJewel(12,10, greenJewels, 'greenJewel');
    addJewel(12,11, blueJewels, 'blueJewel');
    addJewel(12,12, blueJewels, 'blueJewel');
    addJewel(12,13, greenJewels, 'greenJewel');
    addJewel(13,8, greenJewels, 'greenJewel');
    addJewel(13,9, greenJewels, 'greenJewel');
    addJewel(13,10, greenJewels, 'greenJewel');
    addJewel(13,11, greenJewels, 'greenJewel');
    addJewel(13,12, blueJewels, 'blueJewel');
    addJewel(13,13, greenJewels, 'greenJewel');
    addJewel(14,8, greenJewels, 'greenJewel');
    addJewel(14,9, greenJewels, 'greenJewel');
    addJewel(14,10, greenJewels, 'greenJewel');
    addJewel(14,11, blueJewels, 'blueJewel');
    addJewel(14,12, blueJewels, 'blueJewel');
    addJewel(14,13, greenJewels, 'greenJewel');
    addJewel(15,8, greenJewels, 'greenJewel');
    addJewel(15,9, greenJewels, 'greenJewel');
    addJewel(15,10, greenJewels, 'greenJewel');
    addJewel(15,11, greenJewels, 'greenJewel');
    addJewel(15,12, greenJewels, 'greenJewel');
    addJewel(15,13, yellowJewels, 'yellowJewel');
    addJewel(16,8, blueJewels, 'blueJewel');
    addJewel(16,9, blueJewels, 'blueJewel');
    addJewel(16,10, blueJewels, 'blueJewel');
    addJewel(16,11, greenJewels, 'greenJewel');
    addJewel(17,8, blueJewels, 'blueJewel');
    addJewel(17,9, greenJewels, 'greenJewel');
    addJewel(17,10, blueJewels, 'blueJewel');
    addJewel(17,11, blueJewels, 'blueJewel');
    addJewel(18,8, blueJewels, 'blueJewel');
    addJewel(18,9, greenJewels, 'greenJewel');
    addJewel(18,10, greenJewels, 'greenJewel');
    addJewel(18,11, greenJewels, 'greenJewel');
    addJewel(19,8, greenJewels, 'greenJewel');
    addJewel(19,9, greenJewels, 'greenJewel');
    addJewel(19,10, greenJewels, 'greenJewel');
    addJewel(19,11, greenJewels, 'greenJewel');
    addJewel(20,11, greenJewels, 'greenJewel');
    addJewel(20,12, greenJewels, 'greenJewel');
    addJewel(20,13, greenJewels, 'greenJewel');
    addJewel(21,11, greenJewels, 'greenJewel');
    addJewel(21,12, greenJewels, 'greenJewel');
    addJewel(21,13, greenJewels, 'greenJewel');
    addJewel(22, 11, blueJewels, 'blueJewel');
    addJewel(22,12, greenJewels, 'greenJewel');
    addJewel(22,13, greenJewels, 'greenJewel');
    addJewel(23,11, blueJewels, 'blueJewel');
    addJewel(23,12, greenJewels, 'greenJewel');
    addJewel(23,13, greenJewels, 'greenJewel');
    addJewel(24,11, redJewels, 'redJewel');
    addJewel(24,12, redJewels, 'redJewel');
    addJewel(24,13, redJewels, 'redJewel');
    addJewel(25,11, redJewels, 'redJewel');
    addJewel(25,12, redJewels, 'redJewel');
  }

  function render(){
    // game.debug.body(player);
    // game.debug.body(enemy1);
  }


})();
