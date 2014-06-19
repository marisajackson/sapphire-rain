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
    game.load.image('tallgrass', 'img/assets/tallgrass.png');
    game.load.image('bush', 'img/assets/bush.png');
    // game.load.image('littleshrooms', 'img/littleshrooms.png');
    // game.load.image('terrain', 'img/terrain.png');
    game.load.spritesheet('character', 'img/assets/main-player.png', 64, 64);
    game.load.spritesheet('enemy', 'img/assets/enemy.png', 48, 64);
    game.load.spritesheet('icons', 'img/assets/icons.png', 24, 24);
    game.load.spritesheet('blue-jewels', 'img/assets/blue-jewels.png', 32, 32);
    game.load.spritesheet('green-jewels', 'img/assets/green-jewels.png', 32, 32);
    game.load.spritesheet('red-jewels', 'img/assets/red-jewels.png', 32, 32);
    game.load.spritesheet('pink-jewels', 'img/assets/pink-jewels.png', 32, 32);
    game.load.spritesheet('yellow-jewels', 'img/assets/yellow-jewels.png', 32, 32);
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
  var greenJewels, blueJewels, yellowJewels, pinkJewels, redJewels;

  function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    addBackgroundMap();
    addCollisionMap();
    addPlayerSprite();
    addEnemySprites();
    addItems();
  }

  function addItems(){
    key = game.add.sprite(5, gameHeight - (tile * 7), 'icons', 82);
    key.scale.setTo(1.25, 1.25);

    greenJewels = game.add.group();
    blueJewels = game.add.group();
    pinkJewels = game.add.group();
    yellowJewels = game.add.group();
    redJewels = game.add.group();
    addGreenJewels(7,8);
    addGreenJewels(7,9);
    addGreenJewels(7,10);
    addBlueJewels(8,8);
    addBlueJewels(8,9);
    addGreenJewels(8,10);
    addGreenJewels(9,10);
    addGreenJewels(9,9);
    addGreenJewels(9,8);
    addGreenJewels(10,8);
    addBlueJewels(10,9);
    addBlueJewels(10,10);
    addGreenJewels(10,11);
    addGreenJewels(10,12);
    addPinkJewels(10,13);
    addGreenJewels(11,8);
    addGreenJewels(11,9);
    addBlueJewels(11,10);
    addGreenJewels(11,11);
    addGreenJewels(11,12);
    addGreenJewels(11,13);
    addGreenJewels(12,8);
    addGreenJewels(12,9);
    addGreenJewels(12,10);
    addBlueJewels(12,11);
    addBlueJewels(12,12);
    addGreenJewels(12,13);
    addGreenJewels(13,8);
    addGreenJewels(13,9);
    addGreenJewels(13,10);
    addGreenJewels(13,11);
    addBlueJewels(13,12);
    addGreenJewels(13,13);
    addGreenJewels(14,8);
    addGreenJewels(14,9);
    addGreenJewels(14,10);
    addBlueJewels(14,11);
    addBlueJewels(14,12);
    addGreenJewels(14,13);
    addGreenJewels(15,8);
    addGreenJewels(15,9);
    addGreenJewels(15,10);
    addGreenJewels(15,11);
    addGreenJewels(15,12);
    addYellowJewels(15,13);
    addBlueJewels(16,8);
    addBlueJewels(16,9);
    addBlueJewels(16,10);
    addGreenJewels(16,11);
    addBlueJewels(17,8);
    addGreenJewels(17,9);
    addBlueJewels(17,10);
    addBlueJewels(17,11);
    addBlueJewels(18,8);
    addGreenJewels(18,9);
    addGreenJewels(18,10);
    addGreenJewels(18,11);
    addGreenJewels(19,8);
    addGreenJewels(19,9);
    addGreenJewels(19,10);
    addGreenJewels(19,11);
    addGreenJewels(20,11);
    addGreenJewels(20,12);
    addGreenJewels(20,13);
    addGreenJewels(21,11);
    addGreenJewels(21,12);
    addGreenJewels(21,13);
    addBlueJewels(22, 11);
    addGreenJewels(22,12);
    addGreenJewels(22,13);
    addBlueJewels(23,11);
    addGreenJewels(23,12);
    addGreenJewels(23,13);
    addRedJewels(24,11);
    addRedJewels(24,12);
    addRedJewels(24,13);
    addRedJewels(25,11);
    addRedJewels(25,12);
  }

  function addGreenJewels(x, y){
    greenJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'green-jewels'));
    greenJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    greenJewels.callAll('play', null, 'spin');
  }

  function addBlueJewels(x, y){
    blueJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'blue-jewels'));
    blueJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    blueJewels.callAll('play', null, 'spin');
  }

  function addYellowJewels(x, y){
    yellowJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'yellow-jewels'));
    yellowJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    yellowJewels.callAll('play', null, 'spin');
  }

  function addPinkJewels(x, y){
    pinkJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'pink-jewels'));
    pinkJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    pinkJewels.callAll('play', null, 'spin');
  }

  function addRedJewels(x, y){
    redJewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, 'red-jewels'));
    redJewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    redJewels.callAll('play', null, 'spin');
  }

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
  }

  function playerCaught(){
    player.life -= 1;
    if(player.life <= 0){
      player.body.x = 128;
      player.body.y = 630;
      player.life = 3;
    }
    ajax('/users/life', 'put', {life: player.life}, ()=>{
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

  function render(){
    // game.debug.body(player);
    // game.debug.body(enemy1);
  }


})();
