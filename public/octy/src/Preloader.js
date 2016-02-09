
OctyGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

OctyGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		//  this.background = this.add.sprite(0, 0, 'preloaderBackground');
		//  this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		//  this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
        
        //  general
        this.load.image('background', 'assets/images/background.png');
        this.load.atlas('Octy', 'assets/images/octy-atlas.png', 'assets/images/octy-atlas.json');
        
        //  fonts
        this.load.bitmapFont('komikaX-white', 'assets/fonts/komikaX-white.png', 'assets/fonts/komikaX-white.fnt');
        this.load.bitmapFont('komikaX-black', 'assets/fonts/komikaX-black.png', 'assets/fonts/komikaX-black.fnt');
        this.load.bitmapFont('komikaD', 'assets/fonts/komikaD.png', 'assets/fonts/komikaD.fnt');
        
        //  game
	this.load.image('paw', 'assets/images/paw.png');
        this.load.image('arm', 'assets/images/arm.png');
	this.load.atlas('MrsOcty', 'assets/images/MrsOcty-atlas.png', 'assets/images/MrsOcty-atlas.json');
	this.load.image('urchin', 'assets/images/seaUrchin.png');
        this.load.image('pufferfish', 'assets/images/pufferfish.png');
        this.load.image('miniOcty', 'assets/images/miniOcty.png');
        
        //  sound fx
        // this.load.audio('shoot', ['assets/soundfx/Shoot.m4a', 'assets/soundfx/Shoot.ogg']);
        // this.load.audio('suction', ['assets/soundfx/Suction.m4a', 'assets/soundfx/Suction.ogg']);
        // this.load.audio('tentacle', ['assets/soundfx/Tentacle.m4a', 'assets/soundfx/Tentacle.ogg']);
        // this.load.audio('youDidIt', ['assets/soundfx/Ms-Octy-You-Did-It.m4a']);
        // this.load.audio('comeHere', ['assets/soundfx/Ms-Octy-Come-Here.m4a']);
        // this.load.audio('ow1', ['assets/soundfx/Ow1.m4a']);
        // this.load.audio('ow2', ['assets/soundfx/Ow2.m4a']);
        // this.load.audio('hit3', ['assets/soundfx/Hit3.m4a']);
        
        //  music
        // this.load.audio('YourUnderwaterWorld', 'assets/music/YourUnderwaterWorld.m4a');
        
        //  end screen
        this.load.image('nextLevel', 'assets/images/nextLevel.png');
        this.load.image('nextLevelFat', 'assets/images/nextLevelFat.png');
        this.load.image('retryLevel', 'assets/images/retryLevel.png');
        this.load.image('retryLevelFat', 'assets/images/retryLevelFat.png');
        this.load.image('selectLevel', 'assets/images/selectLevel.png');
        
        //  "level complete" letters
        // this.load.image('L', 'assets/images/levelCompleteLetters/L.png');
        // this.load.image('E', 'assets/images/levelCompleteLetters/E.png');
        // this.load.image('V', 'assets/images/levelCompleteLetters/V.png');
        // this.load.image('C', 'assets/images/levelCompleteLetters/C.png');
        // this.load.image('O', 'assets/images/levelCompleteLetters/O.png');
        // this.load.image('M', 'assets/images/levelCompleteLetters/M.png');
        // this.load.image('P', 'assets/images/levelCompleteLetters/P.png');
        // this.load.image('T', 'assets/images/levelCompleteLetters/T.png');
        
        //  menu
        for (var i = 1; i <=18; i++) {
          this.load.image('levelButton'+i, 'assets/images/levelButtons/levelButton'+i+'.png');
        }
        // this.load.image('levelButton1', 'assets/images/levelButtons/levelButton1.png');
        // this.load.image('levelButton2', 'assets/images/levelButtons/levelButton2.png');
        // this.load.image('levelButton3', 'assets/images/levelButtons/levelButton3.png');
        this.load.image('levelEditorButton', 'assets/images/levelEditorButton.png');
//        this.load.image('levelButton02', 'assets/images/levelButton02.png');
//        this.load.image('levelButton03', 'assets/images/levelButton03.png');
//        this.load.image('levelButton04', 'assets/images/levelButton04.png');
//        this.load.image('levelButton05', 'assets/images/levelButton05.png');
//		this.load.audio('titleMusic', ['assets/music/SoftAquaticSong.wav']);

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		//  this.preloadBar.cropEnabled = false;
        
        this.state.start('MainMenu');

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
//		if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
//		{
//			this.ready = true;
//			this.state.start('MainMenu');
//		}

	}

};
