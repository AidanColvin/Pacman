class GameCoordinator {
  constructor() {
    this.gameUi = document.getElementById('game-ui');
    this.rowTop = document.getElementById('row-top');
    this.mazeDiv = document.getElementById('maze');
    this.mazeImg = document.getElementById('maze-img');
    this.mazeCover = document.getElementById('maze-cover');
    this.pointsDisplay = document.getElementById('points-display');
    this.highScoreDisplay = document.getElementById('high-score-display');
    this.extraLivesDisplay = document.getElementById('extra-lives');
    this.fruitDisplay = document.getElementById('fruit-display');
    this.mainMenu = document.getElementById('main-menu-container');
    this.gameStartButton = document.getElementById('game-start');
    this.pauseButton = document.getElementById('pause-button');
    this.soundButton = document.getElementById('sound-button');
    this.leftCover = document.getElementById('left-cover');
    this.rightCover = document.getElementById('right-cover');
    this.pausedText = document.getElementById('paused-text');
    this.bottomRow = document.getElementById('bottom-row');
    this.movementButtons = document.getElementById('movement-buttons');

    // RESTORE: Ensure the static background image is VISIBLE
    if (this.mazeImg) {
        this.mazeImg.style.display = 'block';
        this.mazeImg.style.opacity = '1';
        this.mazeImg.style.zIndex = '0';
    }

    // REMOVE: Delete the broken canvas if it exists
    const canvas = document.getElementById('maze-canvas');
    if (canvas) canvas.remove();

    // The Standard Map Layout (Must match the maze_blue.svg image)
    this.baseLayout = [
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      'XooooooooooooXXooooooooooooX',
      'XoXXXXoXXXXXoXXoXXXXXoXXXXoX',
      'XOXXXXoXXXXXoXXoXXXXXoXXXXOx',
      'XoXXXXoXXXXXoXXoXXXXXoXXXXoX',
      'XooooooooooooooooooooooooooX',
      'XoXXXXoXXoXXXXXXXXoXXoXXXXoX',
      'XoXXXXoXXoXXXXXXXXoXXoXXXXoX',
      'XooooooXXooooXXooooXXooooooX',
      'XXXXXXoXXXXX XX XXXXXoXXXXXX',
      'XXXXXXoXXXXX XX XXXXXoXXXXXX',
      'XXXXXXoXX          XXoXXXXXX',
      'XXXXXXoXX XXXXXXXX XXoXXXXXX',
      'XXXXXXoXX X      X XXoXXXXXX',
      '      o   X      X   o      ',
      'XXXXXXoXX X      X XXoXXXXXX',
      'XXXXXXoXX XXXXXXXX XXoXXXXXX',
      'XXXXXXoXX          XXoXXXXXX',
      'XXXXXXoXX XXXXXXXX XXoXXXXXX',
      'XXXXXXoXX XXXXXXXX XXoXXXXXX',
      'XooooooooooooXXooooooooooooX',
      'XoXXXXoXXXXXoXXoXXXXXoXXXXoX',
      'XoXXXXoXXXXXoXXoXXXXXoXXXXoX',
      'XOooXXooooooo  oooooooXXooOx',
      'XXXoXXoXXoXXXXXXXXoXXoXXoXXX',
      'XXXoXXoXXoXXXXXXXXoXXoXXoXXX',
      'XooooooXXooooXXooooXXooooooX',
      'XoXXXXXXXXXXoXXoXXXXXXXXXXoX',
      'XoXXXXXXXXXXoXXoXXXXXXXXXXoX',
      'XooooooooooooooooooooooooooX',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    ];

    // Power Pellet Positions for Levels 1, 2, 3
    this.pelletVariations = [
      [[1, 3], [26, 3], [1, 23], [26, 23]], // Corners
      [[6, 3], [21, 3], [6, 23], [21, 23]], // Inner
      [[1, 6], [26, 6], [9, 23], [18, 23]]  // Cross
    ];

    this.maxFps = 120;
    this.tileSize = 8;
    this.mazeArray = this.generateMap(0);
    this.scale = this.determineScale(1);
    this.scaledTileSize = this.tileSize * this.scale;
    this.firstGame = true;

    this.movementKeys = { 87: 'up', 83: 'down', 65: 'left', 68: 'right', 38: 'up', 40: 'down', 37: 'left', 39: 'right' };
    this.fruitPoints = { 1: 100, 2: 300, 3: 500, 4: 700, 5: 1000, 6: 2000, 7: 3000, 8: 5000 };

    this.gameStartButton.addEventListener('click', this.startButtonClick.bind(this));
    this.pauseButton.addEventListener('click', this.handlePauseKey.bind(this));
    this.soundButton.addEventListener('click', this.soundButtonClick.bind(this));

    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'build/app.css';
    link.onload = this.preloadAssets.bind(this);
    head.appendChild(link);

    // FIX HUD: Position "Level" on the RIGHT
    this.levelDisplay = document.createElement('div');
    this.levelDisplay.id = 'level-display';
    this.levelDisplay.style.fontFamily = '"Press Start 2P", cursive';
    this.levelDisplay.style.color = '#fff';
    this.levelDisplay.style.position = 'absolute';
    this.levelDisplay.style.bottom = '0';
    this.levelDisplay.style.right = '0'; // Right align
    this.levelDisplay.style.left = 'auto'; // Remove left align
    this.levelDisplay.style.textAlign = 'right';
    this.levelDisplay.style.lineHeight = `${this.scaledTileSize * 2}px`;
    this.levelDisplay.style.fontSize = `${this.scaledTileSize}px`;
    this.levelDisplay.style.pointerEvents = 'none';
    this.bottomRow.style.position = 'relative';
    this.bottomRow.appendChild(this.levelDisplay);
  }

  generateMap(index) {
    const variationIndex = index % this.pelletVariations.length;
    const map = this.baseLayout.map(row => row.split(''));
    this.pelletVariations[variationIndex].forEach(([x, y]) => {
      if (map[y] && map[y][x] === 'o') {
        map[y][x] = 'O';
      }
    });
    return map;
  }

  determineScale(scale) {
    const viewport = (typeof window !== 'undefined') ? window : {};
    const availableScreenHeight = Math.min(document.documentElement.clientHeight, viewport.innerHeight || 0);
    const availableScreenWidth = Math.min(document.documentElement.clientWidth, viewport.innerWidth || 0);
    const scaledTileSize = this.tileSize * scale;
    const mazeTileHeight = this.mazeArray.length + 5;
    const mazeTileWidth = this.mazeArray[0].length;

    if (scaledTileSize * mazeTileHeight < availableScreenHeight && scaledTileSize * mazeTileWidth < availableScreenWidth) {
      return this.determineScale(scale + 1);
    }
    return scale - 1;
  }

  startButtonClick() {
    this.leftCover.style.left = '-50%';
    this.rightCover.style.right = '-50%';
    this.mainMenu.style.opacity = 0;
    this.gameStartButton.disabled = true;
    setTimeout(() => { this.mainMenu.style.visibility = 'hidden'; }, 1000);
    this.reset();
    if (this.firstGame) {
      this.firstGame = false;
      this.init();
    }
    this.startGameplay(true);
  }

  soundButtonClick() {
    const newVolume = this.soundManager.masterVolume === 1 ? 0 : 1;
    this.soundManager.setMasterVolume(newVolume);
    localStorage.setItem('volumePreference', newVolume);
    this.setSoundButtonIcon(newVolume);
  }

  setSoundButtonIcon(newVolume) {
    this.soundButton.innerHTML = newVolume === 0 ? 'volume_off' : 'volume_up';
  }

  displayErrorMessage() {
    const loadingContainer = document.getElementById('loading-container');
    const errorMessage = document.getElementById('error-message');
    loadingContainer.style.opacity = 0;
    setTimeout(() => {
      loadingContainer.remove();
      errorMessage.style.opacity = 1;
      errorMessage.style.visibility = 'visible';
    }, 1500);
  }

  preloadAssets() {
    return new Promise((resolve) => {
      const loadingContainer = document.getElementById('loading-container');
      const loadingPacman = document.getElementById('loading-pacman');
      const loadingDotMask = document.getElementById('loading-dot-mask');
      const imgBase = 'app/style/graphics/spriteSheets/';
      const imgSources = [
        `${imgBase}characters/pacman/arrow_down.svg`, `${imgBase}characters/pacman/arrow_left.svg`, `${imgBase}characters/pacman/arrow_right.svg`, `${imgBase}characters/pacman/arrow_up.svg`,
        `${imgBase}characters/pacman/pacman_death.svg`, `${imgBase}characters/pacman/pacman_error.svg`, `${imgBase}characters/pacman/pacman_down.svg`, `${imgBase}characters/pacman/pacman_left.svg`, `${imgBase}characters/pacman/pacman_right.svg`, `${imgBase}characters/pacman/pacman_up.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_down_angry.svg`, `${imgBase}characters/ghosts/blinky/blinky_down_annoyed.svg`, `${imgBase}characters/ghosts/blinky/blinky_down.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_left_angry.svg`, `${imgBase}characters/ghosts/blinky/blinky_left_annoyed.svg`, `${imgBase}characters/ghosts/blinky/blinky_left.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_right_angry.svg`, `${imgBase}characters/ghosts/blinky/blinky_right_annoyed.svg`, `${imgBase}characters/ghosts/blinky/blinky_right.svg`,
        `${imgBase}characters/ghosts/blinky/blinky_up_angry.svg`, `${imgBase}characters/ghosts/blinky/blinky_up_annoyed.svg`, `${imgBase}characters/ghosts/blinky/blinky_up.svg`,
        `${imgBase}characters/ghosts/clyde/clyde_down.svg`, `${imgBase}characters/ghosts/clyde/clyde_left.svg`, `${imgBase}characters/ghosts/clyde/clyde_right.svg`, `${imgBase}characters/ghosts/clyde/clyde_up.svg`,
        `${imgBase}characters/ghosts/inky/inky_down.svg`, `${imgBase}characters/ghosts/inky/inky_left.svg`, `${imgBase}characters/ghosts/inky/inky_right.svg`, `${imgBase}characters/ghosts/inky/inky_up.svg`,
        `${imgBase}characters/ghosts/pinky/pinky_down.svg`, `${imgBase}characters/ghosts/pinky/pinky_left.svg`, `${imgBase}characters/ghosts/pinky/pinky_right.svg`, `${imgBase}characters/ghosts/pinky/pinky_up.svg`,
        `${imgBase}characters/ghosts/eyes_down.svg`, `${imgBase}characters/ghosts/eyes_left.svg`, `${imgBase}characters/ghosts/eyes_right.svg`, `${imgBase}characters/ghosts/eyes_up.svg`,
        `${imgBase}characters/ghosts/scared_blue.svg`, `${imgBase}characters/ghosts/scared_white.svg`,
        `${imgBase}pickups/pacdot.svg`, `${imgBase}pickups/powerPellet.svg`,
        `${imgBase}pickups/apple.svg`, `${imgBase}pickups/bell.svg`, `${imgBase}pickups/cherry.svg`, `${imgBase}pickups/galaxian.svg`, `${imgBase}pickups/key.svg`, `${imgBase}pickups/melon.svg`, `${imgBase}pickups/orange.svg`, `${imgBase}pickups/strawberry.svg`,
        `${imgBase}text/ready.svg`, `${imgBase}text/100.svg`, `${imgBase}text/200.svg`, `${imgBase}text/300.svg`, `${imgBase}text/400.svg`, `${imgBase}text/500.svg`, `${imgBase}text/700.svg`, `${imgBase}text/800.svg`, `${imgBase}text/1000.svg`, `${imgBase}text/1600.svg`, `${imgBase}text/2000.svg`, `${imgBase}text/3000.svg`, `${imgBase}text/5000.svg`,
        `${imgBase}maze/maze_blue.svg`, 'app/style/graphics/extra_life.png',
      ];
      const audioBase = 'app/style/audio/';
      const audioSources = [`${audioBase}game_start.mp3`, `${audioBase}pause.mp3`, `${audioBase}pause_beat.mp3`, `${audioBase}siren_1.mp3`, `${audioBase}siren_2.mp3`, `${audioBase}siren_3.mp3`, `${audioBase}power_up.mp3`, `${audioBase}extra_life.mp3`, `${audioBase}eyes.mp3`, `${audioBase}eat_ghost.mp3`, `${audioBase}death.mp3`, `${audioBase}fruit.mp3`, `${audioBase}dot_1.mp3`, `${audioBase}dot_2.mp3`];
      const totalSources = imgSources.length + audioSources.length;
      this.remainingSources = totalSources;
      loadingPacman.style.left = '0';
      loadingDotMask.style.width = '0';
      Promise.all([this.createElements(imgSources, 'img', totalSources, this), this.createElements(audioSources, 'audio', totalSources, this)])
        .then(() => {
          loadingContainer.style.opacity = 0;
          resolve();
          setTimeout(() => {
            loadingContainer.remove();
            this.mainMenu.style.opacity = 1;
            this.mainMenu.style.visibility = 'visible';
          }, 1500);
        }).catch(this.displayErrorMessage);
    });
  }

  createElements(sources, type, totalSources, gameCoord) {
    const loadingContainer = document.getElementById('loading-container');
    const preloadDiv = document.getElementById('preload-div');
    const loadingPacman = document.getElementById('loading-pacman');
    const containerWidth = loadingContainer.scrollWidth - loadingPacman.scrollWidth;
    const loadingDotMask = document.getElementById('loading-dot-mask');
    const gameCoordRef = gameCoord;
    return new Promise((resolve, reject) => {
      let loadedSources = 0;
      sources.forEach((source) => {
        const element = type === 'img' ? new Image() : new Audio();
        preloadDiv.appendChild(element);
        const elementReady = () => {
          gameCoordRef.remainingSources -= 1;
          loadedSources += 1;
          const percent = 1 - gameCoordRef.remainingSources / totalSources;
          loadingPacman.style.left = `${percent * containerWidth}px`;
          loadingDotMask.style.width = loadingPacman.style.left;
          if (loadedSources === sources.length) resolve();
        };
        if (type === 'img') { element.onload = elementReady; element.onerror = reject; }
        else { element.addEventListener('canplaythrough', elementReady); element.onerror = reject; }
        element.src = source;
        if (type === 'audio') element.load();
      });
    });
  }

  reset() {
    this.activeTimers = [];
    this.points = 0;
    this.level = 1;
    this.lives = 2;
    this.extraLifeGiven = false;
    this.remainingDots = 0;
    this.allowKeyPresses = true;
    this.allowPacmanMovement = false;
    this.allowPause = false;
    this.cutscene = true;
    this.highScore = localStorage.getItem('highScore');

    if (this.firstGame) {
      setInterval(() => { this.collisionDetectionLoop(); }, 500);
      this.pacman = new Pacman(this.scaledTileSize, this.mazeArray, new CharacterUtil());
      this.blinky = new Ghost(this.scaledTileSize, this.mazeArray, this.pacman, 'blinky', this.level, new CharacterUtil());
      this.pinky = new Ghost(this.scaledTileSize, this.mazeArray, this.pacman, 'pinky', this.level, new CharacterUtil());
      this.inky = new Ghost(this.scaledTileSize, this.mazeArray, this.pacman, 'inky', this.level, new CharacterUtil(), this.blinky);
      this.clyde = new Ghost(this.scaledTileSize, this.mazeArray, this.pacman, 'clyde', this.level, new CharacterUtil());
      this.fruit = new Pickup('fruit', this.scaledTileSize, 13.5, 17, this.pacman, this.mazeDiv, 100);
    }

    this.entityList = [this.pacman, this.blinky, this.pinky, this.inky, this.clyde, this.fruit];
    this.ghosts = [this.blinky, this.pinky, this.inky, this.clyde];
    this.scaredGhosts = [];
    this.eyeGhosts = 0;

    if (this.firstGame) {
      this.drawMaze(this.mazeArray, this.entityList);
      this.soundManager = new SoundManager();
      this.setUiDimensions();
    } else {
      this.mazeArray = this.generateMap(this.level - 1);
      this.updateCharacterMazes();
      this.resetMazePickups();
      this.pacman.reset();
      this.ghosts.forEach((ghost) => { ghost.reset(true); });
    }

    this.pointsDisplay.innerHTML = '00';
    this.highScoreDisplay.innerHTML = this.highScore || '00';
    this.levelDisplay.innerText = 'Level: ' + this.level;
    this.clearDisplay(this.fruitDisplay);
    const volumePreference = parseInt(localStorage.getItem('volumePreference') || 1, 10);
    this.setSoundButtonIcon(volumePreference);
    this.soundManager.setMasterVolume(volumePreference);
  }

  init() {
    this.registerEventListeners();
    this.gameEngine = new GameEngine(this.maxFps, this.entityList);
    this.gameEngine.start();
  }

  drawMaze(mazeArray, entityList) {
    this.pickups = [this.fruit];
    this.mazeDiv.style.height = `${this.scaledTileSize * 31}px`;
    this.mazeDiv.style.width = `${this.scaledTileSize * 28}px`;
    this.gameUi.style.width = `${this.scaledTileSize * 28}px`;
    this.bottomRow.style.minHeight = `${this.scaledTileSize * 2}px`;
    
    // DOT CONTAINER FIX: Ensure it exists and has high Z-Index
    this.dotContainer = document.getElementById('dot-container');
    if (!this.dotContainer) {
        this.dotContainer = document.createElement('div');
        this.dotContainer.id = 'dot-container';
        this.mazeDiv.appendChild(this.dotContainer);
    }
    this.dotContainer.style.zIndex = '10';

    mazeArray.forEach((row, rowIndex) => {
      row.forEach((block, columnIndex) => {
        if (block === 'o' || block === 'O') {
          const type = block === 'o' ? 'pacdot' : 'powerPellet';
          const points = block === 'o' ? 10 : 50;
          const dot = new Pickup(type, this.scaledTileSize, columnIndex, rowIndex, this.pacman, this.dotContainer, points);
          entityList.push(dot);
          this.pickups.push(dot);
          this.remainingDots += 1;
        }
      });
    });
  }

  updateCharacterMazes() {
    this.pacman.mazeArray = this.mazeArray;
    this.ghosts.forEach((ghost) => { ghost.mazeArray = this.mazeArray; });
  }

  resetMazePickups() {
    this.entityList = this.entityList.filter((entity) => (!(entity instanceof Pickup) || entity.type === 'fruit'));
    this.clearDisplay(this.dotContainer);
    this.remainingDots = 0;
    this.drawMaze(this.mazeArray, this.entityList);
  }

  setUiDimensions() {
    this.gameUi.style.fontSize = `${this.scaledTileSize}px`;
    this.rowTop.style.marginBottom = `${this.scaledTileSize}px`;
  }

  collisionDetectionLoop() {
    if (this.pacman.position) {
      const maxDistance = this.pacman.velocityPerMs * 750;
      const pacmanCenter = { x: this.pacman.position.left + this.scaledTileSize, y: this.pacman.position.top + this.scaledTileSize };
      const debugging = false;
      this.pickups.forEach((pickup) => { pickup.checkPacmanProximity(maxDistance, pacmanCenter, debugging); });
    }
  }

  startGameplay(initialStart) {
    if (initialStart) { this.soundManager.play('game_start'); }
    this.scaredGhosts = [];
    this.eyeGhosts = 0;
    this.allowPacmanMovement = false;
    const left = this.scaledTileSize * 11;
    const top = this.scaledTileSize * 16.5;
    const duration = initialStart ? 4500 : 2000;
    const width = this.scaledTileSize * 6;
    const height = this.scaledTileSize * 2;
    this.displayText({ left, top }, 'ready', duration, width, height);
    this.updateExtraLivesDisplay();
    new Timer(() => {
      this.allowPause = true;
      this.cutscene = false;
      this.soundManager.setCutscene(this.cutscene);
      this.soundManager.setAmbience(this.determineSiren(this.remainingDots));
      this.allowPacmanMovement = true;
      this.pacman.moving = true;
      this.ghosts.forEach((ghost) => { const ghostRef = ghost; ghostRef.moving = true; });
      this.ghostCycle('scatter');
      this.idleGhosts = [this.pinky, this.inky, this.clyde];
      this.releaseGhost();
    }, duration);
  }

  clearDisplay(display) { if (!display) return; while (display.firstChild) { display.removeChild(display.firstChild); } }

  updateExtraLivesDisplay() {
    this.clearDisplay(this.extraLivesDisplay);
    for (let i = 0; i < this.lives; i += 1) {
      const extraLifePic = document.createElement('img');
      extraLifePic.setAttribute('src', 'app/style/graphics/extra_life.svg');
      extraLifePic.style.height = `${this.scaledTileSize * 2}px`;
      this.extraLivesDisplay.appendChild(extraLifePic);
    }
  }

  updateFruitDisplay(rawImageSource) {
    const parsedSource = rawImageSource.slice(rawImageSource.indexOf('(') + 1, rawImageSource.indexOf(')'));
    if (this.fruitDisplay.children.length === 7) { this.fruitDisplay.removeChild(this.fruitDisplay.firstChild); }
    const fruitPic = document.createElement('img');
    fruitPic.setAttribute('src', parsedSource);
    fruitPic.style.height = `${this.scaledTileSize * 2}px`;
    this.fruitDisplay.appendChild(fruitPic);
  }

  ghostCycle(mode) {
    const delay = mode === 'scatter' ? 7000 : 20000;
    const nextMode = mode === 'scatter' ? 'chase' : 'scatter';
    this.ghostCycleTimer = new Timer(() => {
      this.ghosts.forEach((ghost) => { ghost.changeMode(nextMode); });
      this.ghostCycle(nextMode);
    }, delay);
  }

  releaseGhost() {
    if (this.idleGhosts.length > 0) {
      const delay = Math.max((8 - (this.level - 1) * 4) * 1000, 0);
      this.endIdleTimer = new Timer(() => { this.idleGhosts[0].endIdleMode(); this.idleGhosts.shift(); }, delay);
    }
  }

  registerEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('awardPoints', this.awardPoints.bind(this));
    window.addEventListener('deathSequence', this.deathSequence.bind(this));
    window.addEventListener('dotEaten', this.dotEaten.bind(this));
    window.addEventListener('powerUp', this.powerUp.bind(this));
    window.addEventListener('eatGhost', this.eatGhost.bind(this));
    window.addEventListener('restoreGhost', this.restoreGhost.bind(this));
    window.addEventListener('addTimer', this.addTimer.bind(this));
    window.addEventListener('removeTimer', this.removeTimer.bind(this));
    window.addEventListener('releaseGhost', this.releaseGhost.bind(this));
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach((direction) => {
      document.getElementById(`button-${direction}`).addEventListener('touchstart', () => { this.changeDirection(direction); });
    });
  }

  changeDirection(direction) {
    if (this.allowKeyPresses && this.gameEngine.running) { this.pacman.changeDirection(direction, this.allowPacmanMovement); }
  }

  handleKeyDown(e) {
    if (e.keyCode === 27) { this.handlePauseKey(); } else if (e.keyCode === 81) { this.soundButtonClick(); } else if (this.movementKeys[e.keyCode]) { this.changeDirection(this.movementKeys[e.keyCode]); }
  }

  handlePauseKey() {
    if (this.allowPause) {
      this.allowPause = false;
      setTimeout(() => { if (!this.cutscene) { this.allowPause = true; } }, 500);
      this.gameEngine.changePausedState(this.gameEngine.running);
      this.soundManager.play('pause');
      if (this.gameEngine.started) {
        this.soundManager.resumeAmbience();
        this.gameUi.style.filter = 'unset';
        this.movementButtons.style.filter = 'unset';
        this.pausedText.style.visibility = 'hidden';
        this.pauseButton.innerHTML = 'pause';
        this.activeTimers.forEach((timer) => { timer.resume(); });
      } else {
        this.soundManager.stopAmbience();
        this.soundManager.setAmbience('pause_beat', true);
        this.gameUi.style.filter = 'blur(5px)';
        this.movementButtons.style.filter = 'blur(5px)';
        this.pausedText.style.visibility = 'visible';
        this.pauseButton.innerHTML = 'play_arrow';
        this.activeTimers.forEach((timer) => { timer.pause(); });
      }
    }
  }

  awardPoints(e) {
    this.points += e.detail.points;
    this.pointsDisplay.innerText = this.points;
    if (this.points > (this.highScore || 0)) { this.highScore = this.points; this.highScoreDisplay.innerText = this.points; localStorage.setItem('highScore', this.highScore); }
    if (this.points >= 10000 && !this.extraLifeGiven) { this.extraLifeGiven = true; this.soundManager.play('extra_life'); this.lives += 1; this.updateExtraLivesDisplay(); }
    if (e.detail.type === 'fruit') {
      const left = e.detail.points >= 1000 ? this.scaledTileSize * 12.5 : this.scaledTileSize * 13;
      const top = this.scaledTileSize * 16.5;
      const width = e.detail.points >= 1000 ? this.scaledTileSize * 3 : this.scaledTileSize * 2;
      const height = this.scaledTileSize * 2;
      this.displayText({ left, top }, e.detail.points, 2000, width, height);
      this.soundManager.play('fruit');
      this.updateFruitDisplay(this.fruit.determineImage('fruit', e.detail.points));
    }
  }

  deathSequence() {
    this.allowPause = false; this.cutscene = true; this.soundManager.setCutscene(this.cutscene); this.soundManager.stopAmbience();
    this.removeTimer({ detail: { timer: this.fruitTimer } }); this.removeTimer({ detail: { timer: this.ghostCycleTimer } });
    this.removeTimer({ detail: { timer: this.endIdleTimer } }); this.removeTimer({ detail: { timer: this.ghostFlashTimer } });
    this.allowKeyPresses = false; this.pacman.moving = false;
    this.ghosts.forEach((ghost) => { const ghostRef = ghost; ghostRef.moving = false; });
    new Timer(() => {
      this.ghosts.forEach((ghost) => { const ghostRef = ghost; ghostRef.display = false; });
      this.pacman.prepDeathAnimation();
      this.soundManager.play('death');
      if (this.lives > 0) {
        this.lives -= 1;
        new Timer(() => {
          this.mazeCover.style.visibility = 'visible';
          new Timer(() => {
            this.allowKeyPresses = true; this.mazeCover.style.visibility = 'hidden';
            this.pacman.reset();
            this.ghosts.forEach((ghost) => { ghost.reset(); });
            this.fruit.hideFruit();
            this.startGameplay();
          }, 500);
        }, 2250);
      } else { this.gameOver(); }
    }, 750);
  }

  gameOver() {
    localStorage.setItem('highScore', this.highScore);
    new Timer(() => {
      this.displayText({ left: this.scaledTileSize * 9, top: this.scaledTileSize * 16.5 }, 'game_over', 4000, this.scaledTileSize * 10, this.scaledTileSize * 2);
      this.fruit.hideFruit();
      new Timer(() => {
        this.leftCover.style.left = '0'; this.rightCover.style.right = '0';
        setTimeout(() => { this.mainMenu.style.opacity = 1; this.gameStartButton.disabled = false; this.mainMenu.style.visibility = 'visible'; }, 1000);
      }, 2500);
    }, 2250);
  }

  dotEaten() {
    this.remainingDots -= 1;
    this.soundManager.playDotSound();
    if (this.remainingDots === 174 || this.remainingDots === 74) { this.createFruit(); }
    if (this.remainingDots === 40 || this.remainingDots === 20) { this.speedUpBlinky(); }
    if (this.remainingDots === 0) { this.advanceLevel(); }
  }

  createFruit() {
    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.fruit.showFruit(this.fruitPoints[this.level] || 5000);
    this.fruitTimer = new Timer(() => { this.fruit.hideFruit(); }, 10000);
  }

  speedUpBlinky() {
    this.blinky.speedUp();
    if (this.scaredGhosts.length === 0 && this.eyeGhosts === 0) { this.soundManager.setAmbience(this.determineSiren(this.remainingDots)); }
  }

  determineSiren(remainingDots) {
    let sirenNum;
    if (remainingDots > 40) { sirenNum = 1; } else if (remainingDots > 20) { sirenNum = 2; } else { sirenNum = 3; }
    return `siren_${sirenNum}`;
  }

  advanceLevel() {
    this.allowPause = false; this.cutscene = true; this.soundManager.setCutscene(this.cutscene); this.allowKeyPresses = false; this.soundManager.stopAmbience();
    this.entityList.forEach((entity) => { const entityRef = entity; entityRef.moving = false; });
    this.removeTimer({ detail: { timer: this.fruitTimer } }); this.removeTimer({ detail: { timer: this.ghostCycleTimer } });
    this.removeTimer({ detail: { timer: this.endIdleTimer } }); this.removeTimer({ detail: { timer: this.ghostFlashTimer } });
    const imgBase = 'app/style//graphics/spriteSheets/maze/';
    new Timer(() => {
      this.ghosts.forEach((ghost) => { const ghostRef = ghost; ghostRef.display = false; });
      this.mazeImg.src = `${imgBase}maze_white.svg`;
      new Timer(() => {
        this.mazeImg.src = `${imgBase}maze_blue.svg`;
        new Timer(() => {
          this.mazeImg.src = `${imgBase}maze_white.svg`;
          new Timer(() => {
            this.mazeImg.src = `${imgBase}maze_blue.svg`;
            new Timer(() => {
              this.mazeImg.src = `${imgBase}maze_white.svg`;
              new Timer(() => {
                this.mazeImg.src = `${imgBase}maze_blue.svg`;
                new Timer(() => {
                  this.mazeCover.style.visibility = 'visible';
                  new Timer(() => {
                    this.mazeCover.style.visibility = 'hidden';
                    this.level += 1;
                    this.mazeArray = this.generateMap(this.level - 1);
                    this.levelDisplay.innerText = 'Level: ' + this.level;
                    this.allowKeyPresses = true;
                    this.updateCharacterMazes();
                    this.resetMazePickups();
                    this.entityList.forEach((entity) => {
                      const entityRef = entity;
                      if (entityRef.level) { entityRef.level = this.level; }
                      entityRef.reset();
                      if (entityRef instanceof Ghost) { entityRef.resetDefaultSpeed(); }
                    });
                    this.startGameplay();
                  }, 500);
                }, 250);
              }, 250);
            }, 250);
          }, 250);
        }, 250);
      }, 250);
    }, 2000);
  }

  flashGhosts(flashes, maxFlashes) {
    if (flashes === maxFlashes) {
      this.scaredGhosts.forEach((ghost) => { ghost.endScared(); });
      this.scaredGhosts = [];
      if (this.eyeGhosts === 0) { this.soundManager.setAmbience(this.determineSiren(this.remainingDots)); }
    } else if (this.scaredGhosts.length > 0) {
      this.scaredGhosts.forEach((ghost) => { ghost.toggleScaredColor(); });
      this.ghostFlashTimer = new Timer(() => { this.flashGhosts(flashes + 1, maxFlashes); }, 250);
    }
  }

  powerUp() {
    if (this.remainingDots !== 0) { this.soundManager.setAmbience('power_up'); }
    this.removeTimer({ detail: { timer: this.ghostFlashTimer } });
    this.ghostCombo = 0;
    this.scaredGhosts = [];
    this.ghosts.forEach((ghost) => { if (ghost.mode !== 'eyes') { this.scaredGhosts.push(ghost); } });
    this.scaredGhosts.forEach((ghost) => { ghost.becomeScared(); });
    const powerDuration = Math.max((7 - this.level) * 1000, 0);
    this.ghostFlashTimer = new Timer(() => { this.flashGhosts(0, 9); }, powerDuration);
  }

  determineComboPoints() { return 100 * (2 ** this.ghostCombo); }

  eatGhost(e) {
    const pauseDuration = 1000;
    const { position, measurement } = e.detail.ghost;
    this.pauseTimer({ detail: { timer: this.ghostFlashTimer } });
    this.pauseTimer({ detail: { timer: this.ghostCycleTimer } });
    this.pauseTimer({ detail: { timer: this.fruitTimer } });
    this.soundManager.play('eat_ghost');
    this.scaredGhosts = this.scaredGhosts.filter(ghost => ghost.name !== e.detail.ghost.name);
    this.eyeGhosts += 1;
    this.ghostCombo += 1;
    const comboPoints = this.determineComboPoints();
    window.dispatchEvent(new CustomEvent('awardPoints', { detail: { points: comboPoints } }));
    this.displayText(position, comboPoints, pauseDuration, measurement);
    this.allowPacmanMovement = false; this.pacman.display = false; this.pacman.moving = false;
    e.detail.ghost.display = false; e.detail.ghost.moving = false;
    this.ghosts.forEach((ghost) => { const ghostRef = ghost; ghostRef.animate = false; ghostRef.pause(true); ghostRef.allowCollision = false; });
    new Timer(() => {
      this.soundManager.setAmbience('eyes');
      this.resumeTimer({ detail: { timer: this.ghostFlashTimer } });
      this.resumeTimer({ detail: { timer: this.ghostCycleTimer } });
      this.resumeTimer({ detail: { timer: this.fruitTimer } });
      this.allowPacmanMovement = true; this.pacman.display = true; this.pacman.moving = true;
      e.detail.ghost.display = true; e.detail.ghost.moving = true;
      this.ghosts.forEach((ghost) => { const ghostRef = ghost; ghostRef.animate = true; ghostRef.pause(false); ghostRef.allowCollision = true; });
    }, pauseDuration);
  }

  restoreGhost() {
    this.eyeGhosts -= 1;
    if (this.eyeGhosts === 0) { const sound = this.scaredGhosts.length > 0 ? 'power_up' : this.determineSiren(this.remainingDots); this.soundManager.setAmbience(sound); }
  }

  displayText(position, amount, duration, width, height) {
    const pointsDiv = document.createElement('div');
    pointsDiv.style.position = 'absolute'; pointsDiv.style.backgroundSize = `${width}px`;
    pointsDiv.style.backgroundImage = 'url(app/style/graphics/' + `spriteSheets/text/${amount}.svg`;
    pointsDiv.style.width = `${width}px`; pointsDiv.style.height = `${height || width}px`;
    pointsDiv.style.top = `${position.top}px`; pointsDiv.style.left = `${position.left}px`; pointsDiv.style.zIndex = 2;
    this.mazeDiv.appendChild(pointsDiv);
    new Timer(() => { this.mazeDiv.removeChild(pointsDiv); }, duration);
  }

  addTimer(e) { this.activeTimers.push(e.detail.timer); }
  timerExists(e) { return !!(e.detail.timer || {}).timerId; }
  pauseTimer(e) { if (this.timerExists(e)) { e.detail.timer.pause(true); } }
  resumeTimer(e) { if (this.timerExists(e)) { e.detail.timer.resume(true); } }
  removeTimer(e) { if (this.timerExists(e)) { window.clearTimeout(e.detail.timer.timerId); this.activeTimers = this.activeTimers.filter(timer => timer.timerId !== e.detail.timer.timerId); } }
}
// removeIf(production)
module.exports = GameCoordinator;
// endRemoveIf(production)
