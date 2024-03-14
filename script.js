await WebMidi.enable();

let myInput = WebMidi.inputs[0];
let myOutput = WebMidi.outputs[0].channels[1];

let dropIns = document.getElementById("dropdown-ins");
let dropOuts = document.getElementById("dropdown-outs");

const major = [0, 4, 7, 11];
const minor = [0, 3, 7, 10];
const augmented = [0, 4, 8, 11];
const diminished = [0, 3, 6, 10];

const firstInversion = [1, 2, 3, 0];
const secondInversion = [2, 3, 0, 1];

let curStyle = major;

let curChord = [];

let sevenChord = false;

let octave = document.getElementById("octave");
let voicing = document.getElementById("voicing");
let scale = document.getElementById("scale");
let addSev = document.getElementById("addSev");

const midiProcess = function(note) {
  let chord = [];
  for (let i = 0; i < curStyle.length; i++) {
    let new_note = new Note(note + curStyle[i] + (12 * octave.value));
    chord.push(new_note);
  }

  console.log(chord);

  if (voicing.value == "firstInversion") {
    let invChord = []
    for (let i = 0; i < chord.length; i++) {
      invChord[i] = chord[firstInversion[i]];
    }
    chord = invChord;
  }
  else if (voicing.value == "secondInversion") {
    let invChord = []
    for (let i = 0; i < chord.length; i++) {
      invChord[i] = chord[secondInversion[i]];
    }
    chord = invChord;
  }

  if (!sevenChord) { chord.pop(); }

  return chord;
};

voicing.addEventListener("change", function() {
  for (let i = 0; i < curChord.length; i++) { // prevent losing note-offs
    myOutput.sendNoteOff(curChord[i]);
  }
});

scale.addEventListener("change", function() { // sets curStyle array to one of the predefined constants for later
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
    case "diminished":
      curStyle = diminished;
      break;
    default:
      curStyle = major;
  }
  console.log(curStyle); // debugging

  for (let i = 0; i < curChord.length; i++) { // prevent losing note-offs
    myOutput.sendNoteOff(curChord[i]);
  }
});

addSev.addEventListener("change", function() {
  sevenChord = !sevenChord;
  console.log(sevenChord); // debug
})

WebMidi.inputs.forEach(function(input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

WebMidi.outputs.forEach(function(output, num) {
  dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
});

dropIns.addEventListener("change", function() {
  console.log("input changed");

  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  myInput = WebMidi.inputs[dropIns.value];
  console.log(myInput);

  myInput.addListener("noteon", function(someMIDI) {
    console.log("note on");

    for (let i = 0; i < curChord.length; i++) { // prevent losing note offs
      myOutput.sendNoteOff(curChord[i]);
    }

    console.log(someMIDI.note.number);

    curChord = midiProcess(someMIDI.note.number); // turn note into chord and store it in global curChord var

    for (let i = 0; i < curChord.length; i++) { // send note ons for each note in chord
      myOutput.sendNoteOn(curChord[i]);
      console.log(curChord[i]);
    }
  });

  myInput.addListener("noteoff", function(someMIDI) {
    let tempChord = midiProcess(someMIDI.note.number); // prevent unnecessary note offs when multiple keys are pressed

    for (let i = 0; i < tempChord.length; i++) {
      myOutput.sendNoteOff(tempChord[i]);
      console.log(tempChord[i]);
    }
  });
});

dropOuts.addEventListener("change", function() {
  myOutput = WebMidi.outputs[dropOuts.value].channels[1];
  console.log(myOutput);
});
