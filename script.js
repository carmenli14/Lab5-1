// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

// Step 1: Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
  
  const dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);

  // clear
  ctx.clearRect(0,0,canvas.width, canvas.height);

  // fill with black 
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height); 

  // draw image
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  // toggle buttons
  const submitBtn = document.querySelector('button[type=submit]');
  submitBtn.disabled = false;
  const resetBtn = document.querySelector('button[type=reset]');
  resetBtn.disabled = true;
  const readBtn = document.querySelector('button[type=button]');
  readBtn.disabled = true;

});

// Step 2: store image-input
const imageInput = document.getElementById('image-input');

imageInput.addEventListener('change', () => {
    // load in selected image into img src
    img.src = URL.createObjectURL(imageInput.files[0]);
    // set image alt attribute 
    img.alt = imageInput.files[0].name;
})

// Step 3: submit form with text
const generateForm = document.getElementById('generate-meme');

generateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // grab text 
    const topText = document.getElementById("text-top").value;
    const bottomText = document.getElementById('text-bottom').value;
    // add text
    ctx.strokeStyle = 'white';
    ctx.font = '50px arial';
    ctx.textAlign = 'center';
    ctx.strokeText(topText, canvas.width / 2, 50);
    ctx.strokeText(bottomText, canvas.width / 2, canvas.height-30);

    // toggle buttons
    const submitBtn = document.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    const resetBtn = document.querySelector('button[type=reset]');
    resetBtn.disabled = false;
    const readBtn = document.querySelector('button[type=button]');
    readBtn.disabled = false;
})

// Step 4: clear button
const clear = document.querySelector('button[type=reset]');

clear.addEventListener('click', () => {
    // clear canvas, image and text
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // toggle buttons
    const submitBtn = document.querySelector('button[type=submit]');
    submitBtn.disabled = false;
    const resetBtn = document.querySelector('button[type=reset]');
    resetBtn.disabled = true;
    const readBtn = document.querySelector('button[type=button]');
    readBtn.disabled = true;
})

// Step 5: read text aloud
let synth = window.speechSynthesis;

// get list of voices
var voiceSelect = document.getElementById('voice-selection');
var voices = [];

function populateVoiceList() {
    voices = synth.getVoices();

    voiceSelect.disabled = false;
    voiceSelect.remove(0);

    for(var i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if(voices[i].default) {
        option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
}

const read = document.querySelector('button[type=button]');

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

let volumeLevel = 1; 

read.addEventListener('click', (e) => {
    e.preventDefault();
    // grab text 
    const topText = document.getElementById("text-top").value;
    const bottomText = document.getElementById('text-bottom').value;

    let utterance = new SpeechSynthesisUtterance(topText + ' ' + bottomText);

    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for(var i = 0; i < voices.length ; i++) {
      if(voices[i].name === selectedOption) {
        utterance.voice = voices[i];
      }
    }

    utterance.volume = volumeLevel / 100.0;
    synth.speak(utterance);
})

// Step 6: volume slider 
const volume = document.querySelector("[type='range']");
const volumeGrp = document.getElementById('volume-group');

volumeGrp.addEventListener('input', () => {

    let volumeImg = document.querySelector('#volume-group > img');
    volumeLevel = volume.value;

    // update volume icon and value accordingly
    if (volumeLevel <= 100 && volumeLevel >= 67) {
        volumeImg.src = 'icons/volume-level-3.svg';
        volumeImg.alt = 'Volume Level 3';
    }
    else if (volumeLevel >= 34 && volumeLevel <= 66){
        volumeImg.src = 'icons/volume-level-2.svg';
        volumeImg.alt = 'Volume Level 2';
    }
    else if (volumeLevel <= 33 && volumeLevel >= 1){
        volumeImg.src = 'icons/volume-level-1.svg';
        volumeImg.alt = 'Volume Level 1';
    }
    else {
        volumeImg.src = 'icons/volume-level-0.svg';
        volumeImg.alt = 'Volume Level 0';
    }
})

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
