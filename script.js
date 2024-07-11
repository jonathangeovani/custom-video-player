const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const video = document.querySelector("video");
const playPauseBtn = document.querySelector(".play-pause-btn");
const volumeBtn = document.querySelector(".volume-btn");
const volumeSlider = document.querySelector(".volume-slider");
const currentTime = document.querySelector(".current-time");
const totalTime = document.querySelector(".total-time");
const timeStamp = document.querySelector(".timestamp-container");
const captionsBtn = document.querySelector(".captions-btn");
const captionsOnIcon = document.querySelector(
  ".captions-btn .captions-on-icon"
);
const captionsOffIcon = document.querySelector(
  ".captions-btn .captions-off-icon"
);
const speedBtn = document.querySelector(".speed-btn");
const theaterBtn = document.querySelector(".theater-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const inPictureBtn = document.querySelector(".in-picture-btn");

// TIMELINE CONTROLS
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});

let isScrubbing = false;
let wasPaused;

function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percentage =
    Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);

  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percentage * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percentage =
    Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  timelineContainer.style.setProperty("--preview-position", percentage);

  if (isScrubbing) {
    e.preventDefault();
    timelineContainer.style.setProperty("--progress-position", percentage);
  }
}

// PLAY / PAUSE CONTROLS
playPauseBtn.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});
video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});
video.addEventListener("click", togglePlay);

// VOLUME CONTROLS
volumeBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value == 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume == 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume < 0.5) {
    volumeLevel = "low";
  } else {
    volumeLevel = "hight";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

// TIMESTAMP & CHAPTERS
video.addEventListener("loadeddata", () => {
  totalTime.textContent = formatTime(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(video.currentTime);
  const percentage = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percentage);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatTime(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  if (hours == 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `
      ${hours}:
      ${leadingZeroFormatter.format(minutes)}:
      ${leadingZeroFormatter.format(seconds)}
    `;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

// CAPTIONS CONTROLS
if (video.textTracks.length > 0) {
  const captions = video.textTracks[0];
  captions.mode = "hidden";

  captionsBtn.addEventListener("click", toggleCaptions);
  captionsOffIcon.style.display = "none";

  function toggleCaptions() {
    const isHidden = captions.mode === "hidden";
    captions.mode = isHidden ? "showing" : "hidden";
    videoContainer.classList.toggle("captions", isHidden);
  }
} else {
  captionsOnIcon.style.display = "none";
  captionsBtn.style.cursor = "default";
}

// VIEW MODE CONTROLS
theaterBtn.addEventListener("click", toggleTheaterMode);
fullScreenBtn.addEventListener("click", toggleFullScreenMode);
inPictureBtn.addEventListener("click", toggleInPictureMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function toggleFullScreenMode() {
  if (
    document.fullscreenElement == null &&
    !videoContainer.classList.contains("in-picture")
  ) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

function toggleInPictureMode() {
  if (videoContainer.classList.contains("in-picture")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("in-picture");
});
video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("in-picture");
});

// PLAYBACK SPEED
speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = newPlaybackRate + "x";
}

// KEY COMMANDS
document.addEventListener("keydown", (e) => {
  const activeTagName = document.activeElement.tagName.toLowerCase();

  if (activeTagName == "input") return;
  switch (e.key.toLowerCase()) {
    case " ":
      if (activeTagName == "button") return;
    case "k":
      togglePlay();
      break;
    case "m":
      toggleMute();
      break;
    case "j":
    case "arrowleft":
      skip(-5);
      break;
    case "l":
    case "arrowright":
      skip(5);
      break;
    case "c":
      toggleCaptions();
      break;
    case "i":
      toggleInPictureMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "f":
      toggleFullScreenMode();
      break;
  }
});

// https://youtu.be/ZeNyjnneq_w?si=HwognRXwM4ZMpaR8&t=3397
