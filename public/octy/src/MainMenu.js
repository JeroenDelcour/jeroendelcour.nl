OctyGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;
    this.totalLevels = 18;
    this.page = 1;
    this.totalPages = Math.ceil(this.totalLevels / 5);
};

OctyGame.MainMenu.prototype = {

	create: function () {
        
        this.game.muted = true;

		//	start music
//		this.music = this.add.audio('titleMusic');
//		this.music.play('', 0, 1, true);

        this.world.resize(480, 800);
        this.world.setBounds(-480 / 2 + 480 / 2, 0, 480, 800);
        
        //  center game world
        // this.camera.bounds = null;
        // this.camera.x = -this.game.width / 2 + this.world.width / 2;
        
        //  add background
        this.background = this.add.sprite(0, 0, 'background');
        //  stretch it to fill the game world
        this.background.height = this.world.height;
        this.background.width = this.world.width;
        //  animate it
        this.add.tween(this.background).to({height: this.world.height + 200}, 3000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
        
        //  make bubbles
        var bubbleBitmap = this.add.bitmapData(64, 64);
        bubbleBitmap.ctx.beginPath();
        bubbleBitmap.ctx.arc(32, 32, 28, 0, 2 * Math.PI, false);
        bubbleBitmap.ctx.lineWidth = 1;
        bubbleBitmap.ctx.strokeStyle = "#ffffff";
        bubbleBitmap.ctx.stroke();
        this.bubbleEmitter = this.add.emitter(this.world.centerX, this.world.height + 32, 200);
        this.bubbleEmitter.makeParticles(bubbleBitmap, 0, 200, false, false);
        this.bubbleEmitter.gravity = -100;
        this.bubbleEmitter.maxParticleScale = 1;
        this.bubbleEmitter.minParticleScale = 0.2;
        this.bubbleEmitter.width = this.world.width;
        this.bubbleEmitter.start(false, 5000, 500);

		//  add Octy
        this.Octy = this.add.sprite(this.world.centerX, this.world.centerY + 96, 'Octy');
        this.Octy.anchor.setTo(0.5, 0.5);
        //  animate him
        this.Octy.angle = -45;
        this.add.tween(this.Octy).to({angle: 45}, 2000, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
        
        //  "select a level"
        this.titleText = this.add.bitmapText(this.game.width / 2, this.game.height / 2 - 360, 'komikaX-black', 'select a\nlevel', 72);
        this.titleText.x -= this.titleText.width / 2;
        this.titleText.align = 'center';
        
        //  add level buttons
        this.levelButtons = this.add.group();
        
        var levelTimes = JSON.parse(localStorage.getItem('levelTimes'));
        
        var _this = this;
        for (var i=1; i<=this.totalLevels; i++) {
            var group = this.add.group();
            var x = this.Octy.x;
            var y = this.Octy.y;
            switch((i+5)%5) { // position relative to Octy
                case 1:
                    x += -80;
                    y += -156;
                    break;
                case 2:
                    x += 80;
                    y += -156;
                    break;
                case 3:
                    x += 150;
                    y += 50;
                    break;
                    break;
                case 4:
                    x += 0;
                    y += 175;
                    break;
                case 0:
                    x += -150;
                    y += 50;
                    break;
                default:
                    x += 0;
                    y += 0;
                    break;
            }
            x += Math.floor((i-1)/5) * this.world.width; // paginate buttons
            // if (i === 3) {
            //     var button = this.add.button(x, y, 'levelButton3', this.goToLevelBrowser);
            // } else 
            if (i === 5) {
                // var buttonWidth = 125;
                // var buttonHeight = 182;
                // var b = this.add.bitmapData(125, 182);
                // b.ctx.font = "72px komikaX-black";
                // b.ctx.fillStyle = "#000000";
                // b.ctx.textAlign = "center";
                // b.ctx.textBaseline = "middle";
                // b.ctx.fillText("2", buttonWidth/2, buttonHeight/2);
                // b.ctx.beginPath();
                // b.ctx.lineWidth = 12;
                // b.ctx.strokeStyle = '#000000';
                // var r = 60;
                // b.ctx.moveTo(this.rnd.between(r*0.5, r) * Math.cos(0) + buttonWidth/2, this.rnd.between(r*0.5, r) * Math.sin(0) + buttonHeight/2);
                // for (var j = 0.25; j < 2; j += 0.25) {
                //     // b.ctx.lineTo(this.rnd.between(r*0.5, r) * Math.cos(j*Math.PI) + buttonWidth/2, r * Math.sin(j*Math.PI) + buttonHeight/2);
                //     var rTemp = this.rnd.between(r*0.7, r);
                //     b.ctx.quadraticCurveTo(
                //         rTemp * Math.cos((j-.125)*Math.PI) + buttonWidth/2,
                //         rTemp * Math.sin((j-.125)*Math.PI) + buttonHeight/2,
                //         rTemp * Math.cos(j*Math.PI) + buttonWidth/2,
                //         rTemp * Math.sin(j*Math.PI) + buttonHeight/2);
                //         // b.ctx.moveTo(this.rnd.between(r*0.5, r) * Math.cos(j*Math.PI) + buttonWidth/2, r * Math.sin(j*Math.PI) + buttonHeight/2);
                // }
                // b.ctx.closePath();
                // b.ctx.stroke();
                var button = this.add.button(x, y, 'levelButton5', this.startLevelEditor);
            } else {
                var button = this.add.button(x, y, 'levelButton'+i, function(button){_this.startLevel('level'+button.level);});
            }
            button.level = i;
            button.anchor.setTo(0.5, 0.5);
            group.add(button);
            if (levelTimes) {
                var time = levelTimes['level'+i];
                if (time) {
                    var text = this.add.bitmapText(0, -96, 'komikaX-black', String(time), 28);
                    text.x = button.x - text.width / 2;
                    text.y = button.y + button.height / 2;
                    group.add(text);   
                }
            }
            this.levelButtons.add(group);
        }
        
        //  page buttons
        // left
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
        this.pageLeftButton = this.add.button(this.world.centerX - 164, this.world.height - 64, b, function() {_this.pageLeft()});
        this.pageLeftButton.visible = false;
        this.pageLeftButton.anchor.setTo(0.5, 0.5);
        this.pageLeftButtonTween = this.add.tween(this.pageLeftButton).to({x: '+8'}, 1200, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
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
        this.pageRightButton = this.add.button(this.world.centerX + 164, this.world.height - 64, b, function() {_this.pageRight()});
        this.pageRightButton.anchor.setTo(0.5, 0.5);
        this.pageRightButtonTween = this.add.tween(this.pageRightButton).to({x: '-8'}, 1200, Phaser.Easing.Quadratic.InOut, true, 0, -1, true).start();
        
        // this.paginateTween = this.add.tween(this.levelButtons).to({x: '+'+this.world.width}, 600, Phaser.Easing.Quadratic.In, false, 0, 0, false);
        // this.paginateTween.onComplete.removeAll();
        
        //  level editor button
        // this.levelEditorButton = this.add.button(240, 650, 'levelEditorButton', this.startLevelEditor);
        // this.levelEditorButton.anchor.setTo(0.5, 0.5);
        
        // //  temporary custom levels browser button
        // var bitmap = this.add.bitmapData(64,64);
        // bitmap.ctx.beginPath();
        // bitmap.ctx.arc(32, 32, 28, 0, 2 * Math.PI, false);
        // bitmap.ctx.fillStyle = "#ffffff";
        // bitmap.ctx.fill();
        // bitmap.ctx.lineWidth = 4;
        // bitmap.ctx.strokeStyle = "#000000";
        // bitmap.ctx.stroke();
        // this.LevelBrowserButton = this.add.button(208, 700, bitmap, this.goToLevelBrowser);

	},

	update: function () {
        
        
            
	},
    
    pageLeft: function() {
        if (this.page > 1) {
            this.paginateTween = this.add.tween(this.levelButtons).to({x: '+'+this.world.width}, 600, Phaser.Easing.Quadratic.Out, true, 0, 0, false);
            this.pageLeftButton.input.enabled = false;
            this.pageRightButton.input.enabled = false;
            this.page -= 1;
            if (this.page <= 1) {
                this.pageLeftButtonTween = this.add.tween(this.pageLeftButton).to({x: '+'+this.world.width}, 600, Phaser.Easing.Quadratic.Out, true, 0, 0, false);
                var _this = this;
                this.pageLeftButtonTween.onComplete.addOnce(function(){_this.pageLeftButton.visible = false;});
            }
            if (this.page < this.totalPages && this.pageRightButton.visible == false) {
                this.add.tween(this.pageRightButton).from({x: '-'+this.world.width}, 600, Phaser.Easing.Quadratic.Out, true, 0, 0, false).start();
                this.pageRightButton.visible = true;
            }
            var _this = this;
            this.paginateTween.onComplete.add(function() {
                _this.pageLeftButton.input.enabled = true;
                _this.pageRightButton.input.enabled = true;
                // if (_this.page < _this.totalPages) {
                //     _this.pageRightButton.visible = true;
                // }
                // if (_this.page <= 1) {
                //     _this.pageLeftButton.visible = false;
                // }
            });
        }
    },
    
    pageRight: function() {
        if (this.page < this.totalPages) {
            this.paginateTween = this.add.tween(this.levelButtons).to({x: '-'+this.world.width}, 600, Phaser.Easing.Quadratic.Out, true, 0, 0, false);
            this.pageLeftButton.input.enabled = false;
            this.pageRightButton.input.enabled = false;
            this.page += 1;
            if (this.page >= this.totalPages) {
                this.pageRightButtonTween = this.add.tween(this.pageRightButton).to({x: '-'+this.world.width}, 600, Phaser.Easing.Quadratic.Out, true, 0, 0, false);
                var _this = this;
                this.pageRightButtonTween.onComplete.addOnce(function(){_this.pageRightButton.visible = false;});
            }
            if (this.page > 1 && this.pageLeftButton.visible == false) {
                this.add.tween(this.pageLeftButton).from({x: '+'+this.world.width}, 600, Phaser.Easing.Quadratic.Out, true, 0, 0, false).start();
                this.pageLeftButton.visible = true;
            }
            var _this = this;
            this.paginateTween.onComplete.add(function() {
                _this.pageLeftButton.input.enabled = true;
                _this.pageRightButton.input.enabled = true;
                // if (_this.page > 1) {
                //     _this.pageLeftButton.visible = true;
                // }
                // if (_this.page >= _this.totalPages) {
                //     _this.pageRightButton.visible = false;
                // }
            });
        }
    },
    
    startLevel: function(level) {
        this.game.currentLevel = level;
        this.game.state.start('Game', true, false, level);
    },
    
    startLevelEditor: function() {
        this.game.state.start('LevelEditor', true, false);
    },
    
    goToLevelBrowser: function() {
        
        // var xmlhttp=new XMLHttpRequest();
        // xmlhttp.onreadystatechange=function() {
        //     if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        //         console.log(xmlhttp.responseText);
        //     }
        // }
        // xmlhttp.open("GET","http://46.227.239.254:8080/eagle.php",true);
        // xmlhttp.send();
        
        // Create the XHR object.
        function createCORSRequest(method, url) {
          var xhr = new XMLHttpRequest();
          if ("withCredentials" in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
          } else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, url);
          } else {
            // CORS not supported.
            xhr = null;
          }
          return xhr;
        }
        
        // Helper method to parse the title tag from the response.
        function getTitle(text) {
          return text.match('<title>(.*)?</title>')[1];
        }
        var _this = this;
        // Make the actual CORS request.
        function makeCorsRequest() {
          // All HTML5 Rocks properties support CORS.
          var url = 'http://zekko.ga/lab/Octy/getLevelJSON.php';
        
          var xhr = createCORSRequest('GET', url);
          if (!xhr) {
            alert('CORS not supported');
            return;
          }
        
          // Response handlers.
          xhr.onload = function() {
            var text = xhr.responseText;
            // var title = getTitle(text);
            _this.game.currentLevel = null;
            var levelJSON = text;
            console.log(levelJSON);
            _this.game.state.start('Game', true, false, null, levelJSON);
          };
        
          xhr.onerror = function() {
            console.log('Woops, there was an error making the request.');
          };
        
          xhr.send();
        }
        
        makeCorsRequest();
        
    }

};
