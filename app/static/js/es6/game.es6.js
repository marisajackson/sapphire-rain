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
    // game.load.tilemap('foreground', 'img/assets/foreground.json', null, Phaser.Tilemap.TILED_JSON);
    // game.load.tilemap('jewels', 'img/assets/jewels.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tallgrass', 'img/assets/tallgrass.png');
    game.load.image('bush', 'img/assets/bush.png');
    game.load.image('wall', 'img/assets/wall.png');
    game.load.spritesheet('red', 'img/assets/red.png', 800, 640);
    game.load.spritesheet('lock', 'img/assets/lock.png', 48, 48);
    // game.load.image('littleshrooms', 'img/littleshrooms.png');
    // game.load.image('terrain', 'img/terrain.png');
    game.load.spritesheet('bush', 'img/assets/bush.png', 32, 32);
    game.load.spritesheet('character', 'img/assets/main-player.png', 64, 64);
    game.load.spritesheet('enemy', 'img/assets/enemy.png', 48, 64);
    game.load.spritesheet('icons', 'img/assets/icons.png', 24, 24);
    game.load.spritesheet('blueJewel', 'img/assets/blue-jewels.png', 32, 32);
    game.load.spritesheet('greenJewel', 'img/assets/green-jewels.png', 32, 32);
    game.load.spritesheet('redJewel', 'img/assets/red-jewels.png', 32, 32);
    game.load.spritesheet('pinkJewel', 'img/assets/pink-jewels.png', 32, 32);
    game.load.spritesheet('yellowJewel', 'img/assets/yellow-jewels.png', 32, 32);
    game.load.spritesheet('doors', 'img/assets/doors.png', 32, 64);
  }

  var gameHeight = 640;
  var gameWidth = 800;
  var tile = 32;
  var cursors;
  var player;
  var collisions;
  var background, collisionMap, terrain;
  var enemies, bushes;
  var enemy1, enemy2, enemy3, enemy4;
  var key, lock, jewels, door, injured, bush;
  // var foreground;

  function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    addBackgroundMap();
    addCollisionMap();
    // addForegroundMap();
    addItems();
    jewels = game.add.group();
    jewels.enableBody = true;
    addJewels();
    addDoor();
    addLock();
    addBushes();
    addPlayerSprite();
    addEnemySprites();
  }

  function addBushes(){
    bushes = game.add.group();
    for(var i = 1; i < 24; i++){
      if(i !== 5){
        bush = game.add.sprite(tile * i, tile + 16, 'bush');
        game.physics.enable(bush);
        bush.body.immovable = true;
        bushes.add(bush);
      }
    }
  }

  // function addForegroundMap(){
  //   foreground = game.add.tilemap('foreground');
  //   foreground.addTilesetImage('red');
  //   injured = foreground.createLayer('Injured');
  // }

  function addLock(){
    lock = game.add.sprite(tile*5 + 4, 20, 'lock');
    lock.scale.setTo(0.5);
    game.physics.enable(lock);
    lock.body.immovable = true;
  }

  function addDoor(){
    door = game.add.sprite(tile*5-3, -5, 'doors', 57);
    game.physics.enable(door);
    door.scale.setTo(1.10);
    door.body.checkCollision.down = true;
    door.body.checkCollision.right = false;
    door.body.checkCollision.left = false;
    door.body.immovable = true;
    door.animations.add('closed', [83, 70, 57], 10, false);
    door.animations.add('open', [57, 70, 83], 10, false);
    door.unlocked = false;
    door.opened = false;
  }

  function addItems(){
    key = game.add.sprite(5, gameHeight - (tile * 7), 'icons', 82);
    key.scale.setTo(1.25, 1.25);
    game.physics.enable(key);
  }

  function addJewel(x, y, sprite){
    jewels.add(game.add.sprite(gameWidth - (tile * x), tile* y, sprite));
    jewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    jewels.callAll('play', null, 'spin');
    // game.phyics.enable(color);
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
    enemy.body.setSize(32, 64, 8, 0);
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
    player = game.add.sprite(128, gameHeight - (tile*3), 'character');
    // player = game.add.sprite(128, tile *2, 'character');
    game.physics.enable(player);
    player.body.setSize(20, 28, 24, 32);
    player.body.collideWorldBounds = true;
    // player.body.immovable = true;
    player.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
    player.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 10, true);
    player.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 10, true);
    player.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34], 10, true);

    ajax('/users/life', 'put', {life: 3, dead: 'false'}, user=>{
      player.life = user.life * 1;
      player.jewels = user.jewels * 1;
      player.keys = user.items.keys * 1;
      getStats();
    }, 'json');
  }

  function addBackgroundMap(){
    background = game.add.tilemap('background');
    background.addTilesetImage('tallgrass');
    background.addTilesetImage('wall');
    terrain = background.createLayer('Background');
  }

  function addCollisionMap(){
    collisionMap = game.add.tilemap('collisions');
    collisionMap.addTilesetImage('bush');
    collisionMap.addTilesetImage('wall');
    collisionMap.setCollisionBetween(1, 3);
    collisions = collisionMap.createLayer('collision');
  }

  function update(){
    cursors = game.input.keyboard.createCursorKeys();
    playerMove();
    enemiesMove(enemy1, 'horizontal');
    enemiesMove(enemy2, 'horizontal');
    enemiesMove(enemy3, 'horizontal');
    enemiesMove(enemy4, 'vertical');
    game.physics.arcade.collide(player, enemies, lazyPlayerCaught);
    game.physics.arcade.overlap(player, jewels, collectJewel);
    game.physics.arcade.collide(player, collisions);
    game.physics.arcade.collide(player, bushes);
    game.physics.arcade.overlap(player, key, collectKey);
    game.physics.arcade.collide(player, lock, unlockDoor);
    if(door.unlocked && !door.opened){
      game.physics.arcade.overlap(player, door, openDoor);
    }
    if(door.opened && !game.physics.arcade.overlap(player, door)){
      door.opened = false;
      door.animations.play('closed');
    }
  }

  function unlockDoor(){
    if(player.keys){
      door.unlocked = true;
      lock.kill();
      player.keys -= 1;
      ajax('/users/keys', 'put', {amount: player.keys}, ()=>{
        getStats();
      });
    }
  }

  function openDoor(){
    door.opened = true;
    door.animations.play('open');
  }

  function collectKey(player, key){
    key.kill();
    player.keys += 1;
    ajax('/users/keys', 'put', {amount: player.keys}, ()=>{
      getStats();
    });
  }

  function collectJewel(player, jewel){
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
    addInjuredSprite();
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

  function addInjuredSprite(){
    injured = game.add.sprite(0,0,'red');
    setTimeout(function(){
      injured.kill();
    }, 100);
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
    addJewel(7,8, 'greenJewel');
    addJewel(7,9, 'greenJewel');
    addJewel(7,10, 'greenJewel');
    addJewel(8,8, 'blueJewel');
    addJewel(8,9, 'blueJewel');
    addJewel(8,10, 'greenJewel');
    addJewel(9,10, 'greenJewel');
    addJewel(9,9, 'greenJewel');
    addJewel(9,8, 'greenJewel');
    addJewel(10,8, 'greenJewel');
    addJewel(10,9, 'blueJewel');
    addJewel(10,10, 'blueJewel');
    addJewel(10,11, 'greenJewel');
    addJewel(10,12, 'greenJewel');
    addJewel(10,13, 'pinkJewel');
    addJewel(11,8, 'greenJewel');
    addJewel(11,9, 'greenJewel');
    addJewel(11,10, 'blueJewel');
    addJewel(11,11, 'greenJewel');
    addJewel(11,12, 'greenJewel');
    addJewel(11,13, 'greenJewel');
    addJewel(12,8, 'greenJewel');
    addJewel(12,9, 'greenJewel');
    addJewel(12,10, 'greenJewel');
    addJewel(12,11, 'blueJewel');
    addJewel(12,12, 'blueJewel');
    addJewel(12,13, 'greenJewel');
    addJewel(13,8, 'greenJewel');
    addJewel(13,9, 'greenJewel');
    addJewel(13,10, 'greenJewel');
    addJewel(13,11, 'greenJewel');
    addJewel(13,12, 'blueJewel');
    addJewel(13,13, 'greenJewel');
    addJewel(14,8, 'greenJewel');
    addJewel(14,9, 'greenJewel');
    addJewel(14,10, 'greenJewel');
    addJewel(14,11, 'blueJewel');
    addJewel(14,12, 'blueJewel');
    addJewel(14,13, 'greenJewel');
    addJewel(15,8, 'greenJewel');
    addJewel(15,9, 'greenJewel');
    addJewel(15,10, 'greenJewel');
    addJewel(15,11, 'greenJewel');
    addJewel(15,12, 'greenJewel');
    addJewel(15,13, 'yellowJewel');
    addJewel(16,8, 'blueJewel');
    addJewel(16,9, 'blueJewel');
    addJewel(16,10, 'blueJewel');
    addJewel(16,11, 'greenJewel');
    addJewel(17,8, 'blueJewel');
    addJewel(17,9, 'greenJewel');
    addJewel(17,10, 'blueJewel');
    addJewel(17,11, 'blueJewel');
    addJewel(18,8, 'blueJewel');
    addJewel(18,9, 'greenJewel');
    addJewel(18,10, 'greenJewel');
    addJewel(18,11, 'greenJewel');
    addJewel(19,8, 'greenJewel');
    addJewel(19,9, 'greenJewel');
    addJewel(19,10, 'greenJewel');
    addJewel(19,11, 'greenJewel');
    addJewel(20,11, 'greenJewel');
    addJewel(20,12, 'greenJewel');
    addJewel(20,13, 'greenJewel');
    addJewel(21,11, 'greenJewel');
    addJewel(21,12, 'greenJewel');
    addJewel(21,13, 'greenJewel');
    addJewel(22, 11, 'blueJewel');
    addJewel(22,12, 'greenJewel');
    addJewel(22,13, 'greenJewel');
    addJewel(23,11, 'blueJewel');
    addJewel(23,12, 'greenJewel');
    addJewel(23,13, 'greenJewel');
    addJewel(24,11, 'redJewel');
    addJewel(24,12, 'redJewel');
    addJewel(24,13, 'redJewel');
    addJewel(25,11, 'redJewel');
    addJewel(25,12, 'redJewel');
  }

  function render(){
    // game.debug.body(player);
    // game.debug.body(enemy1);
  }

})();
