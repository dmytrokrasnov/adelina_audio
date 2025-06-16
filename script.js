const firstScanBtn = document.getElementById("first-scan-btn");
const secondScanBtn = document.getElementById("second-scan-btn");
const choiceScreen = document.getElementById("choice-screen");
const playScreen = document.getElementById("play-screen");
const promptText = document.getElementById("prompt-text");
const playBtn = document.getElementById("play-btn");

const hint1 = document.getElementById("hint1");
const hint2 = document.getElementById("hint2");
const track1 = document.getElementById("track1");
const track2 = document.getElementById("track2");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let audioCtx, analyser, dataArray, bufferLength, source;

let currentTrack, currentHint;

function setupAudio(track) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (source) {
    source.disconnect();
  }

  source = audioCtx.createMediaElementSource(track);
  analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function drawVisualizer() {
  canvas.width = window.innerWidth;
  canvas.height = 150;

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    const time = Date.now() * 0.002;

    for (let i = 0; i < bufferLength; i++) {
      const rawHeight = dataArray[i];
      const barHeight = rawHeight * 2.5;

      const hue = (i * 5 + time * 50) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.75)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  draw();
}

function startHintAndWait(hintAudio, trackAudio) {
  playBtn.style.display = "none";
  promptText.textContent = "Слушайте...";

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  hintAudio.play();

  hintAudio.onended = () => {
    promptText.textContent = "Якщо всі готові, тисніть!";
    playBtn.style.display = "inline-block";

    playBtn.onclick = () => {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      setupAudio(trackAudio);
      trackAudio.play();
      drawVisualizer();
      playBtn.style.display = "none";
      promptText.textContent = "Насолоджуйтесь...";
    };
  };
}

firstScanBtn.onclick = () => {
  choiceScreen.style.display = "none";
  playScreen.style.display = "block";
  currentHint = hint1;
  currentTrack = track1;
  startHintAndWait(currentHint, currentTrack);
};

secondScanBtn.onclick = () => {
  choiceScreen.style.display = "none";
  playScreen.style.display = "block";
  currentHint = hint2;
  currentTrack = track2;
  startHintAndWait(currentHint, currentTrack);
};
