await WebMidi.enable();

let myInput = WebMidi.inputs[0];
let myOutput = WebMidi.outputs[0];

let dropIns = document.getElementById("dropdown-ins");
let dropOuts = document.getElementById("dropdown-outs");

const major = [0, 4, 7, 11];
const minor = [0, 3, 7, 10];
const augmented = [0, 6, 7, 11];

const firstInversion = [1, 2, 3, 0];
const secondInversion = [2, 3, 0, 1];

let curStyle = major;

let curChord = [];

let octave = document.getElementById("octave");
let voicing = document.getElementById("voicing");
let scale = document.getElementById("scale");

const midiProcess = function(note) {
  let chord = [];
  for (let i = 0; i < curStyle.length; i++) {
    chord[i] = note + curStyle[i];
    chord[i] += 12 * octave;
  }

  if (voicing.value == "firstInversion") {
    let invChord = []
    for (let i = 0; i < chord.length; i++) {
      invChord[i] = chord[firstInversion[i]];
    }
    return invChord;
  }
  else if (voicing.value == "secondInversion") {
    let invChord = []
    for (let i = 0; i < chord.length; i++) {
      invChord[i] = chord[secondInversion[i]];
    }
    return invChord;
  }

  return chord;
};

voicing.addEventListener("change", function() {
  for (let i = 0; i < curChord.length; i++) { // prevent losing note-offs
    myOutput.sendNoteOff(curChord[i]);
  }
});

scale.addEventListener("change", function() {
  switch(scale.value) {
    case "major":
      curStyle = major;
      break;
    case "minor":
      curStyle = minor;
      break;
    case "augmented":
      curStyle = augmented;
      break;
    default:
      curStyle = major;
  }
  console.log(curStyle); // debugging

  for (let i = 0; i < curChord.length; i++) { // prevent losing note-offs
    myOutput.sendNoteOff(curChord[i]);
  }
});

WebMidi.inputs.forEach(function(input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

WebMidi.outputs.forEach(function(output, num) {
  dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
});

dropIns.addEventListener("change", function() {
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  myInput = WebMidi.inputs[dropIns.value];

  myInput.addListener("noteon", function(someMIDI) {
    // myOutput.sendNoteOn(someMIDI.note);
    curChord = midiProcess(someMIDI.note);
    for (let i = 0; i < chord.length; i++) {
      myOutput.sendNoteOn(curChord[i]);
    }
  });

  myInput.addListener("noteoff", function(someMIDI) {
    for (let i = 0; i < chord.length; i++) {
      myOutput.sendNoteOff(curChord[i]);
    }
  });
});

dropOuts.addEventListener("change", function() {
  myOutput = WebMidi.outputs[dropOuts.value].channels[1];
});
