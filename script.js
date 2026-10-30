// ==========================================
// CONFIGURAZIONE SICUREZZA PIN
// ==========================================
// Metti a TRUE per attivare la richiesta del PIN
// Metti a FALSE per disattivarla e mostrare subito il sito
const ATTIVA_PROTEZIONE_PIN = false;
const correctPin = "23032023";

const lockScreen = document.getElementById('lock-screen');
const pinInput = document.getElementById('pin-input');
const unlockBtn = document.getElementById('unlock-btn');
const errorMsg = document.getElementById('error-message');
const bodyElement = document.body;

function checkPin() {
  if (pinInput.value === correctPin) {
    // PIN corretto: fa partire l'animazione di scorrimento verso l'alto
    lockScreen.classList.add('slide-up');
    bodyElement.classList.add('unlocked');
  } else {
    // PIN errato: mostra errore e fa un piccolo effetto visivo sull'input
    errorMsg.style.display = 'block';
    pinInput.style.borderColor = '#ff8a80';
    pinInput.value = '';
    setTimeout(() => {
      pinInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }, 1500);
  }
}

// Logica di avvio basata sulla variabile
window.onload = () => {
  if (ATTIVA_PROTEZIONE_PIN) {
    // Se è true, mostra la schermata e dà il focus all'input
    pinInput.focus();
  } else {
    // Se è false, nasconde subito il lock-screen ed sblocca il contenuto
    lockScreen.style.display = 'none';
    bodyElement.classList.add('unlocked');
  }
};

// Ascolta il click sul bottone
unlockBtn.addEventListener('click', checkPin);

// Permette di premere "Invio" sulla tastiera per confermare il PIN
pinInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    checkPin();
  }
});

// Player
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconaPlay = document.getElementById('icona-play');
  const vinile = document.getElementById('vinile');
  const barraProgresso = document.getElementById('barra-progresso');
  const barraContenitore = document.getElementById('barra-contenitore');
  const tempoCorrenteEl = document.getElementById('tempo-corrente');
  const tempoTotaleEl = document.getElementById('tempo-totale');
  const coverVinile = document.getElementById('albumCover');

  // Gestione Play / Pausa con animazione fluida di uscita e rientro del vinile
  btnPlayPause.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      iconaPlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/></svg>';

      // Pulisce eventuali stili inline e fa partire l'uscita
      vinile.style.animation = '';
      vinile.style.transform = '';
      vinile.classList.add('in-riproduzione');
      coverVinile.style.marginLeft = '-25px';
    } else {
      audio.pause();
      iconaPlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>';


      // 1. Legge la posizione e la rotazione esatta del vinile in questo millisecondo
      const matriceCorrente = window.getComputedStyle(vinile).transform;

      // 2. Disattiva temporaneamente l'animazione e fissa il transform attuale per evitare scatti
      vinile.style.animation = 'none';
      coverVinile.style.marginLeft = '0px';
      vinile.style.transform = matriceCorrente;

      // 3. Rimuove la classe di riproduzione
      vinile.classList.remove('in-riproduzione');

      // 4. Dopo un micro-istante, applica il transform a 0 per attivare la transition di rientro dolce
      setTimeout(() => {
        vinile.style.transform = 'translateX(0px) rotate(0deg)';
      }, 20);
    }
  });

  // Aggiornamento tempo e barra di avanzamento
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const percentuale = (audio.currentTime / audio.duration) * 100;
      barraProgresso.style.width = `${percentuale}%`;
      tempoCorrenteEl.textContent = formattaTempo(audio.currentTime);
    }
  });

  // Imposta la durata totale appena l'audio è pronto
  audio.addEventListener('loadedmetadata', () => {
    tempoTotaleEl.textContent = formattaTempo(audio.duration);
  });

  // Click sulla barra per saltare a un determinato punto del brano
  barraContenitore.addEventListener('click', (e) => {
    const larghezzaTotale = barraContenitore.clientWidth;
    const clickX = e.offsetX;
    const nuovaPosizione = (clickX / larghezzaTotale) * audio.duration;
    audio.currentTime = nuovaPosizione;
  });

  // Quando la canzone finisce
  audio.addEventListener('ended', () => {
    iconaPlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>';

    // Rientro dolce del vinile anche a fine canzone
    const matriceCorrente = window.getComputedStyle(vinile).transform;
    vinile.style.animation = 'none';
    vinile.style.transform = matriceCorrente;
    vinile.classList.remove('in-riproduzione');

    setTimeout(() => {
      vinile.style.transform = 'translateX(0px) rotate(0deg)';
    }, 20);

    barraProgresso.style.width = '0%';
  });

  // Utility per formattare i secondi in mm:ss
  function formattaTempo(secondi) {
    const min = Math.floor(secondi / 60);
    const sec = Math.floor(secondi % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
});

// ==========================================
// DISSOLVENZA FLUIDA IN ENTRATA E USCITA (STACKING)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.blocco-wrapper');
  if (!wrappers.length) return;

  function gestisciFadeStack() {
    const altezzaFinestra = window.innerHeight;

    wrappers.forEach((wrapper, index) => {
      const blocco = wrapper.querySelector('.blocco');
      if (!blocco) return;

      const wrapperSuccessivo = wrappers[index + 1];
      let opacita = 1;

      // Quando il blocco successivo sale a coprire questo, lo facciamo dissolvere
      if (wrapperSuccessivo) {
        const rectSucc = wrapperSuccessivo.getBoundingClientRect();

        if (rectSucc.top <= altezzaFinestra && rectSucc.top >= 0) {
          let progresso = 1 - (rectSucc.top / altezzaFinestra);

          // Regola la velocità di dissolvenza (0.3 rende il fade rapido e pulito)
          let progressoAccelerato = Math.pow(progresso, 0.6);
          opacita = 1 - progressoAccelerato;

        } else if (rectSucc.top < 0) {
          opacita = 0;
        }
      }

      // Applichiamo l'opacità all'intero blocco (sfondo + elementi interni insieme)
      const figliBlocco = blocco.children;
      Array.from(figliBlocco).forEach((c) => {
        c.style.opacity = opacita.toFixed(2);
      });

      // Gestisce la visibilità per evitare interazioni fantasma quando è trasparente
      if (opacita <= 0.05) {
        blocco.style.visibility = 'hidden';
      } else {
        blocco.style.visibility = 'visible';
      }
    });
  }

  window.addEventListener('scroll', gestisciFadeStack, { passive: true });
  gestisciFadeStack();
});