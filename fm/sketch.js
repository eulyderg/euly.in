///////////////////////////
// variable declarations //
///////////////////////////

// modulo fix //
function modulo(a,b) {return ((a % b) + b) % b;}
// waveform functions //
var sine = function(x) {return Math.sin(x);}
var sine_rectified = function(x) {return Math.max(Math.sin(x),0);}
var sawtooth = function(x) {return modulo(x,Math.PI*2)/Math.PI-1;}
var square_wave = function(x) {return (modulo(x,Math.PI*2)>=Math.PI)?1:-1;}
var waveList = [sine,sine_rectified,sawtooth,square_wave];
var waveNames = ["Sine","Rectified Sine","Sawtooth","Square"];

// global parameters //
var ops = 6;       // number of operators
var uriParam = window.location.href.split("?")[1];
if (!isNaN(parseInt(uriParam))) {
  ops = Math.min(parseInt(uriParam),16);
}

let amp = [];      // oscillator amplitude
let phase = [];    // oscillator phase
let mults = [];    // oscillator multipler
let ampmod = [];   // macro on amplitude?
let phasemod = []; // macro on phase?
let waves = [];    // oscillator waveform
let mod = [];      // modulation matrix table
let outs = [];     // output amount

let macro = 1;     // global macro (wave index)
var length = 64;   // wavetable length

// elements //
var waveCanvases = [];
var waveDropdowns = [];
var ampSliders = [];
var ampSpans = [];
var ampCheckboxes = [];
var phaseSliders = [];
var phaseSpans = [];
var phaseCheckboxes = [];
var multSliders = [];
var multSpans = [];
var multCheckboxes = [];
var modSliders = [];
var outSliders = [];
var textarea, out;
var modslider, lenslider;
var lenspan;
var canvasEl;

// oscillator class //
var oscillators = [];
class oscillator {
  constructor(id) {
    this.id = id;
    this.phase = 0;
    this.prev = 0;
    this.curr = 0;
    this.out = 0;
  }
  // resets the oscillator state //
  resetphase() {
    var finalphase = phasemod[this.id] ? phase[this.id] * macro : phase[this.id];
    this.phase = finalphase;
    this.prev = 0;
    this.curr = 0;
    this.out = 0;
  }
  // clock one sample //
  clock() {
    var finalamp = ampmod[this.id] ? amp[this.id] * macro : amp[this.id];
    this.phase += 1/length;
    for (var i=0;i<oscillators.length;i++) {
      this.phase += (oscillators[i].curr - oscillators[i].prev)*mod[this.id][i]*(this.id==i?2:1)/(Math.PI*2);
    }
    this.out = waveList[waves[this.id]]((Math.PI*2)*this.phase*mults[this.id])*finalamp;
    return this.out;
  }
  clockend() {
    this.prev = this.curr;
    this.curr = this.out;
  }
}

// function to calculate wavetable //
function fm() {
  var wavetable = [];
  for (var i=0;i<ops;i++) {oscillators[i].resetphase();}
  for (var x=0;x<length;x++) {
    wavetable[x] = 0;
    for (var i=0;i<ops;i++) {wavetable[x]+=oscillators[i].clock()*outs[i];}
    for (var i=0;i<ops;i++) {oscillators[i].clockend();}
  }
  wavetable = wavetable.map(x=>Math.max(Math.min(Math.floor(x*7.5+8),15),0));
  return wavetable;
}


///////////////
// main code //
///////////////

function setup() {
  var topBar = createDiv();
  topBar.class("top");
  if (!canvasEl) {canvasEl = createCanvas(length*4, 61);}
  canvasEl.parent(topBar);
  noStroke();
  
  // add length slider //
  lenslider = createSlider(4, 128, length, 4);
  lenslider.style('width', '512px');
  lenslider.style("margin-bottom","-8px");
  lenslider.parent(topBar);
  lenspan = createSpan("<br/>LENGTH: "+length);
  lenspan.style("font-size","14px");
  lenspan.style("font-weight","bold");
  lenspan.parent(topBar);
  lenslider.input(function(){
    length = this.value();
    resizeCanvas(length*4,61);
    lenspan.html("<br/>LENGTH: "+length);
  });
  
  // add operators //
  var operatorGrid = createDiv();
  operatorGrid.class("grid");
  for (var i=0;i<ops;i++) {
    // set variables //
    amp[i] = 1;
    ampmod[i] = false;
    phase[i] = 0;
    phasemod[i] = false;
    mults[i] = 1;
    waves[i] = 0;
    outs[i] = (i==0)?1:0;
    mod[i] = [];
    modSliders[i] = [];
    oscillators[i] = new oscillator(i);
    // create elements //
    var operatorDiv = createDiv();
    operatorDiv.class("operator");
    var titleRow = createDiv("OPERATOR "+(i+1)+" ");
    titleRow.style("font-family","serif");
    titleRow.style("font-size","12px");
    titleRow.style("color","#555555");
    titleRow.style("margin-top","8px");
    titleRow.style("margin-bottom","-6px");
    waveCanvases[i] = createElement("canvas");
    waveCanvases[i].elt.width = 32;
    waveCanvases[i].elt.height = 16;
    waveCanvases[i].elt.style.display = "inline-block";
    waveCanvases[i].elt.style.margin = "0px 0px 0px 4px";
    waveCanvases[i].parent(titleRow);
    waveDropdowns[i] = createSelect();
    waveDropdowns[i].style("height","18px");
    waveDropdowns[i].elt.style.position = "relative";
    waveDropdowns[i].elt.style.top = "-2px";
    waveDropdowns[i].index = i;
    waveDropdowns[i].parent(titleRow);
    for (var j=0;j<waveList.length;j++) {
      waveDropdowns[i].option(waveNames[j],j);
    }
    waveDropdowns[i].input(function(){
      waves[this.index] = this.value();
      redrawWaves();
    })
    var amplitudeRow = createDiv();
    amplitudeRow.style('margin-bottom','-4px');
    ampSliders[i] = createSlider(0, 8, 1, 0.05);
    ampSliders[i].style('width', '256px');
    ampSliders[i].index = i;
    ampSliders[i].parent(amplitudeRow);
    ampCheckboxes[i] = createElement("input");
    ampCheckboxes[i].elt.type = "checkbox";
    ampCheckboxes[i].elt.title = "Modulate A"+(i+1);
    ampCheckboxes[i].index = i;
    ampCheckboxes[i].input(function(){ampmod[this.index]=this.elt.checked});
    ampCheckboxes[i].parent(amplitudeRow);
    ampSpans[i] = createSpan("AMPLITUDE 1.00");
    ampSpans[i].style("font-size","12px");
    ampSpans[i].parent(amplitudeRow);
    ampSliders[i].input(function(){
      amp[this.index] = this.value();
      ampSpans[this.index].html("AMPLITUDE "+this.value().toFixed(2));
    });
    var phaseRow = createDiv();
    phaseRow.style('margin-bottom','-4px');
    phaseSliders[i] = createSlider(0, 1, 0, 0.01);
    phaseSliders[i].style('width', '256px');
    phaseSliders[i].index = i;
    phaseSliders[i].parent(phaseRow);
    phaseCheckboxes[i] = createElement("input");
    phaseCheckboxes[i].elt.type = "checkbox";
    phaseCheckboxes[i].elt.title = "Modulate P"+(i+1);
    phaseCheckboxes[i].index = i;
    phaseCheckboxes[i].input(function(){phasemod[this.index]=this.elt.checked;});
    phaseCheckboxes[i].parent(phaseRow);
    phaseSpans[i] = createSpan("PHASE 0.00");
    phaseSpans[i].style("font-size","12px");
    phaseSpans[i].parent(phaseRow);
    phaseSliders[i].input(function(){
      phase[this.index] = this.value();
      phaseSpans[this.index].html("PHASE "+this.value().toFixed(2));
    });
    var multiplierRow = createDiv();
    multiplierRow.style('margin-bottom','-4px');
    multSliders[i] = createSlider(0, 15, 1, 1);
    multSliders[i].style('width', '256px');
    multSliders[i].index = i;
    multSliders[i].parent(multiplierRow);
    multCheckboxes[i] = createElement("input");
    multCheckboxes[i].elt.type = "checkbox";
    multCheckboxes[i].elt.disabled = true;
    multCheckboxes[i].parent(multiplierRow);
    multSpans[i] = createSpan("MULT 1.00");
    multSpans[i].style("font-size","12px");
    multSpans[i].parent(multiplierRow);
    multSliders[i].input(function(){
      mults[this.index] = this.value();
      multSpans[this.index].html("MULT "+this.value().toFixed(2));
    });
    var labelRow = createDiv();
    labelRow.style('margin-top','-2px');
    labelRow.style('margin-bottom','-8px');
    for (var j=0;j<ops;j++) {
      var content = (j==i) ? "FB" : "OP"+(j+1);
      var label = createDiv(content);
      label.style('width','64px');
      label.class('mod');
      label.parent(labelRow);
    }
    var label = createDiv("OUT");
    label.style('width','128px');
    label.class('mod');
    label.parent(labelRow);
    var modRow = createDiv();
    for (var j=0;j<ops;j++) {
      mod[i][j] = 0;
      modSliders[i][j] = createSlider(0, 1, 0, 0.01);
      modSliders[i][j].style('width', '64px');
      modSliders[i][j].index = [i,j];
      modSliders[i][j].input(function(){mod[this.index[0]][this.index[1]]=this.value();});
      modSliders[i][j].parent(modRow);
    }
    var outAmount = 
    outSliders[i] = createSlider(0, 1, outs[i], 0.01);
    outSliders[i].style('width', '128px');
    outSliders[i].index = i;
    outSliders[i].input(function(){outs[this.index]=this.value();});
    outSliders[i].parent(modRow);
    titleRow.parent(operatorDiv);
    amplitudeRow.parent(operatorDiv);
    phaseRow.parent(operatorDiv);
    multiplierRow.parent(operatorDiv);
    labelRow.parent(operatorDiv);
    modRow.parent(operatorDiv);
    operatorDiv.parent(operatorGrid);
  }
  
  // draw wave boxes //
  redrawWaves();
  
  // add macro slider//
  createSpan("<br/>Macro: ");
  modslider = createSlider(0, 1, macro, 0.01);
  modslider.style('width', '209px');
  modslider.input(function(){macro=this.value();});
  // add generate button //
  createSpan(" ");
  var btn = createButton("Generate");
  btn.mousePressed(function(){
    var s = "";
    for (var i=0;i<64;i++) {
      macro = i/63;
      var wavetable = fm();
      for (var j=0;j<wavetable.length;j++) {
        s += wavetable[j]+" ";
      }
      s += "; \n";
    }
    textarea.elt.value = s;
  });
  // add textarea //
  createSpan("<br/>").style('line-height','0.0');
  textarea = createElement('textarea');
  textarea.elt.readOnly = true;
  textarea.style('width', '325px');
  textarea.style('resize', 'vertical');
  textarea.style('margin-bottom', '-5px');
  textarea.elt.onclick = function(){textarea.elt.select();document.execCommand('copy');}
  createSpan("<br/>Waveform ").style("line-height","0px");
  // add output //
  out = createInput();
  out.elt.readOnly = true;
  out.style('width','253px');
  out.style('vertical-align','middle');
  out.style('font-family','monospace');
  out.elt.onclick = function(){out.elt.select();document.execCommand('copy');}
  createDiv("<br/><b>NOTE: This tool is incomplete! Export compatability not guaranteed! Use with caution!<br/>");
  
  // patch export //
  var buttonExport = createButton("Export Patch");
  buttonExport.mousePressed(function(){
    var data = [];
    data.push("F".charCodeAt(0));
    data.push("M".charCodeAt(0));
    data.push(0x01);
    data.push(ops);
    data.push(length);
    for (var i=0;i<ops;i++) {
      data.push(Math.floor(amp[i]*20));
      data.push(ampmod[i]?1:0);
      data.push(Math.floor(phase[i]*100));
      data.push(phasemod[i]?1:0);
      data.push(mults[i]);
      data.push(0); // multmod
      data.push(waves[i]);
      for (var j=0;j<ops;j++) {
        data.push(Math.floor(mod[i][j]*100));
      }
      data.push(Math.floor(outs[i]*100));
    }
    var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    saveAs(URL.createObjectURL(file),"patch.eup");
    URL.revokeObjectURL(file);
  });
  
  var fileUpload = createFileInput(function(file){
    var reader = new FileReader();
    reader.addEventListener("load",_=>{
      var data = reader.result.split("").map(x=>x.charCodeAt(0));
      var pointer = 0;
      if (String.fromCharCode(data[pointer])+String.fromCharCode(data[pointer+1])=="WS") {
        alert("Invalid format. Expected FM patch, format is WaveSynth.");
        return;
      }
      if (String.fromCharCode(data[pointer])+String.fromCharCode(data[pointer+1])!="FM") {
        alert("Invalid format. Not FM patch format.");
        return;
      }
      pointer += 2;
      if (data[pointer]>1) {
        alert("File version too new! Expected version 1 or lower.");
        return;
      }
      pointer++;
      ops = data[pointer]; pointer++;
      reInit();
      length = data[pointer]; pointer++;
      for (var i=0;i<ops;i++) {
        amp[i] = data[pointer]/20; pointer++;
        ampmod[i] = (data[pointer]==1); pointer++;
        phase[i] = data[pointer]/100; pointer++;
        phasemod[i] = (data[pointer]==1); pointer++;
        mults[i] = data[pointer]; pointer++;
        pointer++;
        waves[i] = data[pointer]; pointer++;
        for (var j=0;j<ops;j++) {
          mod[i][j] = data[pointer]/100; pointer++;
          modSliders[i][j].elt.value = mod[i][j];
        }
        outs[i] = data[pointer]/100; pointer++;
        waveDropdowns[i].elt.value = waves[i];
        ampSliders[i].elt.value = amp[i];
        ampSpans[i].elt.innerHTML = "AMPLITUDE "+amp[i].toFixed(2);
        ampCheckboxes[i].elt.value = ampmod[i];
        phaseSliders[i].elt.value = phase[i];
        phaseSpans[i].elt.innerHTML = "PHASE "+phase[i].toFixed(2);
        phaseCheckboxes[i].elt.value = phasemod[i];
        multSliders[i].elt.value = mults[i];
        multSpans[i].elt.innerHTML = "MULT "+mults[i].toFixed(2);
        outSliders[i].elt.value = outs[i];
      }
      redrawWaves();
      resizeCanvas(length*4,61);
      lenslider.elt.value = length;
      lenspan.html("<br/>LENGTH: "+length);
    });
    reader.readAsBinaryString(file.file);
  });
  var fileLabel = createElement("label","Import Patch");
  fileUpload.elt.id = "import";
  fileUpload.style("display:none;");
  fileLabel.elt.setAttribute("for","import");
  var buttonImport = createButton("");
  fileUpload.parent(buttonImport);
  fileLabel.parent(buttonImport);
}

// every tick, do... //
function draw() {
  clear();
  fill(0);
  out.elt.value = "";
  var wavetable = fm();
  for (var i=0;i<wavetable.length;i++) {
    rect(i*4,(15-wavetable[i])*4,5,1);
    rect(i*4+4,(15-wavetable[i])*4,1,(wavetable[i]-wavetable[(i+1)%length])*4);
    out.elt.value += wavetable[i]+" ";
  }
}

// file saving //
function saveAs(uri, filename) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}

// reset everything //
function reInit() {
  oscillators = [];
  amp = [];
  phase = [];
  mults = [];
  ampmod = [];
  phasemod = [];
  waves = [];
  mod = [];
  outs = [];
  macro = 1;
  waveCanvases = [];
  waveDropdowns = [];
  ampSliders = [];
  ampSpans = [];
  ampCheckboxes = [];
  phaseSliders = [];
  phaseSpans = [];
  phaseCheckboxes = [];
  multSliders = [];
  multSpans = [];
  multCheckboxes = [];
  modSliders = [];
  outSliders = [];
  textarea = null;
  out = null;
  modslider = null;
  lenslider = null;
  lenspan = null;
  removeElements();
  setup();
}

// redraw waveforms //
function redrawWaves() {
  for (var i=0;i<waveCanvases.length;i++) {
    var ctx = waveCanvases[i].elt.getContext("2d");
    ctx.clearRect(0,0,32,16);
    for (var x=0;x<32;x++) {
      ctx.fill = "black";
      var sampleValue = Math.min(Math.max(Math.floor(waveList[waves[i]](x*Math.PI/16)*7.5+8),0),15);
      var sampleValueNext = Math.min(Math.max(Math.floor(waveList[waves[i]]((x+1)%32*Math.PI/16)*7.5+8),0),15);
      ctx.fillRect(x,15-sampleValue,1,1);
      if (sampleValueNext-sampleValue > 1) {
        ctx.fillRect(x,15-sampleValue,1,sampleValue-sampleValueNext);
      } else if (sampleValueNext-sampleValue < 0) {
        ctx.fillRect(x,15-sampleValue,1,sampleValue-sampleValueNext);
      }
    }
  }
}
