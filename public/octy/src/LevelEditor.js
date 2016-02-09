
OctyGame.LevelEditor = function (game) {

  //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

  this.game;      //  a reference to the currently running game (Phaser.Game)
  this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
  this.camera;    //  a reference to the game camera (Phaser.Camera)
  this.cache;     //  the game cache (Phaser.Cache)
  this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
  this.load;      //  for preloading assets (Phaser.Loader)
  this.math;      //  lots of useful common math operations (Phaser.Math)
  this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
  this.stage;     //  the game stage (Phaser.Stage)
  this.time;      //  the clock (Phaser.Time)
  this.tweens;    //  the tween manager (Phaser.TweenManager)
  this.state;     //  the state manager (Phaser.StateManager)
  this.world;     //  the game world (Phaser.World)
  this.particles; //  the particle manager (Phaser.Particles)
  this.physics;   //  the physics manager (Phaser.Physics)
  this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

  //  You can use any of these from any function within this State.
  //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

OctyGame.LevelEditor.prototype = {

  init: function(customJSON) {
    
    this.levelMap = customJSON;
    
  },

  preload: function() {

    this.time.advancedTiming = true;

    //  load empty template map
    if (!this.levelMap) {
      this.load.json('levelMap', 'assets/levels/template.json');
    }

  },

  create: function () {

    //  add background
    //  (this needs to be done before loading everything else because of layering)
    this.background = this.add.sprite(0, 0, 'background');

    this.music = this.add.audio('YourUnderwaterWorld');
    if (!this.game.mute) {
//      this.music.play('', 0, 1, true);
    }

    //  load level map from JSON
    this.levelMap = this.game.cache.getJSON('levelMap');
    this.tileSize = this.levelMap.tileSize;

    this.buildMenuHeight = 100;

    //  resize world according to level maps
    this.world.resize(this.levelMap.worldSize.width * this.tileSize.width, (this.levelMap.worldSize.height + 1) * this.tileSize.height);
    this.world.setBounds(-this.game.width / 2 + this.world.width / 2, 0, this.world.width, this.world.height);
    
    //  center game world
    this.camera.bounds = null; // to allow camera to move lower, otherwise the bottom of level is obscured by the build menu
    this.camera.x = -this.game.width / 2 + this.world.width / 2;
    
    //  move camera to bottom
    this.camera.y = this.world.height + this.buildMenuHeight - this.camera.height;

    //  stretch background to fill the game world
    this.background.height = this.world.height;
    this.background.width = this.world.width;
    //  animate background
    this.add.tween(this.background).to({height: this.world.height + 600}, 3000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();

     // main bubble paricle emitter at bottom edge of level
    // var bubbleBitmap = this.add.bitmapData(64, 64);
    // bubbleBitmap.ctx.beginPath();
    // bubbleBitmap.ctx.arc(32, 32, 28, 0, 2 * Math.PI, false);
    // bubbleBitmap.ctx.lineWidth = 2;
    // bubbleBitmap.ctx.strokeStyle = "#ffffff";
    // bubbleBitmap.ctx.stroke();
    // this.bubbleEmitter = this.add.emitter(this.world.centerX, this.world.height, 200);
    // this.bubbleEmitter.makeParticles(bubbleBitmap, 0, 200, false, true);
    // this.bubbleEmitter.gravity = -100;
    // this.bubbleEmitter.maxParticleScale = 0.8;
    // this.bubbleEmitter.minParticleScale = 0.2;
    // this.bubbleEmitter.width = this.world.width;
    // this.bubbleEmitter.start(false, 10000, 500);
    
    
    //  spawn currents
    this.currents = this.add.group();
    this.currents.enableBody = true;
    this.currents.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < this.levelMap.currents.length; i++) {
        var currentMap = this.levelMap.currents[i];
        var bitmap = this.add.bitmapData(currentMap.width * this.tileSize.width, currentMap.height * this.tileSize.height);
        bitmap.fill(0, 0, 255, 1);
        var current = this.currents.create(currentMap.x * this.tileSize.width, currentMap.y * this.tileSize.height, bitmap);
        current.force = currentMap.force;
        this.currents.add(current);
    }
    this.currents.setAll('inputEnabled', true);
    this.currentCurrent = null; // current currently being placed
    
    //  current directional buttons
    // left
    this.currentButtons = this.add.group();
    var b = this.add.bitmapData(64, 64);
    b.ctx.beginPath();
    b.ctx.arc(32, 32, 30, 0, 2 * Math.PI, false);
    b.ctx.lineWidth = 2;
    b.ctx.strokeStyle = '#ffffff';
    b.ctx.stroke();
    b.ctx.beginPath();
    b.ctx.moveTo(42, 18);
    b.ctx.lineTo(20, 32);
    b.ctx.lineTo(42, 46);
    b.ctx.lineWidth = 4;
    b.ctx.strokeStyle = '#000000';
    b.ctx.stroke();
    var _this = this;
    this.currentButtonLeft = this.add.button(-64, 0, b, function() {_this.currentLeft()});
    this.currentButtonLeft.anchor.setTo(0.5, 0.5);
    this.currentButtonLeftTween = this.add.tween(this.currentButtonLeft).to({x: '+8'}, 1200, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
    this.currentButtons.add(this.currentButtonLeft);
    // right
    var b = this.add.bitmapData(64, 64);
    b.ctx.beginPath();
    b.ctx.arc(32, 32, 30, 0, 2 * Math.PI, false);
    b.ctx.lineWidth = 2;
    b.ctx.strokeStyle = '#ffffff';
    b.ctx.stroke();
    b.ctx.beginPath();
    b.ctx.moveTo(20, 18);
    b.ctx.lineTo(44, 32);
    b.ctx.lineTo(20, 46);
    b.ctx.lineWidth = 4;
    b.ctx.strokeStyle = '#000000';
    b.ctx.stroke();
    var _this = this;
    this.currentButtonRight = this.add.button(64, 0, b, function() {_this.currentRight()});
    this.currentButtonRight.anchor.setTo(0.5, 0.5);
    this.currentButtonRightTween = this.add.tween(this.currentButtonRight).to({x: '-8'}, 1200, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
    this.currentButtons.add(this.currentButtonRight);
    
    this.currentButtons.setAll('visible', false);
    
    //  bubbles for bottom level spawner
    var bubblePoolSize = 16;
    this.bubbles = this.add.group();
    this.bubbles.enableBody = true;
    this.bubbles.physicsBodyType = Phaser.Physics.ARCADE;
    this.bubbleBitmap = this.add.bitmapData(64, 64);
    this.bubbleBitmap.ctx.beginPath();
    this.bubbleBitmap.ctx.arc(32, 32, 28, 0, 2 * Math.PI, false);
    this.bubbleBitmap.ctx.lineWidth = 3;
    this.bubbleBitmap.ctx.strokeStyle = "#ffffff";
    this.bubbleBitmap.ctx.stroke();
    for (var i=0; i<bubblePoolSize; i++) {
        var bubble = this.bubbles.create(this.world.width/2, this.world.height - 64, this.bubbleBitmap);
        bubble.exists = false;
        bubble.visible = false;
        // bubble.checkWorldBounds = true;
        // bubble.events.onOutOfBounds.add(this.resetBubble, this);
        bubble.body.drag.x = 200;
    }
    //  bubbles for currents
    this.bubblesCurrents = this.add.group();
    this.bubblesCurrents.enableBody = true;
    this.bubblesCurrents.physicsBodyType = Phaser.Physics.ARCADE;
    var bubblePoolSize = 16 * this.currents.length;
    for (var i=0; i<bubblePoolSize; i++) {
        var bubble = this.bubblesCurrents.create(this.world.width/2, this.world.height - 64, this.bubbleBitmap);
        bubble.exists = false;
        bubble.visible = false;
    }
    var timer = this.time.create(false);
    timer.loop(600, this.resetBubbleToBottom, this);
    timer.loop(100, this.resetBubbleToCurrent, this);
    timer.start();
    
    //  display grid
    this.grid = this.add.graphics(0, 0);
    this.grid.lineStyle(0.25, 0x000000, 1);
    for (var i = 1; i < this.levelMap.worldSize.height + 1; i++) {
      this.grid.moveTo(0, i * this.tileSize.height);
      this.grid.lineTo(this.world.width, i * this.tileSize.height);
    }
    for (var i = 1; i < this.levelMap.worldSize.width; i++) {
      this.grid.moveTo(i * this.tileSize.width, 0);
      this.grid.lineTo(i * this.tileSize.width, this.world.height);
    }

    //  spawn currents
    // this.currents = this.add.group();

    // for (var i = 0; i < this.levelMap.currents.length; i++) {

    //   //  current field
    //   var currentMap = this.levelMap.currents[i];
    //   var bitmap = this.add.bitmapData(currentMap.width * this.tileSize.width, currentMap.height * this.tileSize.height);
    //   bitmap.fill(0, 0, 255, 0.7);
    //   var current = this.currents.create(currentMap.x * this.tileSize.width, currentMap.y * this.tileSize.height, bitmap);
    //   // var sprite = this.add.sprite(current.x * this.tileSize.width, current.y * this.tileSize.height);
    //   // sprite.x += current.width * this.tileSize.width * 0.5;
    //   // sprite.y += current.height * this.tileSize.height * 0.5;
    //   // sprite.width = current.width * this.tileSize.width;
    //   // sprite.height = current.height * this.tileSize.height;
    //   // sprite.force = current.force;
    //   // this.currents.add(sprite);

    //   //  bubble particle emitter
    //   // if (currentMap.force[1] == 0) {
    //   //   // if Y part of vector is zero, it must be a horizontal current
    //   //   if (currentMap.force[0] > 0) {
    //   //     //  positive X means going left, so the source of the bubbles is to the right
    //   //     sprite.bubbles = this.add.emitter((currentMap.x + currentMap.width) * this.tileSize.width, (currentMap.y + currentMap.height / 2) * this.tileSize.height, 200);
    //   //   } else {
    //   //     //  negative X means going right, so bubbles come from the left
    //   //     sprite.bubbles = this.add.emitter(currentMap.x * this.tileSize.width, (currentMap.y + currentMap.height / 2) * this.tileSize.height, 200);
    //   //   }
    //   //   sprite.bubbles.height = currentMap.height * this.tileSize.height;
    //   //   sprite.bubbles.setXSpeed(-currentMap.force[0] * 15, -currentMap.force[0] * 20);
    //   //   sprite.bubbles.setYSpeed(-10, 10);
    //   // } else if (currentMap.force[0] == 0) {
    //   //   if (currentMap.force[1] > 0) {
    //   //     // positive Y means going up, so bubbles come from the bottom
    //   //     sprite.bubbles = this.add.emitter((currentMap.x + currentMap.width / 2) * this.tileSize.width, (currentMap.y + currentMap.height) * this.tileSize.height, 200);
    //   //   } else {
    //   //     // negative Y means going down, so bubbles come from above
    //   //     sprite.bubbles = this.add.emitter((currentMap.x + currentMap.width / 2) * this.tileSize.width, currentMap.y * this.tileSize.height, 200);
    //   //   }
    //   //   sprite.bubbles.width = currentMap.width * this.tileSize.width;
    //   //   sprite.bubbles.setXSpeed(-10, 10);
    //   //   sprite.bubbles.setYSpeed(-currentMap.force[1] * 15, -currentMap.force[1] * 20);
    //   // }
    //   // sprite.bubbles.makeParticles(bubbleBitmap, 0, 50, false, false);
    //   // sprite.bubbles.gravity = 0;
    //   // sprite.bubbles.maxParticleScale = 0.4;
    //   // sprite.bubbles.minParticleScale = 0.2;
    //   // sprite.bubbles.start(false, 2000, 50);

    // }    
    
    //  spawn pufferfish
    this.pufferfish = this.add.group();
    for (i = 0; i < this.levelMap.pufferfish.length; i++) {
        var nodes = this.levelMap.pufferfish[i];
        
        // plot movement path
        var path = this.plotPath(nodes, nodes.speed, true);

        // draw pufferfish
        var pufferfish = this.pufferfish.create(nodes.x[0] * this.tileSize.width, nodes.y[0] * this.tileSize.height, 'pufferfish');
        pufferfish.anchor.setTo(0.5, 0.5);
        pufferfish.speed = nodes.speed;
        pufferfish.nodes = nodes;
        pufferfish.path = path;
        pufferfish.pi = 0;
    }
    this.pufferfishPaths = this.add.graphics(0, 0);
    this.drawPufferfishPaths();
    this.pufferfish.setAll('inputEnabled', true);
    this.currentPufferfish = null; // pufferfish currently being placed

    //  spawn walls
    this.walls = this.add.group();
    for (var i = 0; i < this.levelMap.walls.length; i++) {
      var bitmap = this.add.bitmapData(this.levelMap.walls[i].width * this.tileSize.width, this.levelMap.walls[i].height * this.tileSize.height);
      bitmap.fill(0, 0, 0);
      var wall = this.walls.create(this.levelMap.walls[i].x * this.tileSize.width, this.levelMap.walls[i].y * this.tileSize.height, bitmap);
      wall.outerWall = this.levelMap.walls[i].outerWall;
      //  spawn attached urchins
      wall.urchins = [];
      if (this.levelMap.walls[i].urchins) {
          for (var j = 0; j < this.levelMap.walls[i].urchins.length; j++) {
          var urchin = this.add.sprite(this.levelMap.walls[i].urchins[j].x * this.tileSize.width, this.levelMap.walls[i].urchins[j].y * this.tileSize.height, 'urchin');
          urchin.wall = wall;
          urchin.inputEnabled = true;
          if (this.levelMap.walls[i].urchins[j].angle == "up"){
            urchin.angle = 0;
            urchin.x -= this.tileSize.width;
            urchin.y -= this.tileSize.height;
          } else if (this.levelMap.walls[i].urchins[j].angle == "right"){
            urchin.angle = 90;
            urchin.x += this.tileSize.width;
            urchin.y -= this.tileSize.height;
          } else if (this.levelMap.walls[i].urchins[j].angle == "down"){
            urchin.angle = 180;
            urchin.x += this.tileSize.width;
            urchin.y += this.tileSize.height;
          } else if (this.levelMap.walls[i].urchins[j].angle == "left"){
            urchin.angle = 270;
            urchin.x -= this.tileSize.width;
            urchin.y += this.tileSize.height;
          }
          wall.urchins.push(urchin);
        }
      }
    }
    this.walls.setAll('inputEnabled', true);
    this.currentWall = null; // wall currently being built
    this.currentUrchin = null; // urchin currently being placed

    //  wall and current outlines
    this.wallOutlines = this.add.graphics(0, 0);
    this.currentOutlines = this.add.graphics(0, 0);

    //  spawn Octy
    this.Octy = this.add.sprite(this.levelMap.OctySpawn.x * this.tileSize.width, this.levelMap.OctySpawn.y * this.tileSize.height, 'Octy', 'Octy');
    this.Octy.anchor.setTo(0.5, 0.5);

    //  spawn Mrs. Octy
    this.MrsOcty = this.add.sprite(this.levelMap.MrsOctySpawn.x * this.tileSize.width, this.levelMap.MrsOctySpawn.y * this.tileSize.height, 'MrsOcty', 'MrsOcty');
    
    //  build menu
    var buttonCount = 7;
    this.selectedPart = null;
    this.buildMenu = this.add.group();
    this.buildMenu.fixedToCamera = true;
    this.buildMenu.cameraOffset = new Phaser.Point(this.camera.width / 2 - this.levelMap.worldSize.width * this.tileSize.width / 2, this.camera.height - this.buildMenuHeight);
    //  background
    this.buildMenuBg = this.add.graphics(0, 0);
    this.buildMenuBg.beginFill(0xffffff, 1);
    this.buildMenuBg.lineStyle(4, 0x000000, 1);
    this.buildMenuBg.drawRect(0,0,480,100);
    this.buildMenuBg.endFill();
    this.buildMenu.add(this.buildMenuBg);
    //  wall button
    this.wallButtonBitmap = this.add.bitmapData(64, 64);
    this.wallButton = this.add.button(this.buildMenu.width / (buttonCount + 1), this.buildMenuHeight * 0.5, this.wallButtonBitmap, this.selectWall, this);
    this.wallButton.turnOff = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#ffffff');
      bitmap.rect(16, 16, 32, 32, '#000000');
    };
    this.wallButton.turnOn = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#4444ff');
      bitmap.rect(16, 16, 32, 32, '#000000');
    };
    this.wallButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.wallButton);
    //  urchin button
    this.urchinButtonTexture = this.add.renderTexture(64, 64);
    this.urchinButtonBitmap = this.add.bitmapData(64, 64);
    this.urchinButton = this.add.button(this.buildMenu.width / (buttonCount + 1) * 2, this.buildMenuHeight * 0.5, this.urchinButtonBitmap, this.selectUrchin, this);
    this.urchinButton.turnOff = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#ffffff');
      bitmap.draw('urchin', 6, -2, 48, 48);
    };
    this.urchinButton.turnOn = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#4444ff');
      bitmap.draw('urchin', 6, -2, 48, 48);
    };
    this.urchinButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.urchinButton);
    //  current button
    this.currentButtonBitmap = this.add.bitmapData(64, 64);
    this.currentButton = this.add.button(this.buildMenu.width / (buttonCount + 1) * 3, this.buildMenuHeight * 0.5, this.currentButtonBitmap, this.selectCurrent, this);
    this.currentButton.turnOff = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#ffffff');
      bitmap.rect(12, 31, 38, 2, '#0000FF');
      bitmap.text('<', 8, 46, '52px Courier', '#0000FF');
    };
    this.currentButton.turnOn = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#4444ff');
      bitmap.rect(12, 31, 38, 2, '#0000FF');
      bitmap.text('<', 8, 46, '52px Courier', '#0000FF');
    };
    this.currentButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.currentButton);
    //  pufferfish button
    this.pufferfishButtonBitmap = this.add.bitmapData(64, 64);
    this.pufferfishButton = this.add.button(this.buildMenu.width / (buttonCount + 1) * 4, this.buildMenuHeight * 0.5, this.pufferfishButtonBitmap, this.selectPufferfish, this);
    this.pufferfishButton.turnOff = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#ffffff');
      bitmap.draw('pufferfish', 9, 9, 48, 48);
    };
    this.pufferfishButton.turnOn = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#4444ff');
      bitmap.draw('pufferfish', 9, 9, 48, 48);
    };
    this.pufferfishButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.pufferfishButton);
    //  remove button
    this.destroyButtonBitmap = this.add.bitmapData(64, 64);
    this.destroyButton = this.add.button(this.buildMenu.width / (buttonCount + 1) * 5, this.buildMenuHeight * 0.5, this.destroyButtonBitmap, this.selectDestroy, this);
    this.destroyButton.turnOff = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#ffffff');
      bitmap.text('X', 12, 48, '64px Courier', 'rgb(255,0,0)');
    };
    this.destroyButton.turnOn = function (bitmap) {
      bitmap.clear();
      bitmap.circle(32, 32, 32, '#000000');
      bitmap.circle(32, 32, 30, '#4444ff');
      bitmap.text('X', 12, 48, '64px Courier', 'rgb(255,0,0)');
    };
    this.destroyButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.destroyButton);
    //  play button
    this.playButtonBitmap = this.add.bitmapData(64, 64);
    this.playButton = this.add.button(this.buildMenu.width / (buttonCount + 1) * 6, this.buildMenuHeight * 0.5, this.playButtonBitmap, this.playLevel, this);
    this.playButtonBitmap.circle(32, 32, 32, '#000000');
    this.playButtonBitmap.circle(32, 32, 30, '#ffffff');
    this.playButtonBitmap.text('>', 12, 48, '64px Courier', 'rgb(0,255,0)');
    this.playButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.playButton);
    //  menu button
    this.menuButtonBitmap = this.add.bitmapData(64, 64);
    this.menuButton = this.add.button(this.buildMenu.width / (buttonCount + 1) * 7, this.buildMenuHeight * 0.5, this.menuButtonBitmap, this.openMenu, this);
    this.menuButtonBitmap.circle(32, 32, 32, '#000000');
    this.menuButtonBitmap.circle(32, 32, 30, '#ffffff');
    this.menuButtonBitmap.rect(16, 16, 6, 6, '#000000');
    this.menuButtonBitmap.rect(16, 29, 6, 6, '#000000');
    this.menuButtonBitmap.rect(16, 42, 6, 6, '#000000');
    this.menuButtonBitmap.rect(26, 16, 22, 6, '#000000');
    this.menuButtonBitmap.rect(26, 29, 22, 6, '#000000');
    this.menuButtonBitmap.rect(26, 42, 22, 6, '#000000');
    this.menuButton.anchor.setTo(0.5, 0.5);
    this.buildMenu.add(this.menuButton);
    
    //  pufferfish placement confirm button
    var b = this.add.bitmapData(64, 64);
    b.ctx.beginPath();
    b.ctx.arc(32, 32, 30, 0, 2 * Math.PI, false);
    b.ctx.fillStyle = "#FF9000";
    b.ctx.fill();
    b.ctx.lineWidth = 3;
    b.ctx.strokeStyle = '#ffffff';
    b.ctx.stroke();
    b.ctx.beginPath();
    // b.ctx.moveTo(42, 18);
    // b.ctx.lineTo(20, 32);
    // b.ctx.lineTo(42, 46);
    b.ctx.moveTo(14, 32);
    b.ctx.lineTo(26, 46);
    b.ctx.lineTo(50, 22);
    b.ctx.lineWidth = 4;
    b.ctx.strokeStyle = '#000000';
    b.ctx.stroke();
    var _this = this;
    this.pufferfishDoneButton = this.add.button(this.buildMenu.width / 2, this.buildMenuHeight * -0.5, b, function() {
        _this.currentPufferfish = null;
        _this.pufferfishDoneButton.visible = false;
      });
    // this.pufferfishDoneButton.fixedToCamera = true;
    this.pufferfishDoneButton.anchor.setTo(0.5, 0.5);
    this.pufferfishDoneButtonTween = this.add.tween(this.pufferfishDoneButton).to({y: '-8'}, 1200, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
    this.pufferfishDoneButton.visible = false;
    this.buildMenu.add(this.pufferfishDoneButton);

    this.resetButtons();

    //  touch input events
    this.inputStartPosition = null;
    this.scrolling = false;
    this.input.onDown.add(this.onInputDown, this);
    this.input.onUp.add(this.onInputUp, this);
    //  camera
    this.camVelY = 0;
    this.camDrag = 1.1;
    
    //  enable back button input
    var _this = this;
    document.addEventListener("keypress", function(event){
        if (event.charCode == 98) { // 'B' key
            if (!_this.game.mute) {
                _this.music.stop();
            }
            _this.mainMenu();
        }
    });
    if (document.getElementById("backButton")) {
        document.getElementById("backButton").addEventListener("click", function (event) { _this.backButtonPressed(); });
    }
    try {
        var hardwareButtons = Windows.Phone.UI.Input.HardwareButtons;
        hardwareButtons.addEventListener("backpressed", function (e) {
            _this.backButtonPressed();
            e.handled = true; // Notifies OS that we've handled the back button event.
        });
    }
    catch(err) {
        // console.log("No Windows Phone UI detected.")
    }

  },

  //-----------------------------------------------------------------------------------------------------------------------------
  //-----------------------------------------------------------------------------------------------------------------------------

  update: function () {
    
    // bubbles react to currents
    this.physics.arcade.overlap(this.currents, this.bubbles, this.bubbleCollisionHandler, null, this);
    this.bubbles.forEach(function(bubble) {
        if (bubble.y <= 0 || bubble.x <= 0 || bubble.x >= this.world.width) {
            bubble.exists = false;
            bubble.visible = false;
        }
    }, this);
    this.bubblesCurrents.forEach(function(bubble) {
        if (bubble.x <= 0 || bubble.x >= this.world.width || bubble.y <= 0) {
            bubble.exists = false;
            bubble.visible = false;
        }
    }, this);
    
    //  update pufferfish positions
      this.pufferfish.forEach(function(pufferfish) {
        if (pufferfish.path) {
          pufferfish.pi++;
          if (pufferfish.pi >= pufferfish.path.length) {
              pufferfish.pi = 0;
          }
          pufferfish.x = pufferfish.path[pufferfish.pi].x;
          pufferfish.y = pufferfish.path[pufferfish.pi].y;
        }
      }, this);
    
    
    //  input
    if (this.input.activePointer.isDown) {

      if (this.scrolling) {  // camera scrolling

        this.camera.y -= this.input.activePointer.position.y - this.inputStartPosition;
        this.camVelY = this.inputStartPosition - this.input.activePointer.position.y;
        this.inputStartPosition = this.input.activePointer.position.y;

      } else if (this.selectedPart == 'wall' && this.currentWall != null) {

        var pointerX = Math.floor((this.input.activePointer.worldX) / this.tileSize.width);
        var pointerY = Math.floor((this.input.activePointer.worldY) / this.tileSize.height);
        if (pointerX < this.currentWall.start.x) {
          this.currentWall.x = pointerX * this.tileSize.width;
          this.currentWall.width = (this.currentWall.start.x - pointerX + 1) * this.tileSize.width;
        } else {
          this.currentWall.x = this.currentWall.start.x * this.tileSize.width;
          this.currentWall.width = (pointerX + 1 - this.currentWall.start.x) * this.tileSize.width;
        }
        if (pointerY < this.currentWall.start.y) {
          this.currentWall.y = pointerY * this.tileSize.height;
          this.currentWall.height = (this.currentWall.start.y - pointerY + 1) * this.tileSize.height;
        } else {
          this.currentWall.y = this.currentWall.start.y * this.tileSize.height;
          this.currentWall.height = (pointerY + 1 - this.currentWall.start.y) * this.tileSize.height;
        }

      } else if (this.selectedPart == 'current' && this.currentCurrent != null && !this.currentCurrent.force) {
        
        var pointerX = Math.floor((this.input.activePointer.worldX) / this.tileSize.width);
        var pointerY = Math.floor((this.input.activePointer.worldY) / this.tileSize.height);
        if (pointerX < this.currentCurrent.start.x) {
          this.currentCurrent.x = pointerX * this.tileSize.width;
          this.currentCurrent.width = (this.currentCurrent.start.x - pointerX + 1) * this.tileSize.width;
        } else {
          this.currentCurrent.x = this.currentCurrent.start.x * this.tileSize.width;
          this.currentCurrent.width = (pointerX + 1 - this.currentCurrent.start.x) * this.tileSize.width;
        }
        if (pointerY < this.currentCurrent.start.y) {
          this.currentCurrent.y = pointerY * this.tileSize.height;
          this.currentCurrent.height = (this.currentCurrent.start.y - pointerY + 1) * this.tileSize.height;
        } else {
          this.currentCurrent.y = this.currentCurrent.start.y * this.tileSize.height;
          this.currentCurrent.height = (pointerY + 1 - this.currentCurrent.start.y) * this.tileSize.height;
        }
      
      } else if (this.selectedPart == 'urchin' && this.currentUrchin != null) {
        
        var pointer = {x: this.input.activePointer.worldX, y: this.input.activePointer.worldY};
        
        if (this.input.activePointer.targetObject && this.input.activePointer.targetObject.sprite.parent == this.walls
            || this.input.activePointer.worldX <= 0 || this.input.activePointer.worldX >= this.world.width
            || this.input.activePointer.worldY <= 0 || this.input.activePointer.worldY >= this.world.height
            || this.input.activePointer.y >= this.camera.height - this.buildMenu.height) {
          this.currentUrchin.exists = false;
        } else {
          this.currentUrchin.exists = true;
          
          //  raycasting in four directions
          
          var closestIntersection = {distance: Number.POSITIVE_INFINITY};
          var angle = 0;
          var rayAngle;
          var correction = {x: 0, y: 0};
          var rayCorrection;
          for (var i = 0; i < 4; i++) {
            var ray = new Phaser.Line();
            var axis;
            switch(i) {
              default:
                ray.setTo(pointer.x, pointer.y, this.levelMap.worldSize.width * this.tileSize.width, pointer.y); // right
                rayAngle = 270;
                rayCorrection = {x: -this.tileSize.width * 2, y: this.tileSize.height};
                axis = 'horizontal';
                break;
              case 1:
                ray.setTo(pointer.x, pointer.y, pointer.x, this.camera.y + this.camera.height); // down
                rayAngle = 0;
                rayCorrection = {x: -this.tileSize.width, y: -this.tileSize.height * 2};
                axis = 'vertical';
                break;
              case 2:
                ray.setTo(pointer.x, pointer.y, 0, pointer.y); // left
                rayAngle = 90;
                rayCorrection = {x: this.tileSize.width * 2, y: -this.tileSize.height};
                axis = 'horizontal';
                break;
              case 3:
                ray.setTo(pointer.x, pointer.y, pointer.x, this.camera.y); // up
                rayAngle = 180;
                rayCorrection = {x: this.tileSize.width, y: this.tileSize.height * 2};
                axis = 'vertical';
                break;
            }
            var intersection = this.closestWallIntersection(ray, axis);
            if (intersection && intersection.distance < closestIntersection.distance) {
              closestIntersection = intersection;
              angle = rayAngle;
              correction = rayCorrection;
            }
          }
          if (closestIntersection) {
            this.currentUrchin.x = Math.round((closestIntersection.x + correction.x) / this.tileSize.width) * this.tileSize.width;
            this.currentUrchin.y = Math.round((closestIntersection.y + correction.y) / this.tileSize.height) * this.tileSize.height;
            this.currentUrchin.angle = angle;
            this.currentUrchin.wall = closestIntersection.wall;
            this.debugPoint = new Phaser.Point(closestIntersection.x, closestIntersection.y);
          }
        }
      }
    } else {  // camera smoothing
      this.camVelY = this.camVelY / this.camDrag;
      this.camera.y += this.camVelY | 0;
    }
    
    //  bind camera to world bounds
    if (this.camera.y < 0) { this.camera.y = 0; }
    if (this.camera.y > this.world.height + this.buildMenuHeight - this.camera.height) { this.camera.y = this.world.height + this.buildMenuHeight - this.camera.height; }
    
  },
  
  bubbleCollisionHandler: function(current, bubble) {
      if (current.force) {
        bubble.body.velocity.x -= current.force[0] / 2;
      }
  },
  
  resetBubbleToCurrent: function(bubble) {
      this.currents.forEach(function(current){
        if (current.force) {
          var bubble = bubble || this.bubblesCurrents.getFirstExists(false);
          if (bubble) {
              var x;
              if (current.force[0] > 0) {
                  //  positive X means going left, so the source of the bubbles is to the right
                  x = current.x + current.width - 10;
              } else {
                  //  negative X means going right, so bubbles come from the left
                  x = current.x;
              }
              bubble.reset(x, this.rnd.between(current.y, current.y + current.height));
              var scale = this.rnd.between(20, current.force[0] * 3) / 100;
              bubble.scale.x = scale;
              bubble.scale.y = scale;
              bubble.body.velocity.y = -5 * (1/scale);
              bubble.body.velocity.x = -current.force[0] * 20;
              var a = current.y / this.world.height * 255;
              // bubble.tint = this.rgbToHex(a,a,a);
              // bubble.tint = 0x000000;
          }
        }
      }, this);
  },
  
  resetBubbleToBottom: function(bubble) {
      //  bubbles starting at bottom of level
      var bubble = this.bubbles.getFirstExists(false);
      if (bubble) {
          bubble.reset(this.rnd.between(0, this.world.width), this.world.height);
          var scale = this.rnd.between(3, 10) / 10;
          bubble.scale.x = scale;
          bubble.scale.y = scale;
          bubble.body.velocity.y = -100 * (1/scale);
          bubble.body.velocity.x = this.rnd.between(-16, 16);
      }
  },
  
  closestWallIntersection: function (ray, axis) {
          
    var closestIntersection = {distance: Number.POSITIVE_INFINITY};

    // For each of the walls...
    this.walls.forEach(function(wall) {
        var lines;
        // Create an array of lines that represent the four edges of each wall
        if (axis == 'horizontal') { // if ray is horizontal, we only need to check vertical lines for intersections (because there are not diagonals)
          lines = [
            new Phaser.Line(wall.x + wall.width, wall.y, wall.x + wall.width, wall.y + wall.height), // right
            new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height) // left
          ];
        } else if (axis == 'vertical') { // same logic applies to vertical ray
          lines = [
            new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y), // top
            new Phaser.Line(wall.x, wall.y + wall.height, wall.x + wall.width, wall.y + wall.height) // bottom
          ];
        } else {
          lines = [
            new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y), // top
            new Phaser.Line(wall.x + wall.width, wall.y, wall.x + wall.width, wall.y + wall.height), // right
            new Phaser.Line(wall.x, wall.y + wall.height, wall.x + wall.width, wall.y + wall.height), // bottom
            new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height) // left
          ];
        }

        // Test each of the edges in this wall against the ray.
        // If the ray intersects any of the edges then the wall must be in the way.
        for(var i = 0; i < lines.length; i++) {
            var intersect = Phaser.Line.intersects(ray, lines[i]);
            if (intersect) {
                // Find the closest intersection
                var distance = Phaser.Math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
                if (distance < closestIntersection.distance) {
                    closestIntersection = intersect;
                    closestIntersection.distance = distance;
                    closestIntersection.wall = wall;
                }
            }
        }
    }, this);
    return closestIntersection;
  },

  selectWall: function () {

    if (this.selectedPart == 'wall') {
      this.selectedPart = null;
      this.resetButtons();
    } else {
      this.selectedPart = 'wall';
      this.resetButtons();
      this.wallButton.turnOn(this.wallButtonBitmap);
      this.grid.visible = true;
    }

  },

  selectUrchin: function () {

    if (this.selectedPart == 'urchin') {
      this.selectedPart = null;
      this.resetButtons();
    } else {
      this.selectedPart = 'urchin';
      this.resetButtons();
      this.urchinButton.turnOn(this.urchinButtonBitmap);
      this.grid.visible = true;
    }

  },
  
  selectCurrent: function () {

    if (this.selectedPart == 'current') {
      this.selectedPart = null;
      this.resetButtons();
    } else {
      this.selectedPart = 'current';
      this.resetButtons();
      this.currentButton.turnOn(this.currentButtonBitmap);
      this.grid.visible = true;
    }

  },

  selectPufferfish: function () {

    if (this.selectedPart == 'pufferfish') {
      this.selectedPart = null;
      this.resetButtons();
    } else {
      this.selectedPart = 'pufferfish';
      this.resetButtons();
      this.pufferfishButton.turnOn(this.pufferfishButtonBitmap);
      this.grid.visible = true;
    }

  },

  selectDestroy: function () {

    if (this.selectedPart == 'destroy') {
      this.selectedPart = null;
      this.resetButtons();
    } else {
      this.selectedPart = 'destroy';
      this.resetButtons();
      this.destroyButton.turnOn(this.destroyButtonBitmap);
      this.drawWallOutlines();
      this.drawCurrentOutlines();
      this.pufferfish.setAll('tint', 0xFF0000);
      this.grid.visible = true;
    }

  },

  resetButtons: function () {

    this.wallButton.turnOff(this.wallButtonBitmap);
    this.destroyButton.turnOff(this.destroyButtonBitmap);
    this.urchinButton.turnOff(this.urchinButtonBitmap);
    this.currentButton.turnOff(this.currentButtonBitmap);
    this.pufferfishButton.turnOff(this.pufferfishButtonBitmap);

    this.wallOutlines.clear();
    this.currentOutlines.clear();
    
    this.pufferfish.setAll('tint', 0xFFFFFF);
    if (this.currentPufferfish) {
      this.currentPufferfish.destroy();
      this.drawPufferfishPaths();
    }
    this.currentPufferfish = null;
    this.pufferfishDoneButton.visible = false;
    
    if (this.currentCurrent) {
      this.currentCurrent.destroy();
    }
    this.currentCurrent = null;
    this.currentButtons.setAll('visible', false);
    
    this.grid.visible = false;

  },

  drawWallOutlines: function () {

    this.wallOutlines.clear();
    this.wallOutlines.lineStyle(2, 0xFF0000, 1);

    this.walls.forEach(function(wall) {
      if (!wall.outerWall) {
        this.wallOutlines.moveTo(wall.x, wall.y);
        this.wallOutlines.lineTo(wall.x + wall.width, wall.y);
        this.wallOutlines.lineTo(wall.x + wall.width, wall.y + wall.height);
        this.wallOutlines.lineTo(wall.x, wall.y + wall.height);
        this.wallOutlines.lineTo(wall.x, wall.y);
      }
    }, this);

  },
  
  drawCurrentOutlines: function () {
    
    this.currentOutlines.clear();
    this.currentOutlines.lineStyle(2, 0xFFFFFF, 1);
    
    this.currents.forEach(function(current) {
      this.currentOutlines.moveTo(current.x, current.y);
      this.currentOutlines.lineTo(current.x + current.width, current.y);
      this.currentOutlines.lineTo(current.x + current.width, current.y + current.height);
      this.currentOutlines.lineTo(current.x, current.y + current.height);
      this.currentOutlines.lineTo(current.x, current.y);
    }, this);
    
  },
  
  drawPufferfishPaths: function() {
    
    this.pufferfishPaths.clear();
    this.pufferfishPaths.lineStyle(4, 0xFF9000);
    this.pufferfish.forEach(function(pufferfish) {
      // draw path
      if (pufferfish.path) {
        this.pufferfishPaths.moveTo(pufferfish.path[0].x, pufferfish.path[0].y);
        for (var i = 1; i < pufferfish.path.length; i++) {
          this.pufferfishPaths.lineTo(pufferfish.path[i].x, pufferfish.path[i].y);
        }
      }
      // draw nodes (somehow causes bug where only the first pufferfish will have its path drawn)
      // for (var i = 0; i < pufferfish.nodes.x.length; i++) {
      //   this.pufferfishPaths.lineStyle(0);
      //   this.pufferfishPaths.beginFill(0xFF9000, 1);
      //   this.pufferfishPaths.drawCircle(pufferfish.nodes.x[i] * this.tileSize.width, pufferfish.nodes.y[i] * this.tileSize.height, 32);
      //   this.pufferfishPaths.endFill();
      // }
    }, this);
    
  },

  onInputDown: function (pointer) {

    if (pointer.position.y < this.camera.height - this.buildMenuHeight) { // make sure click is inside level

      switch(this.selectedPart) {
        default:
          this.scrolling = true;
          this.inputStartPosition = pointer.position.y;
          break;
        case 'wall':
          if ((!pointer.targetObject || pointer.targetObject.sprite.parent == this.currents) && !this.currentWall) { // make sure click is in empty space
            var x = Math.floor((pointer.worldX - this.tileSize.width * 0) / this.tileSize.width);
            var y = Math.floor((pointer.worldY - this.tileSize.height * 0) / this.tileSize.height);
            if (x < this.levelMap.worldSize.width - 1 && x > 0 && y < this.levelMap.worldSize.height && y > 0) { // make sure wall is within world bounds
              var bitmap = this.add.bitmapData(this.tileSize.width, this.tileSize.height); // start wall placement
              bitmap.fill(0, 0, 0);
              this.currentWall = this.walls.create(x * this.tileSize.width, y * this.tileSize.height, bitmap);
              this.currentWall.inputEnabled = true; // enable input to allow destroying
              this.currentWall.start = {x: x, y: y};
              this.currentWall.urchins = [];
            }
          }
          break;
        case 'urchin':
          this.currentUrchin = this.add.sprite(this.input.activePointer.worldX, this.input.activePointer.worldY, 'urchin');
          this.currentUrchin.inputEnabled = true;
          this.world.bringToTop(this.buildMenu); // to maintain correct draw order and keep menu on top
          break;
        case 'current':
          if (!pointer.targetObject && !this.currentCurrent) { // make sure click is in empty space & current has not been completed yet
            var x = Math.floor((pointer.worldX - this.tileSize.width * 0) / this.tileSize.width);
            var y = Math.floor((pointer.worldY - this.tileSize.height * 0) / this.tileSize.height);
            if (x < this.levelMap.worldSize.width - 1 && x > 0 && y < this.levelMap.worldSize.height && y > 0) { // make sure wall is within world bounds
              var bitmap = this.add.bitmapData(this.tileSize.width, this.tileSize.height); // start current placement
              bitmap.fill(0, 0, 255, 0.7);
              this.currentCurrent = this.currents.create(x * this.tileSize.width, y * this.tileSize.height, bitmap);
              this.currentCurrent.inputEnabled = true;
              this.currentCurrent.start = {x: x, y: y};
            }
          }
          break;
        case 'pufferfish':
          if (!pointer.targetObject || pointer.targetObject.sprite.parent == this.currents) {// make sure click is in empty space
            if (!this.currentPufferfish) { // if placing new pufferfish
              var x = Math.round(pointer.worldX / this.tileSize.width);
              var y = Math.round(pointer.worldY / this.tileSize.height);
              this.currentPufferfish = this.pufferfish.create(x * this.tileSize.width, y * this.tileSize.height, 'pufferfish');
              this.currentPufferfish.anchor.setTo(0.5, 0.5);
              this.currentPufferfish.nodes = {x: [x], y: [y]};
              this.currentPufferfish.speed = 150;
              // this.currentPufferfish.path = this.plotPath(this.currentPufferfish.nodes, this.currentPufferfish.speed, true);
              this.currentPufferfish.pi = 0;
              this.currentPufferfish.inputEnabled = true;
              this.drawPufferfishPaths();
              this.pufferfishDoneButton.visible = true; // show to press when pufferfish path is done
              console.log(this.pufferfishDoneButton.y);
            } else { // if adding a node to a pufferfish
              var x = Math.round(pointer.worldX / this.tileSize.width);
              var y = Math.round(pointer.worldY / this.tileSize.height);
              this.currentPufferfish.nodes.x.push(x);
              this.currentPufferfish.nodes.y.push(y);
              this.currentPufferfish.path = this.plotPath(this.currentPufferfish.nodes, this.currentPufferfish.speed, true);
              this.drawPufferfishPaths();
              this.pufferfish.setAll('pi', 0);
            }
          }
          break;
        case 'destroy':
          if (pointer.targetObject) {
            if (pointer.targetObject.sprite.parent == this.walls && !pointer.targetObject.sprite.outerWall) {
              for (var i = 0; i < pointer.targetObject.sprite.urchins.length; i++) {
                pointer.targetObject.sprite.urchins[i].destroy();
              }
              pointer.targetObject.sprite.destroy();
            } else if (pointer.targetObject.sprite.key == 'urchin') {
              var urchin = pointer.targetObject.sprite;
              var index = urchin.wall.urchins.indexOf(urchin);
              if (index >= 0) {
                urchin.wall.urchins.splice(index, 1);
              }
              urchin.destroy();
            } else if (pointer.targetObject.sprite.parent == this.currents) {
              pointer.targetObject.sprite.destroy();
              this.currents.removeBetween(0,15,true);
            } else if (pointer.targetObject.sprite.parent == this.pufferfish) {
              pointer.targetObject.sprite.destroy();
              this.drawPufferfishPaths();
            }
          }
          this.drawWallOutlines();
          this.drawCurrentOutlines();
          break;
      }
    }

  },

  onInputUp: function (pointer) {

    this.scrolling = false;
    this.inputStartPosition = null;
    this.currentWall = null;
    if (this.currentUrchin) {
      if (!this.currentUrchin.exists) {
        this.currentUrchin.destroy();
      } else {
//        this.currentUrchin.x -= this.currentUrchin.wall.x;
//        this.currentUrchin.y -= this.currentUrchin.wall.y;
        this.currentUrchin.wall.urchins.push(this.currentUrchin);
      }
    } else if (this.currentCurrent) {
      this.currentButtons.setAll('visible', true);
      this.currentButtons.x = this.currentCurrent.x + this.currentCurrent.width / 2;
      this.currentButtons.y = this.currentCurrent.y + this.currentCurrent.height / 2;
      this.currentCurrent.force = [0,0];
    }
    this.currentUrchin = null;

  },
  
  currentLeft: function () {
    this.currentCurrent.force = [20,0];
    this.currentCurrent = null;
    this.currentButtons.setAll('visible', false);
    for (var i=0; i<16; i++) {
        var bubble = this.bubblesCurrents.create(this.world.width/2, this.world.height - 64, this.bubbleBitmap);
        bubble.exists = false;
        bubble.visible = false;
    }
  },
  
  currentRight: function() {
    this.currentCurrent.force = [-20,0];
    this.currentCurrent = null;
    this.currentButtons.setAll('visible', false);
    for (var i=0; i<16; i++) {
        var bubble = this.bubblesCurrents.create(this.world.width/2, this.world.height - 64, this.bubbleBitmap);
        bubble.exists = false;
        bubble.visible = false;
    }
  },

  openMenu: function() {

    //

  },

  playLevel: function() {
    
    if (!this.game.mute) {
      this.music.stop();
    }
    this.game.currentLevel = null;
    var levelJSON = this.buildLevelJSON();
    console.log(levelJSON);
    this.game.state.start('Game', true, false, null, levelJSON);

  },

  mainMenu: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
    if (!this.game.mute) {
      this.music.stop();
    }

    //  Then let's go back to the main menu.
    this.game.state.start('MainMenu');

  },
  
  backButtonPressed: function() {
        if (!this.game.muted) {
            this.music.stop();
        }
        this.mainMenu();
    },

  buildLevelJSON: function () {

    var walls = [];
    this.walls.forEach(function(wall) {
      var urchins = [];
      for (var i = 0; i < wall.urchins.length; i++) {
        var urchin = wall.urchins[i];
        var angle;
        var x;
        var y;
        switch (urchin.angle) {
          default:
            angle = 'up';
            x = urchin.x / this.tileSize.width + 1;
            y = urchin.y / this.tileSize.height + 1;
            break;
          case 90:
            angle = 'right';
            x = urchin.x / this.tileSize.width - 1;
            y = urchin.y / this.tileSize.height + 1;
            break;
          case -180:
            angle = 'down';
            x = urchin.x / this.tileSize.width - 1;
            y = urchin.y / this.tileSize.height - 1;
            break;
          case -90:
            angle = 'left';
            x = urchin.x / this.tileSize.width + 1;
            y = urchin.y / this.tileSize.height - 1;
            break;
        }
        urchins.push({ x: x, y: y, angle: angle });
      }
      walls.push({
        x: wall.x / this.tileSize.width,
        y: wall.y / this.tileSize.height,
        width: wall.width / this.tileSize.width,
        height: wall.height / this.tileSize.height,
        urchins: urchins
      });
    }, this);
    var currents = [];
    this.currents.forEach(function(current) {
      currents.push({
        x: current.x / this.tileSize.width,
        y: current.y / this.tileSize.height,
        width: current.width / this.tileSize.width,
        height: current.height / this.tileSize.height,
        force: current.force
      });
    }, this);
    var pufferfishes = [];
    this.pufferfish.forEach(function(pufferfish) {
      pufferfishes.push({
        x: pufferfish.nodes.x,
        y: pufferfish.nodes.y,
        speed: pufferfish.speed
      });
    }, this);
    var levelMap = this.levelMap;
    levelMap.walls = walls;
    levelMap.currents = currents;
    levelMap.pufferfish = pufferfishes;
    return JSON.stringify(levelMap);

  },

  plotPath: function(nodes, speed, backAndForth) {
    //  if the path needs to be played back and forth, simply mirror and concatenate the nodes array
    if (backAndForth) {
      var reverseNodes = {"x": [], "y": []};
      for (var i = nodes.x.length-2; i >= 0; i--) {
        reverseNodes.x.push(nodes.x[i]);
        reverseNodes.y.push(nodes.y[i]);
      }
      var pathNodes = {"x": [], "y": []};
      pathNodes.x = nodes.x.concat(reverseNodes.x);
      pathNodes.y = nodes.y.concat(reverseNodes.y);
    }
    var distance = 0;
    for (var i = 0; i < pathNodes.x.length-1; i++) {
      distance += Phaser.Math.distance(pathNodes.x[i] * this.tileSize.width, pathNodes.y[i] * this.tileSize.height, pathNodes.x[i+1] * this.tileSize.width, pathNodes.y[i+1] * this.tileSize.height);
    }
    if (!distance || distance == 0) {
      // console.log("CAUTION: pufferfish path distance is: "+distance);
      // console.log(nodes);
      return;
    }
    var x = 1 / distance * speed / 60;
    var path = [];
    for (var i = 0; i <= 1; i += x) {
      var px = this.math.catmullRomInterpolation(pathNodes.x, i) * this.tileSize.width;
      var py = this.math.catmullRomInterpolation(pathNodes.y, i) * this.tileSize.height;
      path.push({"x": px, "y": py});
    }
    return path;
  },
  
  pointOverlapsWall: function(point, walls) {
    walls.forEach(function(wall) {
      if (point.x <= wall.x + wall.width && point.x >= wall.x && point.y <= wall.y + wall.height && point.y >= wall.y) {
        return true;
      }
    }, this);
    
    return false;
    
  },

  render: function() {

    this.game.debug.text(this.time.fps || '--', 2, 14, "#00ff00");
    this.game.debug.text(Math.round(this.input.activePointer.worldX / 32) + " " + Math.round(this.input.activePointer.worldY / 32) || '--', 2, 28, "#FFF");
//    this.game.debug.geom(this.debugPoint, "#FF0000");
    
  },

};
