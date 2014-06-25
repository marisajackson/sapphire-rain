/* global Phaser, ajax, _ */

(function(){
  'use strict';
  var game;
  var lazyPlayerHit;
  var player;

  $(document).ready(init);

  function init(){
    // getPlayerInfo();
    game = new Phaser.Game(800, 640, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render});
    getStats();
    lazyPlayerHit = _.debounce(playerHit, 1000, {leading:true, trailing:false});
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
    game.load.image('wall', 'img/assets/wall.png');
    game.load.spritesheet('win', 'img/assets/win.png', 800, 640);
    game.load.spritesheet('rug', 'img/assets/rug.png', 32, 32);
    game.load.spritesheet('arrow-right', 'img/assets/arrowRight.png', 35, 32);
    game.load.spritesheet('arrow-left', 'img/assets/arrowLeft.png', 35, 32);
    game.load.spritesheet('red', 'img/assets/red.png', 800, 640);
    game.load.spritesheet('lock', 'img/assets/lock.png', 48, 48);
    game.load.spritesheet('archer', 'img/assets/archer.png', 64, 64);
    game.load.spritesheet('berry-bush', 'img/assets/berries.png', 32, 32);
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

  var gameHeight = 1920;
  var gameWidth = 800;
  var tile = 32;
  var cursors;
  var collisions;
  var background, collisionMap, terrain, jewels;
  var enemies, bushes, arrows, berries, archers, keys, doors;
  var enemy1, enemy2, enemy3, enemy4;
  var archer1, archer2, archer3, archer4;
  var locks, injured, injured1, bush;
  var door1, door2;

  // function getPlayerInfo(){
  //   ajax('/users/life', 'put', {life: 3, dead: 'false'}, user=>{
  //     player.lastCompletedLevel = user.lastCompletedLevel;
  //     player.life = user.life * 1;
  //     player.jewels = user.jewels * 1;
  //     player.keys = user.items.keys * 1;
  //     getStats();
  //   }, 'json');
  // }

  function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0,0,gameWidth, gameHeight);
    addBackgroundMap();
    addCollisionMap();
    // addItems();
    game.add.sprite(0,0,'win');
    jewels = game.add.group();
    jewels.enableBody = true;
    addJewels();
    addDoors();
    // addLocks();
    addBushes();
    addBerryBushes();
    addRug();
    addEnemySprites();
    addArchers();
    arrows = game.add.group();
    addPlayerSprite(()=>{
      addItems();
      addLocks();
    });
  }

  function addRug(){
    game.add.sprite(tile*5, (gameHeight/3)*2 - tile, 'rug');
  }

  function addArchers(){
    archers = game.add.group();

    archer1 = game.add.sprite(-tile/2, (gameHeight/3)*2 - tile * 9, 'archer', 247);
    createArcherAnimations(archer1);

    archer2 = game.add.sprite(-tile/2, (gameHeight/3)*2 - tile * 17, 'archer', 247);
    createArcherAnimations(archer2);

    archer3 = game.add.sprite(gameWidth - tile*1.5, (gameHeight/3)*2 - tile * 13, 'archer', 220);
    createArcherAnimations(archer3);

    archer4 = game.add.sprite(gameWidth - tile*1.5, (gameHeight/3)*2 - tile * 17, 'archer', 220);
    createArcherAnimations(archer4);
  }

  function createArcherAnimations(archer){
    var right = _.range(247, 259);
    var left = _.range(221, 233);
    archer.animations.add('shoot-left', left, 15, true);
    archer.animations.add('shoot-right', right, 15, true);
    game.physics.enable(archer);
  }

  function addBerryBushes(){
    berries = game.add.group();
    berries.add(game.add.sprite(tile*3, gameHeight - (tile*23), 'berry-bush'));
    berries.add(game.add.sprite(tile*8, gameHeight - (tile*23), 'berry-bush'));
    berries.add(game.add.sprite(tile*12, gameHeight - (tile*23), 'berry-bush'));
    berries.add(game.add.sprite(tile*17, gameHeight - (tile*23), 'berry-bush'));
    berries.add(game.add.sprite(tile*18, gameHeight - (tile*26), 'berry-bush'));
    game.physics.enable(berries);
    berries.setAll('body.collideWorldBounds', true);
    berries.forEach(berry=>{
      berry.body.setSize(15,15,8,8);
    });
  }

  function addBushes(){
    bushes = game.add.group();
    for(var i = 1; i < 24; i++){
      if(i !== 5){
        bush = game.add.sprite(tile * i, (gameHeight/3)*2 + tile + 16, 'bush');
        game.physics.enable(bush);
        bush.body.immovable = true;
        bushes.add(bush);
      }
    }
    for(var j = 0; j < 25; j++){
      if(j !== 19){
        bush = game.add.sprite(tile * j, gameHeight/3 + tile + 10, 'bush');
        game.physics.enable(bush);
        bush.body.immovable = true;
        bushes.add(bush);
      }
    }
  }

  function addLocks(){
    locks = game.add.group();
    var lock1 = game.add.sprite(tile*5 + 4, (gameHeight/3)*2 + 20, 'lock');
    lock1.door = door1;
    locks.add(lock1);
    if(player.lastCompletedLevel > 0){
      lock1.door.unlocked = true;
      lock1.kill();
    }
    var lock2 = game.add.sprite(gameWidth - tile*6 +4, (gameHeight/3) +20, 'lock');
    lock2.door = door2;
    locks.add(lock2);
    if(player.lastCompletedLevel > 1){
      lock2.door.unlocked = true;
      lock2.kill();
    }
    locks.forEach(lock=>{
      lock.scale.setTo(0.5);
      game.physics.enable(lock);
      lock.body.immovable = true;
    });
  }

  function addDoors(){
    doors = game.add.group();
    door1 = game.add.sprite(tile*5-3, (gameHeight/3)*2 -5, 'doors', 57);
    doors.add(door1);
    door2 = game.add.sprite(gameWidth - tile*6 - 3, gameHeight/3 -5, 'doors', 57);
    doors.add(door2);
    doors.forEach(door=>{
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
    });
  }

  function addItems(){
    keys = game.add.group();

    if(player.lastCompletedLevel < 1){
      keys.add(game.add.sprite(5, gameHeight - (tile * 7), 'icons', 82));
    }
    if(player.lastCompletedLevel < 2){
      keys.add(game.add.sprite(tile * 3, gameHeight/3 + tile * 6, 'icons', 82));
    }
    game.physics.enable(keys);
    keys.forEach(key=>{key.scale.setTo(1.25, 1.25);});
  }

  function addJewel(x, y, sprite){
    jewels.add(game.add.sprite(gameWidth - (tile * x), (gameHeight/3)*2 + tile* y, sprite));
    jewels.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    jewels.callAll('play', null, 'spin');
    // game.phyics.enable(color);
  }

  function addEnemySprites(){
    enemies = game.add.group();

    enemy1 = game.add.sprite(10, gameHeight - (tile * 5), 'enemy');
    createEnemyAnimations(enemy1);

    enemy2 = game.add.sprite(10, (gameHeight/3)*2+ tile * 2, 'enemy');
    createEnemyAnimations(enemy2);

    enemy3 = game.add.sprite(tile * 3, (gameHeight/3)*2 + tile * 5, 'enemy');
    createEnemyAnimations(enemy3);

    enemy4 = game.add.sprite(gameWidth - (tile * 4.75), (gameHeight/3)*2 + tile, 'enemy');
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

  function addPlayerSprite(fn){
    player = game.add.sprite(128, gameHeight - (tile*3), 'character');
    // player = game.add.sprite(128, (gameHeight/3)*2 - tile *2, 'character');
    game.physics.enable(player);
    player.body.setSize(20, 20, 24, 40);
    player.body.collideWorldBounds = true;
    player.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
    player.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 10, true);
    player.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 10, true);
    player.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34], 10, true);

    ajax('/users/life', 'put', {life: 3, dead: 'false'}, user=>{
      player.lastCompletedLevel = user.lastCompletedLevel * 1;
      player.life = user.life * 1;
      player.jewels = user.jewels * 1;
      player.keys = user.items.keys * 1;
      getStats();
      fn();
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
    cameraWatch();

    enemiesMove(enemy1, 'horizontal');
    enemiesMove(enemy2, 'horizontal');
    enemiesMove(enemy3, 'horizontal');
    enemiesMove(enemy4, 'vertical');

    archersShoot(archer1, 'right');
    archersShoot(archer2, 'right');
    archersShoot(archer3, 'left');
    archersShoot(archer4, 'left');
    game.physics.arcade.overlap(arrows, collisions, killArrow);
    game.physics.arcade.collide(arrows, archers, killArrow);
    game.physics.arcade.overlap(arrows, berries, killArrow);
    game.physics.arcade.overlap(player, arrows, killArrow2, playerHit);

    // berries.setAll('body.immovable', false);


    game.physics.arcade.collide(player, enemies, lazyPlayerHit);

    game.physics.arcade.overlap(player, jewels, collectJewel);
    game.physics.arcade.collide(player, collisions);
    game.physics.arcade.collide(player, berries);
    game.physics.arcade.collide(berries, player);
    game.physics.arcade.collide(berries, collisions);
    berries.setAll('body.velocity', 0);
    game.physics.arcade.collide(player, bushes);
    game.physics.arcade.overlap(player, keys, collectKey);
    game.physics.arcade.collide(player, locks, unlockDoor);
    game.physics.arcade.overlap(player, doors, openDoor);
    doors.forEach(door=>{
      if(door.opened && !game.physics.arcade.overlap(player, door)){
        door.opened = false;
        door.animations.play('closed');
      }
    });
  }

  function killArrow(a){
    a.kill();
    setTimeout(function(){
      a.body = null;
      a.destroy();
    }, 500);
  }

  function killArrow2(p, a){
    a.kill();
    setTimeout(function(){
      a.body = null;
      a.destroy();
    }, 500);
  }

  var isShooting = false;

  function archersShoot(archer, direction){
    if(direction === 'right'){
      archer.animations.play('shoot-right');

      if(!isShooting){
        isShooting = true;
        setTimeout(function(){
          shootArrow();
          isShooting = false;
        }, 600);
      }
    } else {
      archer.animations.play('shoot-left');
    }
  }

  function shootArrow(){
    arrows.add(game.add.sprite(3, (gameHeight/3)*2 - tile * 8 - 9, 'arrow-right'));
    arrows.add(game.add.sprite(3, (gameHeight/3)*2 - tile * 16 - 9, 'arrow-right'));
    arrows.add(game.add.sprite(gameWidth - 3, (gameHeight/3)*2 - tile * 12 - 9, 'arrow-left'));
    arrows.add(game.add.sprite(gameWidth - 3, (gameHeight/3)*2 - tile * 16 - 9, 'arrow-left'));
    arrows.forEach(arrow=>{
      game.physics.enable(arrow);
      arrow.body.setSize(32,20,3,9);
      if(arrow.key === 'arrow-right'){
        arrow.body.velocity.x = 300;
      } else {
        arrow.body.velocity.x = -300;
      }
    });
  }

  function cameraWatch(){
    if(player.body.y < 640){
      game.camera.y = 0;
    } else if(player.body.y > 640 && player.body.y < 1280){
      game.camera.y = 640;
    } else if(player.body.y > 1280){
      game.camera.y = 1280;
    }
  }

  function unlockDoor(player, lock){
    if(player.keys){
      lock.door.unlocked = true;
      lock.kill();
      player.keys -= 1;
      player.lastCompletedLevel += 1;
      ajax('/users/keys', 'put', {amount: player.keys, level: player.lastCompletedLevel}, ()=>{
        getStats();
      });
    }
  }

  function openDoor(p, door){
    if(door.unlocked && !door.opened){
      door.opened = true;
      door.animations.play('open');
    }
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

  function playerHit(){
    addInjuredSprite();
    var dead;
    player.life -= 1;
    if(player.life <= 0){
      console.log(player.body.y);
      if(player.body.y < 1280){
        console.log('lessthan');
        player.body.x = 128;
        player.body.y = (gameHeight/3)*2 - 10;
      } else if(player.body.y > 1280){
        player.body.x = 128;
        player.body.y = gameHeight - tile;
      }
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
    injured = game.add.sprite(0,gameHeight/3,'red');
    setTimeout(function(){
      injured.kill();
      injured1.kill();
    }, 100);
    injured1 = game.add.sprite(0,gameHeight/3 *2,'red');
    setTimeout(function(){
      injured1.kill();
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
    // game.debug.body(arrow);
    // game.debug.body(player);
    // game.debug.body(enemy1);
    // arrows.forEach(arrow=>{game.debug.body(arrow);});
    // berries.forEach(berry=>{game.debug.body(berry);});
  }

})();
