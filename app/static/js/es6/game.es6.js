/* global Phaser */

(function(){
  'use strict';

  var game = new Phaser.Game(800, 640, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render});

  function preload(){
    game.load.tilemap('background', 'img/assets/background.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('collisions', 'img/assets/collision.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tallgrass', 'img/assets/tallgrass.png');
    game.load.image('bush', 'img/assets/bush.png');
    // game.load.image('littleshrooms', 'img/littleshrooms.png');
    // game.load.image('terrain', 'img/terrain.png');
    game.load.spritesheet('character', 'img/assets/main-player.png', 64, 64);
    game.load.spritesheet('enemy', 'img/assets/enemy.png', 48, 64);
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

  function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    addBackgroundMap();
    addCollisionMap();
    addPlayerSprite();
    addEnemySprites();
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
    game.physics.arcade.overlap(player, enemies, playerCaught);
  }

  function playerCaught(){
    player.body.x = 128;
    player.body.y = 630;
    player.life -= 1;
    console.log('life');
    console.log(player.life);
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
