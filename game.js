document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURA QUI I TUOI FILE PNG
  const ASSETS = {
    bear: 'img/teddy-bear.png',          // Percorso immagine orsetto
    sunflower: 'img/sunflower.png', // Percorso immagine girasole
    bg: 'img/valley.jpg'               // Percorso immagine sfondo (opzionale)
  };

  // Caricamento immagini
  const images = {};
  let imagesLoaded = 0;
  const totalImages = Object.keys(ASSETS).length;

  function loadAssets(callback) {
    for (let key in ASSETS) {
      images[key] = new Image();
      images[key].src = ASSETS[key];
      images[key].onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages && callback) callback();
      };
      images[key].onerror = () => {
        images[key] = null; // Fallback vettoriale automatico se il PNG manca
      };
    }
  }

  // Inizializzazione Canvas e UI
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const startScreen = document.getElementById('startScreen');
  const startBtn = document.getElementById('startBtn');

  let score = 0;
  let isPlaying = false;
  let animationFrameId;

  function resizeCanvas() {
    if (!canvas || !canvas.parentElement) return;

    // Calcola lo spazio esatto disponibile per il canvas senza invadere la sidebar
    const containerWidth = canvas.parentElement.clientWidth;
    const isMobile = window.innerWidth <= 768;
    const sidebarWidth = isMobile ? 0 : 220;

    canvas.width = Math.max(200, containerWidth - sidebarWidth);
    canvas.height = canvas.parentElement.clientHeight || 500;
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);
  setTimeout(resizeCanvas, 300);
  resizeCanvas();

  // Dimensioni dinamiche dell'orsetto
  const player = {
    x: 100,
    y: 0,
    width: 70,
    height: 70,
    speed: 7
  };

  let sunflowers = [];
  let particles = [];
  let spawnTimer = 0;
  const keys = {};

  // Gestione Tastiera
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  // Gestione Touch / Mouse fluida per mobile e desktop
  function handlePointer(clientX) {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = clientX - rect.left;
    player.x = touchX - player.width / 2;
  }

  canvas.addEventListener('mousemove', e => handlePointer(e.clientX));
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX);
    }
  }, { passive: true });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX);
    }
  }, { passive: true });

  // Generazione Girasoli (Lenti)
  function spawnSunflower() {
    sunflowers.push({
      x: Math.random() * (canvas.width - 35),
      y: -40,
      size: 35,
      speed: 1.0 + Math.random() * 0.6, // Molto lento e rilassante
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.015
    });
  }

  function createParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1,
        size: 3 + Math.random() * 3
      });
    }
  }

  // Disegno Orsetto (PNG o Vettoriale)
  function drawPlayer() {
    player.y = canvas.height - player.height - 15;

    if (images.bear && images.bear.complete && images.bear.naturalWidth !== 0) {
      ctx.drawImage(images.bear, player.x, player.y, player.width, player.height);
    } else {
      // Fallback Vettoriale
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath();
      ctx.arc(12, 12, 10, 0, Math.PI * 2);
      ctx.arc(58, 12, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(35, 38, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#D2B48C';
      ctx.beginPath();
      ctx.arc(35, 44, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2D3748';
      ctx.beginPath();
      ctx.arc(27, 32, 3, 0, Math.PI * 2);
      ctx.arc(43, 32, 3, 0, Math.PI * 2);
      ctx.arc(35, 40, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Disegno Girasole (PNG o Vettoriale) con effetto luminosità (Glow)
  function drawSunflower(sf) {
    ctx.save();
    ctx.translate(sf.x + sf.size / 2, sf.y + sf.size / 2);
    ctx.rotate(sf.rotation);

    // --- EFFETTO LUMINOSITÀ (Glow Dorato) ---
    ctx.shadowColor = '#FFD700'; // Colore dell'alone (oro brillante)
    ctx.shadowBlur = 15;         // Intensità e ampiezza della sfumatura luminosa
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (images.sunflower && images.sunflower.complete && images.sunflower.naturalWidth !== 0) {
      ctx.drawImage(images.sunflower, -sf.size / 2, -sf.size / 2, sf.size, sf.size);
    } else {
      // Fallback Vettoriale più luminoso
      ctx.fillStyle = '#FFD000'; // Giallo più acceso
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, 12, 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#5A3825';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function update() {
    // Movimento da tastiera opzionale
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;

    // Limiti bordi canvas
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // Spawn girasoli
    spawnTimer++;
    if (spawnTimer > 100) {
      spawnSunflower();
      spawnTimer = 0;
    }

    // Aggiornamento girasoli e collisioni
    for (let i = sunflowers.length - 1; i >= 0; i--) {
      let sf = sunflowers[i];
      sf.y += sf.speed;
      sf.rotation += sf.rotSpeed;

      if (
        sf.y + sf.size >= player.y &&
        sf.y <= player.y + player.height &&
        sf.x + sf.size >= player.x &&
        sf.x <= player.x + player.width
      ) {
        createParticles(sf.x + sf.size / 2, sf.y + sf.size / 2);
        sunflowers.splice(i, 1);
        score++;
        scoreEl.textContent = score;
        continue;
      }

      if (sf.y > canvas.height + 40) {
        sunflowers.splice(i, 1);
      }
    }

    // Particelle
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (images.bg && images.bg.complete && images.bg.naturalWidth !== 0) {
      // --- SIMULAZIONE DI OBJECT-FIT: COVER PER IL CANVAS ---
      const img = images.bg;
      const cWidth = canvas.width;
      const cHeight = canvas.height;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cWidth / cHeight;

      let renderWidth, renderHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        renderWidth = cWidth;
        renderHeight = cWidth / imgRatio;
        offsetX = 0;
        offsetY = (cHeight - renderHeight) / 2;
      } else {
        renderWidth = cHeight * imgRatio;
        renderHeight = cHeight;
        offsetX = (cWidth - renderWidth) / 2;
        offsetY = 0;
      }

      // Disegna l'immagine centrata e coprente (stile cover)
      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

      // Velo scuro opzionale per migliorare la leggibilità del gioco
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, cWidth, cHeight);
    } else {
      // Sfondo di fallback se l'immagine non è caricata
      ctx.fillStyle = '#a8ebe6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Disegna Girasoli, Orsetto e Particelle
    sunflowers.forEach(drawSunflower);
    drawPlayer();

    particles.forEach(p => {
      ctx.fillStyle = `rgba(255, 183, 3, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function gameLoop() {
    if (!isPlaying) return;
    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    isPlaying = true;
    score = 0;
    scoreEl.textContent = '0';
    sunflowers = [];
    particles = [];

    resizeCanvas();
    player.x = canvas.width / 2 - player.width / 2;

    loadAssets();
    gameLoop();
  });
});