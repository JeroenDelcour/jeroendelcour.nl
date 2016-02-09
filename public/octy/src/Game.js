OctyGame.Game = function (game) {

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

OctyGame.Game.prototype = {

    init: function(level, customJSON) {

        this.level = level;
        this.customJSON = customJSON;

    },

    preload: function() {

        this.time.advancedTiming = true;
        
        //  load level map from JSON
        if (this.level) {
          this.load.json('levelMap', 'assets/levels/'+this.level+'.json');
        }

    },

    create: function () {

        this.gameOver = false;

        //  add background
        //  (this needs to be done before loading the tilemap because of layering)
        this.background = this.add.sprite(0, 0, 'background');
        
        this.music = this.add.audio('YourUnderwaterWorld');
        if (!this.game.muted) {
            this.music.play('', 0, 1, true);
        }
        
        if (this.level) {
            this.levelMap = this.game.cache.getJSON('levelMap');
        } else if (this.customJSON) {
            this.levelMap = JSON.parse(this.customJSON);
        }
        
        var tileSize = this.levelMap.tileSize;

        //  resize world according to level maps
        this.world.resize(this.levelMap.worldSize.width * tileSize.width, (this.levelMap.worldSize.height + 1) * tileSize.height);
        this.world.setBounds(-this.game.width / 2 + this.world.width / 2, 0, this.world.width, this.world.height);
        
        //  center game world
        // this.camera.bounds = null;
        this.camera.x = -this.game.width / 2 + this.world.width / 2;

        //  stretch background to fill the game world
        this.background.height = this.world.height;
        this.background.width = this.world.width;
        //  animate background
        this.add.tween(this.background).to({height: this.world.height + 600}, 3000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();

        //	Enable p2 physics
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.gravity.y = 100;
        this.physics.p2.restitution = 0.2;

        //  spawn currents
        //  one group with arcade physics for bubble, another with P2 physics for Octy
        this.currentsArcade = this.add.group();
        this.currentsArcade.enableBody = true;
        this.currentsArcade.physicsBodyType = Phaser.Physics.ARCADE;
        this.currentsP2 = this.add.group();
        this.currentsP2.enableBody = true;
        this.currentsP2.physicsBodyType = Phaser.Physics.P2JS;

        for (i = 0; i < this.levelMap.currents.length; i++) {
            var current = this.levelMap.currents[i];
            var sprite = this.add.sprite(current.x * tileSize.width, current.y * tileSize.height);
            sprite.anchor.setTo(0.5,0.5);
            sprite.x += current.width * tileSize.width * 0.5;
            sprite.y += current.height * tileSize.height * 0.5;
            sprite.width = current.width * tileSize.width;
            sprite.height = current.height * tileSize.height;
            sprite.force = current.force;
            this.currentsArcade.add(sprite);
            
            var spriteP2 = this.add.sprite(current.x * tileSize.width, current.y * tileSize.height);
            spriteP2.anchor.setTo(0.5,0.5);
            spriteP2.x += current.width * tileSize.width * 0.5;
            spriteP2.y += current.height * tileSize.height * 0.5;
            spriteP2.width = current.width * tileSize.width;
            spriteP2.height = current.height * tileSize.height;
            spriteP2.force = current.force;
            this.currentsP2.add(spriteP2);
            spriteP2.body.data.shapes[0].sensor = true;
            spriteP2.body.kinematic = true;
        }
        this.currentsCollisionGroup = this.physics.p2.createCollisionGroup();
        this.currentsP2.callAll('body.setCollisionGroup', 'body', this.currentsCollisionGroup);
        
        //  bubbles for bottom level spawner
        var bubblePoolSize = 16;
        this.bubbles = this.add.group();
        this.bubbles.enableBody = true;
        this.bubbles.physicsBodyType = Phaser.Physics.ARCADE;
        var bubbleBitmap = this.add.bitmapData(64, 64);
        bubbleBitmap.ctx.beginPath();
        bubbleBitmap.ctx.arc(32, 32, 28, 0, 2 * Math.PI, false);
        bubbleBitmap.ctx.lineWidth = 3;
        bubbleBitmap.ctx.strokeStyle = "#ffffff";
        bubbleBitmap.ctx.stroke();
        for (var i=0; i<bubblePoolSize; i++) {
            var bubble = this.bubbles.create(this.world.width/2, this.world.height - 64, bubbleBitmap);
            bubble.exists = false;
            bubble.visible = false;
            // bubble.checkWorldBounds = true;
            // bubble.events.onOutOfBounds.add(this.resetBubble, this);
            bubble.body.drag.x = 200;
        }
        //  bubbles for currents
        var bubblePoolSize = 16 * this.currentsArcade.length;
        this.bubblesCurrents = this.add.group();
        this.bubblesCurrents.enableBody = true;
        this.bubblesCurrents.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i=0; i<bubblePoolSize; i++) {
            var bubble = this.bubblesCurrents.create(this.world.width/2, this.world.height - 64, bubbleBitmap);
            bubble.exists = false;
            bubble.visible = false;
        }
        var timer = this.time.create(false);
        timer.loop(600, this.resetBubbleToBottom, this);
        timer.loop(100, this.resetBubbleToCurrent, this);
        timer.start();

        //  create empty collision group for things that shouldn't collide but need bodies
        var emptyCollisionGroup = this.physics.p2.createCollisionGroup();

        //  spawn pufferfish
        this.pufferfish = this.add.group();
        this.pufferfish.enableBody = true;
        this.pufferfish.physicsBodyType = Phaser.Physics.P2JS;
        this.pufferfishCollisionGroup = this.physics.p2.createCollisionGroup();
        for (i = 0; i < this.levelMap.pufferfish.length; i++) {
            var nodes = this.levelMap.pufferfish[i];
            var pufferfish = this.pufferfish.create(nodes.x[0] * tileSize.width, nodes.y[0] * tileSize.height, 'pufferfish');
            pufferfish.path = this.plotPath(nodes, tileSize, nodes.speed, true);
            pufferfish.pi = 0;
            pufferfish.body.setCircle(34, -2, -2);
            pufferfish.body.kinematic = true;
            pufferfish.body.setCollisionGroup(this.pufferfishCollisionGroup);
        }
        
        //  spawn walls
        this.walls = this.add.group();
        this.wallsCollisionGroup = this.physics.p2.createCollisionGroup();
        this.urchinCollisionGroup = this.physics.p2.createCollisionGroup();
        this.OctyCollisionGroup = this.physics.p2.createCollisionGroup();
        
        var wallOffset = 13;
        for (var i = 0; i < this.levelMap.walls.length; i++) {
            var bitmap = this.add.bitmapData(this.levelMap.walls[i].width * tileSize.width + wallOffset * 2, this.levelMap.walls[i].height * tileSize.height + wallOffset * 2);
            // bitmap.fill(0, 0, 1, 1); 
            var w = this.levelMap.walls[i].width * tileSize.width;
            var h = this.levelMap.walls[i].height * tileSize.height;
            bitmap.ctx.beginPath();
            bitmap.ctx.moveTo(this.rnd.between(0, wallOffset), this.rnd.between(0, wallOffset));
            var widthSteps = this.levelMap.walls[i].width * 1;
            var heightSteps = this.levelMap.walls[i].height * 1;
            for (var j = 1; j < heightSteps; j++) {
                bitmap.ctx.lineTo(this.rnd.between(0, wallOffset), wallOffset + h * j / heightSteps);
            }
            for (var j = 0; j < widthSteps; j++) {
                bitmap.ctx.lineTo(wallOffset + w * j / widthSteps, wallOffset + h + this.rnd.between(0, wallOffset));
            }
            for (var j = heightSteps; j > 0; j--) {
                bitmap.ctx.lineTo(wallOffset + w + this.rnd.between(0, wallOffset), wallOffset + h * j / heightSteps);
            }
            for (var j = widthSteps; j > 0; j--) {
                bitmap.ctx.lineTo(wallOffset + w * j / widthSteps, this.rnd.between(0, wallOffset));
            }
            bitmap.ctx.closePath();
            bitmap.ctx.lineWidth = 5;
            bitmap.ctx.fillStyle='#000';
            bitmap.ctx.fill();
            bitmap.ctx.strokeStyle='black';
            bitmap.ctx.stroke();
            var wall = this.walls.create(this.levelMap.walls[i].x * tileSize.width + this.levelMap.walls[i].width * tileSize.width * 0.5, this.levelMap.walls[i].y * tileSize.height + this.levelMap.walls[i].height * tileSize.height * 0.5, bitmap);
            //  spawn attached urchins
            wall.urchins = [];
            if (this.levelMap.walls[i].urchins) {
                for (var j = 0; j < this.levelMap.walls[i].urchins.length; j++) {
                    var urchin = this.add.sprite(this.levelMap.walls[i].urchins[j].x * tileSize.width, this.levelMap.walls[i].urchins[j].y * tileSize.height, 'urchin');
                    urchin.wall = this.levelMap.walls[i];
                    this.physics.p2.enable(urchin);
                    urchin.body.kinematic = true;
                    urchin.body.collides(this.OctyCollisionGroup);
                    //  give 'em round bodies with the appropriate offset
                    urchin.bodyOffset = {x: 0, y: 24};
                    urchin.body.setCircle(28, urchin.bodyOffset.x, urchin.bodyOffset.y);
                    urchin.body.setCollisionGroup(this.urchinCollisionGroup);
//                    urchin.body.debug = true;
                    if (this.levelMap.walls[i].urchins[j].angle == "up"){
                        urchin.body.angle = 0;
                    } else if (this.levelMap.walls[i].urchins[j].angle == "right"){
                        urchin.body.angle = 90;
                    } else if (this.levelMap.walls[i].urchins[j].angle == "down"){
                        urchin.body.angle = 180;
                    } else if (this.levelMap.walls[i].urchins[j].angle == "left"){
                        urchin.body.angle = 270;
                    }
                    wall.urchins.push(urchin);
                }
                // this.world.bringToTop(wall);
            }
        }

        this.walls.forEach(function(wall){
            this.physics.p2.enable(wall);
            wall.body.static = true;
            wall.body.setRectangle(wall.width - wallOffset * 2, wall.height - wallOffset * 2);
            wall.body.setCollisionGroup(this.wallsCollisionGroup);
        }, this);
        
        //  text
        if (this.levelMap.text) {
            for (var i = 0; i < this.levelMap.text.length; i++) {
                var textMap = this.levelMap.text[i];
                var text = this.add.bitmapText(textMap.x * tileSize.width, textMap.y * tileSize.height, 'komikaX-white', textMap.text, 28);
                if (textMap.angle) { text.angle = textMap.angle; }
                text.align = 'center';
            }
        }


        //  create arm for MrsOcty
        //  (have to do it here for correct draw order)
        var MrsOctyArm = this.add.tileSprite(0, 0, 1, 12, 'arm');

        //  create group of Octy's arms
        this.arms = this.add.group();
        for (i = 0; i < 8; i++) {
            var arm = this.add.tileSprite(0, 0, 1, 12, 'arm');
            this.arms.add(arm);
        }
        this.arms.setAll('anchor.x', 0);
        this.arms.setAll('anchor.y', 0.5);
        this.arms.setAll('exists', false);

        //  create group of paws
        this.paws = this.add.group();
        //  give 'em bodies so we can attach springs to them later
        this.paws.enableBody = true;
        this.paws.physicsBodyType = Phaser.Physics.P2JS;
        //  octopusses (octopusi?) have 8 arms, right?
        this.paws.createMultiple(8, 'paw');
        //  physics should not affect them
        this.paws.setAll('body.kinematic', true);
        //  give them an empty collision group so they don't collide with anything
        this.paws.callAll('body.setCollisionGroup', 'body', emptyCollisionGroup);
        //  keep track of whether they're attached or not
        this.paws.setAll('attached', false);
        this.paws.setAll('retracting', false);
        this.paws.setAll('alive', false);
        this.paws.setAll('anchor.x', 0.5);
        this.paws.setAll('anchor.y', 0.5);

        //  spawn Octy
        this.Octy = this.add.sprite(this.levelMap.OctySpawn.x * this.levelMap.tileSize.width, this.levelMap.OctySpawn.y * this.levelMap.tileSize.height, 'Octy', 'Octy');
        this.Octy.anchor.setTo(0.5, 0.5);
        this.physics.p2.enable(this.Octy);
        this.Octy.body.setCircle(32);
        this.Octy.body.angularDamping = 0.06;
        this.Octy.body.damping = 0.6;
        this.Octy.body.setCollisionGroup(this.OctyCollisionGroup);

        //  Octy's belly in local co-ordinates
        this.Octy.belly = new PIXI.Point(0, 16);
        //  initial amount of lives Octy has
        this.Octy.lives = 5;
        //  boolean for if he's currently hittable
        this.Octy.hittable = true;
        //  force acting on Octy from currents
        this.Octy.currentForce = [0,0];

        //  make camera follow Octy
       // this.camera.follow(this.Octy);

        //  create life indicator (spawn mini-Octies!)
        this.lives = this.add.group();
        for (i = 0; i < this.Octy.lives; i++) {
            var miniOcty = this.lives.create(16, this.world.centerY, 'miniOcty');
            //  place them above each other, centered on the Y axis as a group
            miniOcty.y = 0 + miniOcty.height * i;
            miniOcty.anchor.setTo(0.5, 0.5);
        }

        //  spawn Mrs. Octy
        this.MrsOcty = this.add.sprite(this.levelMap.MrsOctySpawn.x * this.levelMap.tileSize.width, this.levelMap.MrsOctySpawn.y * this.levelMap.tileSize.height, 'MrsOcty', 'MrsOcty');
        this.physics.p2.enable(this.MrsOcty, true);
        this.MrsOcty.body.setCircle(32);
        this.MrsOcty.body.friction = 0;
        this.MrsOcty.body.debug = false;
        this.MrsOctyCollisionGroup = this.physics.p2.createCollisionGroup();
        this.MrsOcty.body.setCollisionGroup(this.MrsOctyCollisionGroup);
        this.MrsOcty.arm = MrsOctyArm;
        this.MrsOcty.arm.anchor.x = 0;
        this.MrsOcty.arm.anchor.y = 0;
        this.MrsOcty.arm.exists = false;
        this.MrsOcty.arm.attached = false;

        //  calculate game screen diagonal
        //  for max paw extension range
        this.screenDiagonal = Math.sqrt(this.game.width * this.game.width + this.game.height * this.game.height);

        //  set collisions
        this.Octy.body.collides([this.wallsCollisionGroup, this.urchinCollisionGroup, this.pufferfishCollisionGroup, this.MrsOctyCollisionGroup, this.currentsCollisionGroup]);
        // this.Octy.body.collides([this.wallsCollisionGroup, this.urchinCollisionGroup, this.pufferfishCollisionGroup, this.MrsOctyCollisionGroup]);
        this.pufferfish.callAll('body.collides', 'body', this.OctyCollisionGroup);
        this.MrsOcty.body.collides([this.wallsCollisionGroup, this.OctyCollisionGroup]);
        this.walls.callAll('body.collides', 'body', [this.OctyCollisionGroup, this.MrsOctyCollisionGroup]);
        this.currentsP2.callAll('body.collides', 'body', this.OctyCollisionGroup);

        //  handle collisions between Octy and urchins, pufferfish, and currents
        this.Octy.body.onBeginContact.add(this.OctyHitSomething, this);
        this.Octy.body.onEndContact.add(this.OctyContactEnd, this);

        this.soundfx = {
            shoot: this.add.audio('shoot'),
            suction: this.add.audio('suction'),
            tentacle: this.add.audio('tentacle'),
            ow1: this.add.audio('ow1'),
            ow2: this.add.audio('ow2'),
            hit3: this.add.audio('hit3'),
            comeHere: this.add.audio('comeHere'),
            youDidIt: this.add.audio('youDidIt')
        }

        this.comeHereDone = false;

        //  enable click/touch input
        this.input.onDown.add(this.click, this);
        //  enable back button input
        var _this = this;
        document.addEventListener("keypress", function(event){
            if (event.charCode == 98) { // 'B' key
                _this.backButtonPressed();
            } else if (event.charCode == 108) { // 'L' key
                // show end menu for debugging purposes
                _this.endGame(false); // died
            } else if (event.charCode == 111) { // 'O' key
                _this.endGame(true); // won
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

        this.startTime = this.time.totalElapsedSeconds();
    },

    update: function () {
        
        //  camera follows Octy
        this.camera.y = this.Octy.y - this.camera.height / 2;
        //  bind camera to world bounds
        if (this.camera.y < 0) { this.camera.y = 0; }
        if (this.camera.y > this.world.height - this.camera.height) { this.camera.y = this.world.height - this.camera.height; }
        
        if (!this.gameOver) {
            if (this.Octy.y < this.levelMap.tileSize.height * 4) {
                this.endGame(true);
            } else if (!this.comeHereDone && this.Octy.y < 14 * 32) {
                this.comeHereDone = true;
                this.MrsOcty.body.velocity.y = -80;
                if (!this.game.muted) {
                    this.soundfx.comeHere.play('', 0, 0.8);
                }
            }
        }

        this.Octy.body.applyForce(this.Octy.currentForce, this.Octy.x, this.Octy.y);

        //  move life indicator to current camera position
        this.lives.y += (this.camera.y + this.camera.height / 2 - this.lives.y - this.lives.height / 2) * 0.1;

        //  adjust arms
        this.adjustArms();

        //  update pufferfish positions
        this.pufferfish.forEach(function(pufferfish) {
            pufferfish.pi++;
            if (pufferfish.pi >= pufferfish.path.length) {
                pufferfish.pi = 0;
            }
            pufferfish.body.x = pufferfish.path[pufferfish.pi].x;
            pufferfish.body.y = pufferfish.path[pufferfish.pi].y;
        }, this);
        
        //  bubbles react to currents
        this.physics.arcade.overlap(this.currentsArcade, this.bubbles, this.bubbleCollisionHandler, null, this);
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
        
        //  bubbles change color from white black as they ascent to stay easily visible
        // this.bubbles.forEach(function(bubble){
        //     var a = bubble.body.y / this.world.height * 255;
        //     bubble.tint = this.rgbToHex(a,a,a);
        // }, this);
        // if (this.bubbles.getFirstExists()) {
        //     // console.log(this.bubbles.getFirstExists().tint);
        //     // console.log(parseInt(this.rgbToHex(255,255,255),16));
        // }
        
        //  game win animation
        if (this.gameOver && this.MrsOcty.arm.exists) {

            this.MrsOcty.arm.x = this.MrsOcty.x;
            this.MrsOcty.arm.y = this.MrsOcty.y;
            this.MrsOcty.arm.angle = Phaser.Math.wrapAngle(Phaser.Math.radToDeg(Phaser.Math.angleBetween(this.MrsOcty.arm.x, this.MrsOcty.arm.y, this.Octy.x, this.Octy.y)));

            if (this.MrsOcty.arm.attached) {
                this.MrsOcty.arm.width = Phaser.Math.distance(this.MrsOcty.x, this.MrsOcty.y, this.Octy.x, this.Octy.y);
                this.accelerateToObject(this.Octy, this.MrsOcty, 1000);
            } else {
                this.MrsOcty.arm.width += 20;
                if (this.MrsOcty.arm.width >= Phaser.Math.distance(this.MrsOcty.x, this.MrsOcty.y, this.Octy.x, this.Octy.y)) {
                    this.MrsOctyArmAttached();
                }
            }

        }
    },

    click: function(pointer) {

        if (this.Octy.lives <= 0 || this.gameOver) {
            return;
        }

        //  if we click near Octy, retract all paws and do nothing else
        if (Phaser.Math.distance(this.Octy.x, this.Octy.y, pointer.worldX, pointer.worldY) <= 64) {
            this.retractAll();
            return;
        }

        //  let's see what (if anything) we clicked

        //  make an array of things to check:
        var bodies = [];
        //  we will check all paws
        this.paws.forEachAlive(function(paw) {
            bodies.push(paw);
        }, this);

        //  see where we clicked in world co-ordinates
        var point = new Phaser.Point(pointer.worldX, pointer.worldY);

        //  now check whether we clicked something
        var hits = this.physics.p2.hitTest(point, bodies);
        if (hits.length === 0) {

            //  didn't click anything? extend a paw!
            this.extendPaw(pointer);

        } else {

            //  we clicked some paws! let's retract them
            for (var i = 0; i < hits.length; i++) {
                this.retractPaw(hits[i].parent.sprite);
            }

        }

    },

    extendPaw: function (pointer) {

        //  see if there's a paw available
        var paw = this.paws.getFirstExists(false);
        if (paw) {

            //  raycasting!
            //  let's find out if we hit a wall

            //  draw a line from Octy towards the pointer
            var ray = new Phaser.Line();
            //  first normalize the vector
            var vectorLength = this.math.distance(this.Octy.x, this.Octy.y, pointer.worldX, pointer.worldY);
            var vectorXnormalized = (pointer.worldX - this.Octy.x) / vectorLength;
            var vectorYnormalized = (pointer.worldY - this.Octy.y) / vectorLength;
            //  then draw the line
            ray.setTo(this.Octy.x, this.Octy.y, this.Octy.x + vectorXnormalized * this.screenDiagonal, this.Octy.y + vectorYnormalized * this.screenDiagonal);

            var distanceToWall = Number.POSITIVE_INFINITY;
            var closestIntersection = null;

            // For each of the walls...
            this.walls.forEach(function(wall) {

                // Create an array of lines that represent the four edges of each wall
                var lines = [
                    new Phaser.Line(wall.x - wall.width * 0.5, wall.y - wall.height * 0.5, wall.x + wall.width * 0.5, wall.y - wall.height * 0.5),
                    new Phaser.Line(wall.x - wall.width * 0.5, wall.y - wall.height * 0.5, wall.x - wall.width * 0.5, wall.y + wall.height * 0.5),
                    new Phaser.Line(wall.x + wall.width * 0.5, wall.y - wall.height * 0.5, wall.x + wall.width * 0.5, wall.y + wall.height * 0.5),
                    new Phaser.Line(wall.x - wall.width * 0.5, wall.y + wall.height * 0.5, wall.x + wall.width * 0.5, wall.y + wall.height * 0.5)
                ];

                // Test each of the edges in this wall against the ray.
                // If the ray intersects any of the edges then the wall must be in the way.
                for(var i = 0; i < lines.length; i++) {
                    var intersect = Phaser.Line.intersects(ray, lines[i]);
                    if (intersect) {
                        // Find the closest intersection
                        distance =
                            this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
                        if (distance < distanceToWall) {
                            distanceToWall = distance;
                            closestIntersection = intersect;
                        }
                    }
                }

            }, this);

            if (closestIntersection != null) {

                this.closestIntersection = closestIntersection;

                //  shoot paw from Octy to target wall at a set velocity
                paw.reset(this.Octy.x, this.Octy.y);
                var Xdistance = (closestIntersection.x - paw.x);
                var Ydistance = (closestIntersection.y - paw.y);
                var vector = new Phaser.Point(Xdistance, Ydistance);
                var realDistance = vector.getMagnitude();
                Phaser.Point.normalize(vector);
                var shootSpeed = 2000;
                vector.setMagnitude(shootSpeed);
                paw.body.velocity.x = vector.x;
                paw.body.velocity.y = vector.y;

                //  add an arm
                paw.arm = this.arms.getFirstExists(false);
                paw.arm.exists = true;

                if (!this.game.muted) {
                    this.soundfx.suction.play('', 0, 0.2);
                }

                //  calculate how long it will take to reach the wall
                var time = realDistance / shootSpeed * 1000;
                //  when it hits, attach the paw
                this.time.events.add(time, function() {
                    this.attachPaw(paw, closestIntersection.x, closestIntersection.y);
                    if (!this.game.muted) {
                        this.soundfx.tentacle.play('', 0, 0.2);
                    }
                }, this);

            }
//            }
        }

    },

    attachPaw: function(paw, x, y) {

        paw.attached = true;
        //  move paw to position
        paw.reset(x, y);

        //  create spring between the paw and Octy
        //  The parameters are: createSpring(sprite1, sprite2, restLength, stiffness, damping, worldA, worldB, localA, localB)
        paw.spring = this.physics.p2.createSpring(this.Octy, paw, 0, 3, 0.05, null, null, [-this.Octy.belly.x, -this.Octy.belly.y], null);

    },

    retractPaw: function(paw) {

        paw.attached = false;
        paw.arm.width = 0;
        // paw.arm.exists = false;
        this.physics.p2.removeSpring(paw.spring);
        // paw.kill();
        paw.retracting = true;

        if (!this.game.muted) {
            this.soundfx.shoot.play('', 0, 0.2);
        }

    },

    retractAll: function() {
        this.paws.forEachAlive(function(paw) {
            this.retractPaw(paw);
        }, this);
    },
    
    adjustArms: function() {

        var OctyBellyWorld = this.game.world.toLocal(this.Octy.belly, this.Octy);
        this.paws.forEachAlive(function(paw) {
            if (paw.retracting) {
                var deltaX = OctyBellyWorld.x - paw.body.x;
                var deltaY = OctyBellyWorld.y - paw.body.y;
                var distance = Phaser.Math.distance(paw.x, paw.y, OctyBellyWorld.x, OctyBellyWorld.y);
                var normX = deltaX / distance;
                var normY = deltaY / distance;
                var speed = 32;
                paw.body.x += normX * speed;
                paw.body.y += normY * speed;
                if (distance < this.Octy.width) {
                    paw.retracting = false;
                    paw.arm.width = 0;
                    paw.arm.exists = false;
                    paw.kill();
                }
            }
            paw.arm.x = OctyBellyWorld.x;
            paw.arm.y = OctyBellyWorld.y;
            paw.arm.width = Phaser.Math.distance(this.Octy.x, this.Octy.y, paw.body.x, paw.body.y);
            paw.arm.angle = Phaser.Math.wrapAngle(Phaser.Math.radToDeg(Phaser.Math.angleBetween(OctyBellyWorld.x, OctyBellyWorld.y, paw.x, paw.y)));
        }, this);

    },

    OctyHitSomething: function(body, shapeA, shapeB, equation) {

        if (body.sprite != null && (body.sprite.key === 'urchin' || body.sprite.key === 'pufferfish')) {
            //  repulse Octy from the urchin
            var Xvector = (this.Octy.body.x - body.x - body.offset.x);
            var Yvector = (this.Octy.body.y - body.y - body.offset.y);
            var vector = new Phaser.Point(Xvector, Yvector);
            Phaser.Point.normalize(vector);
            vector.setMagnitude(200);
            this.Octy.body.velocity.x = vector.x;
            this.Octy.body.velocity.y = vector.y;

            this.hurtOcty();
        }

        // hit current
        if (body.sprite.force != null) {
            this.Octy.currentForce[0] += body.sprite.force[0];
            this.Octy.currentForce[1] += body.sprite.force[1];
        }

    },

    OctyContactEnd: function(body, shapeA, shapeB) {
        if (body.sprite && body.sprite.force != null) {
            this.Octy.currentForce[0] -= body.sprite.force[0];
            this.Octy.currentForce[1] -= body.sprite.force[1];
        }

    },

    hurtOcty: function() {

        //  if he's alive
        if (!this.gameOver && this.Octy.lives > 0 && this.Octy.hittable) {

            //  prevent a second hit from registering
            this.Octy.hittable = false;
            //  remove a life
            this.Octy.lives -= 1;
            this.lives.removeChildAt(this.lives.length-1);

            if (this.Octy.lives <= 0) {

                //  if he's now dead, set the correct animation frame
                this.Octy.frameName = 'dead';
                if (!this.game.muted) {
                    this.soundfx.hit3.play('', 0, 0.8);
                    this.music.fadeOut(400);
                }
                this.endGame(false);

            } else {

                //  if he's still kicking, set the correct animation frame
                this.Octy.frameName = 'hurt';
                
                if (!this.game.muted) {
                    if (Math.random() > 0.5){
                        this.soundfx.ow1.play('', 0, 0.4);
                    } else {
                        this.soundfx.ow2.play('', 0, 0.4);
                    }
                }

                //  return to the normal animation frame after a short time
                this.time.events.add(100, function() {
                    this.Octy.frameName = 'Octy';
                }, this)

            }

        //  if he's dead
        } else if (this.Octy.lives <= 0 && this.Octy.hittable) {

            this.Octy.frameName = 'dead-hurt';

            //  return to the 'dead' animation frame after a short time
            this.time.events.add(100, function() {
                this.Octy.frameName = 'dead';
            }, this)

        }

        //  make Octy hittable again after a short time
        this.time.events.add(1000, function() {
            this.Octy.hittable = true;
        }, this);

    },
    
    bubbleCollisionHandler: function(current, bubble) {
        bubble.body.velocity.x -= current.force[0] / 2;
    },
    
    resetBubbleToCurrent: function(bubble) {
        this.currentsArcade.forEach(function(current){
            var bubble = bubble || this.bubblesCurrents.getFirstExists(false);
            if (bubble) {
                var x;
                if (current.force[0] > 0) {
                    //  positive X means going left, so the source of the bubbles is to the right
                    x = current.x + current.width / 2 - 10;
                } else {
                    //  negative X means going right, so bubbles come from the left
                    x = current.x - current.width / 2 + 10;
                }
                bubble.reset(x, this.rnd.between(current.y - current.height / 2, current.y + current.height / 2));
                var scale = this.rnd.between(20, current.force[0] * 3) / 100;
                bubble.scale.x = scale;
                bubble.scale.y = scale;
                bubble.body.velocity.y = -5 * (1/scale);
                bubble.body.velocity.x = -current.force[0] * 20;
                var a = current.y / this.world.height * 255;
                // bubble.tint = this.rgbToHex(a,a,a);
                // bubble.tint = 0x000000;
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

    endGame: function(won) {

        this.gameOver = true;
        this.retractAll();

        if (won) {
            
            this.endTime = Math.round((this.time.totalElapsedSeconds() - this.startTime) * 100) / 100;

            //  MrsOcty jumps in joy and extends her arm towards Octy
            this.MrsOcty.frameName = 'happy';
            this.MrsOcty.body.velocity.y = -100;
            this.time.events.add(100, function() {
                this.MrsOcty.arm.exists = true;
            }, this);
            
            if (!this.game.muted) {
                this.music.fadeOut(500);
                this.soundfx.youDidIt.fadeIn(200);
            }

            //  create end menu screen
            this.time.events.add(1000, function() {
                this.endMenu(won);
            }, this);

        } else {

            this.endMenu(won);

        }

    },

    endMenu: function(won) {
        
        this.bg = this.add.graphics(0, 0);
        this.bg.fixedToCamera = true;
        
        if (won) {
            
            this.bg.beginFill(0xFFFFFF, 0.7);
            this.bg.drawRect(0, 0, this.game.width, this.game.height);
            this.bg.endFill();
            
            var time = this.add.group();
            time.x = this.game.width / 2;
            time.y = this.game.height / 2 - 32;
            
            if (localStorage.getItem('levelTimes')) {
                var levelTimes = JSON.parse(localStorage.getItem('levelTimes'));
                if (!(this.level in levelTimes) || levelTimes[this.level] > this.endTime) { // new personal best time
                    levelTimes[this.level] = this.endTime;
                    localStorage.setItem('levelTimes', JSON.stringify(levelTimes));
                    
                    var text = this.add.bitmapText(0, -96, 'komikaD', 'new personal best', 32);
                    text.x -= text.width / 2;
                    text.fixedToCamera = true;
                    time.add(text);
                }
            } else {
                var levelTimes = {};
                levelTimes[this.level] = this.endTime;
                localStorage.setItem('levelTimes', JSON.stringify(levelTimes));
            }

            var nextLevelImg = 'nextLevelFat';
            var retryLevelImg = 'retryLevel';

            var text = this.add.bitmapText(this.game.width / 2, this.game.height / 2 - 280, 'komikaX-black', 'level\ncompleted', 72);
            text.x -= text.width / 2;
            text.y -= text.height / 2;
            text.align = 'center';
            text.fixedToCamera = true;

            // var bg = this.add.graphics(0, 0);
            // bg.fixedToCamera = true;
            // bg.beginFill(0xFFFFFF, 0.7);
            // bg.lineStyle(4, 0x000000, 1);
            // bg.drawRoundedRect(-240 + 26, -216 / 2, 480 - 64, 196, 64);
            // time.add(bg);

            // var text = this.add.bitmapText(0, -96, 'komikaD', 'your time is', 32);
            // text.x -= text.width / 2;
            // text.fixedToCamera = true;
            // time.add(text);

            var text = this.add.bitmapText(0, -16, 'komikaX-black', String(this.endTime), 96);
            text.x -= text.width / 2;
            text.y -= text.height / 2;
            text.fixedToCamera = true;
            time.add(text);

            var text = this.add.bitmapText(0, 48, 'komikaD', 'seconds', 32);
            text.x -= text.width / 2;
            text.fixedToCamera = true;
            time.add(text);

        } else {
            
            this.bg.beginFill(0xFF0000, 0.7);
            this.bg.drawRect(0, 0, this.game.width, this.game.height);
            this.bg.endFill();
            
            var text = this.add.bitmapText(this.game.width / 2, this.game.height / 2 - 280, 'komikaX-black', 'you died', 72);
            text.x -= text.width / 2;
            text.y -= text.height / 2;
            text.align = 'center';
            text.fixedToCamera = true;

            var nextLevelImg = 'nextLevel';
            var retryLevelImg = 'retryLevelFat';

        }

        this.nextLevel = this.add.button(0, this.game.height / 2 + 220, nextLevelImg, this.next);
        this.nextLevel.anchor.x = 0;
        this.nextLevel.anchor.y = 1;
        this.nextLevel.fixedToCamera = true;
        if (nextLevelImg === 'nextLevelFat') {
            this.nextLevel.cameraOffset.x = this.game.width / 2 + 20;
            this.add.tween(this.nextLevel.cameraOffset).to( { x: this.game.width / 2 + 25 }, 1000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
        } else {
            this.nextLevel.cameraOffset.x = this.game.width / 2 + 40;
        }

        this.retryLevel = this.add.button(0, this.game.height / 2 + 220, retryLevelImg, this.retry);
        this.retryLevel.anchor.x = 1;
        this.retryLevel.anchor.y = 1;
        this.retryLevel.fixedToCamera = true;
        if (retryLevelImg === 'retryLevelFat') {
            this.retryLevel.cameraOffset.x = this.game.width / 2 + 40;
            this.add.tween(this.retryLevel.cameraOffset).to( { y: this.game.height / 2 + 215 }, 1000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
        } else {
            this.retryLevel.cameraOffset.x = this.game.width / 2;
        }
        this.selectLevel = this.add.button(this.game.width / 2, this.game.height / 2 + 240, 'selectLevel', this.mainMenu);
        this.selectLevel.anchor.x = 0.5;
        this.selectLevel.anchor.y = 0;
        this.selectLevel.fixedToCamera = true;

    },

    MrsOctyArmAttached: function() {

        this.MrsOcty.arm.attached = true;
        this.Octy.frameName = 'happy';

        this.add.tween(this.MrsOcty.body).to({ angle: +50 }, 2000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
        this.add.tween(this.Octy.body).to({ angle: +50 }, 2000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);

    },

    retry: function() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
//        this.music.stop();
console.log(this.bg);

        //  Then restart the state
        this.game.state.restart(true, false, this.game.currentLevel);

    },

    next: function() {

    },

    mainMenu: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
        if (!this.game.muted) {
            this.music.stop();
        }

        //  Then let's go back to the main menu.
        this.game.state.start('MainMenu');

    },
    
    backButtonPressed: function() {
        if (!this.game.muted) {
            this.music.stop();
        }
        if (this.level) {
            this.mainMenu();
        } else if (this.customJSON) {
            this.game.state.start('LevelEditor', true, false, this.customJSON);
        }
    },

    accelerateToObject: function(obj1, obj2, speed) { // obj1 is a P2 physics body
        if (typeof speed === 'undefined') { speed = 60; }
        var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
        obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
        obj1.body.force.y = Math.sin(angle) * speed;
    },
    
    // rgbToHex: function(r, g, b) {
    //     return parseInt(((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1),16);
    // },

    plotPath: function(nodes, tileSize, speed, backAndForth) {
        //  if the path needs to be played back and forth, simply mirror and concatenate the nodes array
        if (backAndForth) {
            var reverseNodes = {"x": [], "y": []};
            for (var i = nodes.x.length-2; i >= 0; i--) {
                reverseNodes.x.push(nodes.x[i]);
                reverseNodes.y.push(nodes.y[i]);
            }
            nodes.x = nodes.x.concat(reverseNodes.x);
            nodes.y = nodes.y.concat(reverseNodes.y);
        }
        var distance = 0;
        for (var  i = 0; i < nodes.x.length-1; i++) {
            distance += Phaser.Math.distance(nodes.x[i] * tileSize.width, nodes.y[i] * tileSize.height, nodes.x[i+1] * tileSize.width, nodes.y[i+1] * tileSize.height);
        }
        if (distance == 0) {
            console.log("ERROR: pufferfish path distance is 0");
            console.log(nodes);
            return;
        }
        var x = 1 / distance * speed / 60;
        var path = [];
//        var x = 1 / (120 * (nodes.x.length-1));
        for (var i = 0; i <= 1; i += x) {
            var px = this.math.catmullRomInterpolation(nodes.x, i) * tileSize.width;
            var py = this.math.catmullRomInterpolation(nodes.y, i) * tileSize.height;
            path.push({"x": px, "y": py});
        }
        return path;
    },

    render: function() {

        this.game.debug.text(this.time.fps || '--', 2, 14, "#00ff00");

    },

};
