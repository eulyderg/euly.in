var _S = `{"author":"","full_normalize":false,"groups":[{"components":[{"interpolation":1,"interpolation_style":1,"keyframes":[`;
var _wS = `{"position":`;
var _wM = `,"wave_data":"`;
var _wE = `"}`;
var _E = `],"type":"Wave Source"}]}],"name":"Init","remove_all_dc":false,"version":"1.0.7"}`;

///////////////////////////
// variable declarations //
///////////////////////////

function Uint8ToString(u8a){
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
  }
  return c.join("");
}
// modulo fix //
function modulo(a,b) {return ((a % b) + b) % b;}
// waveform functions //
var sine = function(x) {return Math.sin(x);}
var sine_rectified = function(x) {return Math.max(Math.sin(x),0);}
var triangle_wave = function(x) {return 1-2*Math.abs(modulo(x,Math.PI*2)/Math.PI-1);}
var sawtooth = function(x) {return modulo(x,Math.PI*2)/Math.PI-1;}
var square_wave = function(x) {return (modulo(x,Math.PI*2)>=Math.PI)?1:-1;}
var waveList = [sine,sine_rectified,triangle_wave,sawtooth,square_wave];
var waveNames = ["Sine","Rectified Sine","Triangle","Sawtooth","Square"];

// global parameters //
var ops = 2;       // number of operators
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
var length = 2048; // wavetable length
var step = 64;     // macro step count
var n163length = 64;

// elements //
var waveCanvases = [];
var waveDropdowns = [];
var ampSliders = [];
var ampSpans = [];
var ampModSliders = [];
var phaseSliders = [];
var phaseSpans = [];
var phaseModSliders = [];
var multSliders = [];
var multSpans = [];
var multModSliders = [];
var modSliders = [];
var outSliders = [];
var textareaVital, textareaN163, textareaFDS;
var modslider;
var length163;
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
    var finalphase = modulo(phase[this.id] + phasemod[this.id] * macro,1)/mults[this.id];
    this.phase = finalphase;
    this.prev = 0;
    this.curr = 0;
    this.out = 0;
  }
  // clock one sample //
  clock() {
    var finalamp = Math.max(Math.min(amp[this.id] + ampmod[this.id] * macro, 8),0);
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
  var wt = [];
  for (var i=0;i<ops;i++) {oscillators[i].resetphase();}
  for (var x=0;x<length*3;x++) {
    for (var i=0;i<ops;i++) {oscillators[i].clock();}
    for (var i=0;i<ops;i++) {oscillators[i].clockend();}
  }
  for (var x=0;x<length;x++) {
    wt[x] = 0;
    for (var i=0;i<ops;i++) {wt[x]+=oscillators[i].clock()*outs[i];}
    for (var i=0;i<ops;i++) {oscillators[i].clockend();}
  }
  return wt;
}


///////////////
// main code //
///////////////

function setup() {
  var topBar = createDiv();
  topBar.class("top");
  if (!canvasEl) {canvasEl = createCanvas(512, 129);}
  canvasEl.parent(topBar);
  noStroke();
  noLoop();
  
  // add operators //
  var operatorGrid = createDiv();
  operatorGrid.class("grid");
  for (var i=0;i<ops;i++) {
    // set variables //
    amp[i] = 1;
    ampmod[i] = 0;
    phase[i] = 0;
    phasemod[i] = 0;
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
      redraw();
    })
    var amplitudeRow = createDiv();
    amplitudeRow.style('margin-bottom','-4px');
    ampSliders[i] = createSlider(0, 8, 1, 0.05);
    ampSliders[i].style('width', '256px');
    ampSliders[i].index = i;
    ampSliders[i].parent(amplitudeRow);
    ampModSliders[i] = createSlider(-8, 8, 0, 0.125);
    ampModSliders[i].style('width', '64px');
    ampModSliders[i].index = i;
    ampModSliders[i].parent(amplitudeRow);
    ampModSliders[i].elt.setAttribute("list","dlampmod"+i);
    ampModSliders[i].input(function(){ampmod[this.index]=parseFloat(this.elt.value);redraw();});
    var ampmoddatalist = createElement("datalist");
    ampmoddatalist.elt.id = "dlampmod"+i;
    var ampmoddatalistOption = createElement("option");
    ampmoddatalistOption.elt.value = "0";
    ampmoddatalistOption.parent(ampmoddatalist);
    ampSpans[i] = createSpan("AMPLITUDE 1.00");
    ampSpans[i].style("font-size","12px");
    ampSpans[i].parent(amplitudeRow);
    ampSliders[i].input(function(){
      amp[this.index] = parseFloat(this.value());
      ampSpans[this.index].html("AMPLITUDE "+this.value().toFixed(2));
      redraw();
    });
    var phaseRow = createDiv();
    phaseRow.style('margin-bottom','-4px');
    phaseSliders[i] = createSlider(0, 1, 0, 0.01);
    phaseSliders[i].style('width', '256px');
    phaseSliders[i].index = i;
    phaseSliders[i].parent(phaseRow);
    phaseModSliders[i] = createSlider(-1, 1, 0, 0.0625);
    phaseModSliders[i].style('width', '64px');
    phaseModSliders[i].index = i;
    phaseModSliders[i].parent(phaseRow);
    phaseModSliders[i].elt.setAttribute("list","dlphasemod"+i);
    phaseModSliders[i].input(function(){phasemod[this.index]=parseFloat(this.elt.value);redraw();});
    var phasemoddatalist = createElement("datalist");
    phasemoddatalist.elt.id = "dlphasemod"+i;
    var phasemoddatalistOption = createElement("option");
    phasemoddatalistOption.elt.value = "0";
    phasemoddatalistOption.parent(phasemoddatalist);
    phaseSpans[i] = createSpan("PHASE 0.00");
    phaseSpans[i].style("font-size","12px");
    phaseSpans[i].parent(phaseRow);
    phaseSliders[i].input(function(){
      phase[this.index] = parseFloat(this.value());
      phaseSpans[this.index].html("PHASE "+this.value().toFixed(2));
      redraw();
    });
    var multiplierRow = createDiv();
    multiplierRow.style('margin-bottom','-4px');
    multSliders[i] = createSlider(0, 32, 1, 1);
    multSliders[i].style('width', '256px');
    multSliders[i].index = i;
    multSliders[i].parent(multiplierRow);
    multModSliders[i] = createSlider(-1, 1, 0, 0.0625);
    multModSliders[i].style('width', '64px');
    multModSliders[i].elt.disabled = true;
    multModSliders[i].parent(multiplierRow);
    multModSliders[i].elt.value = -1;
    multSpans[i] = createSpan("MULT 1.00");
    multSpans[i].style("font-size","12px");
    multSpans[i].parent(multiplierRow);
    multSliders[i].input(function(){
      mults[this.index] = parseInt(this.value());
      multSpans[this.index].html("MULT "+this.value().toFixed(2));
      redraw();
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
      modSliders[i][j].input(function(){mod[this.index[0]][this.index[1]]=parseFloat(this.value());redraw();});
      modSliders[i][j].parent(modRow);
    }
    var outAmount = 
    outSliders[i] = createSlider(0, 1, outs[i], 0.01);
    outSliders[i].style('width', '128px');
    outSliders[i].index = i;
    outSliders[i].input(function(){outs[this.index]=parseFloat(this.value());redraw();});
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
  createElement("br");
  var stepSpinbox = createElement("input");
  stepSpinbox.elt.setAttribute("type","number");
  stepSpinbox.elt.value = step;
  stepSpinbox.elt.step = 1;
  stepSpinbox.elt.max = 64;
  stepSpinbox.elt.min = 2;
  stepSpinbox.style("width","48px");
  stepSpinbox.elt.onchange = function(e){step=e.target.value;}
  createSpan(" Keyframes");
  createElement("br");
  length163 = createElement("input");
  length163.elt.setAttribute("type","number");
  length163.elt.value = n163length;
  length163.elt.step = 4;
  length163.elt.max = 240;
  length163.elt.min = 4;
  length163.style("width","48px");
  length163.elt.onchange = function(e){n163length=e.target.value;}
  createSpan(" N163 Wave Length");
  createSpan("<br/>Macro: ");
  modslider = createSlider(0, 1, macro, 0.01);
  modslider.style('width', '209px');
  modslider.input(function(){macro=parseFloat(this.value());redraw();});
  // add generate button //
  createSpan(" ");
  var btn = createButton("Generate");
  btn.mousePressed(function(){
    var macroprev = macro;
    var s = _S;
    for (var i=0;i<step;i++) {
      macro = i/(step-1);
      var wavetable = fm();
      var float_array32 = new Float32Array(wavetable);
      for (var j=0;j<wavetable.length;j++) {
        float_array32[i] = wavetable[i];
      }
      var uint_array8 = new Uint8Array(float_array32.buffer);
      var str = btoa(Uint8ToString(uint_array8));
      s += _wS+macro*256+_wM+str+_wE;
      if (i<(step-1)) {
        s+=",";
      }
    }
    s += _E;
    textareaVital.elt.value = s;
    s = "";
    length = n163length;
    for (var i=0;i<step;i++) {
      macro = i/(step-1);
      var wavetable = fm();
      for (var j=0;j<n163length;j++) {
        s += Math.floor(7.5*wavetable[j]+8)+" ";
      }
      s+=";\n";
    }
    textareaN163.elt.value = s;
    s = "";
    macro = macroprev;
    length = 64;
    var wavetable = fm();
    for (var j=0;j<64;j++) {
      s += Math.floor(31.5*wavetable[j]+32)+" ";
    }
    textareaFDS.elt.value = s;
    length = 2048;
  });
  // add textarea //
  createSpan("<br/>").style('line-height','0.0');
  textareaVital = createElement('textarea');
  textareaVital.elt.readOnly = true;
  textareaVital.style('width', '325px');
  textareaVital.style('resize', 'vertical');
  textareaVital.style('margin-bottom', '-5px');
  textareaVital.elt.onclick = function(){textareaVital.elt.select();document.execCommand('copy');}
  var vitaltext = createSpan("<b>Vital</b>");
  vitaltext.elt.setAttribute("class","nametext");
  createSpan("<br/>").style('line-height','0.0');
  textareaN163 = createElement('textarea');
  textareaN163.elt.readOnly = true;
  textareaN163.style('width', '325px');
  textareaN163.style('resize', 'vertical');
  textareaN163.style('margin-bottom', '-5px');
  textareaN163.elt.onclick = function(){textareaN163.elt.select();document.execCommand('copy');}
  var n163text = createSpan("<b>N163</b>");
  n163text.elt.setAttribute("class","nametext");
  createSpan("<br/>").style('line-height','0.0');
  textareaFDS = createElement('textarea');
  textareaFDS.elt.readOnly = true;
  textareaFDS.style('width', '325px');
  textareaFDS.style('resize', 'vertical');
  textareaFDS.style('margin-bottom', '-5px');
  textareaFDS.elt.onclick = function(){textareaFDS.elt.select();document.execCommand('copy');}
  var fdstext = createSpan("<b>FDS</b>");
  fdstext.elt.setAttribute("class","nametext");
  
  createSpan("<br/><br/><b>File Exports: </b>");
  // patch export //
  createElement("br");
  var buttonDMWExport = createButton("Export .dmw");
  createElement("br");
  var buttonVITALExport = createButton("Export .vitaltable");
  createElement("br");
  var buttonN163Export = createButton("Export .n163.txt");
  createElement("br");
  var buttonFDSExport = createButton("Export .fds.txt");
  buttonDMWExport.elt.classList.add("export");
  buttonVITALExport.elt.classList.add("export");
  buttonN163Export.elt.classList.add("export");
  buttonFDSExport.elt.classList.add("export");
  buttonDMWExport.mousePressed(function(){
    var wavetable = fm();
    var data = [];
    data.push(0x00);
    data.push(0x00);
    data.push((length&0x0000FF00)>>8);
    data.push((length&0x000000FF));
    data.push(0xFF);
    data.push(0x01);
    data.push(0xFF);
    for (var i=0;i<length;i++) {
      data.push(0x00);
      data.push(0x00);
      data.push(0x00);
      data.push(Math.min(Math.max(Math.floor(127.5*(wavetable[i]+1)),0),255));
    }
    var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    saveAs(URL.createObjectURL(file),"wave.dmw");
    URL.revokeObjectURL(file);
  });
  buttonVITALExport.mousePressed(function(){
    var macroprev = macro;
    var s = _S;
    for (var i=0;i<step;i++) {
      macro = i/(step-1);
      var wavetable = fm();
      var float_array32 = new Float32Array(wavetable);
      for (var j=0;j<wavetable.length;j++) {
        float_array32[i] = wavetable[i];
      }
      var uint_array8 = new Uint8Array(float_array32.buffer);
      var str = btoa(Uint8ToString(uint_array8));
      s += _wS+macro*256+_wM+str+_wE;
      if (i<(step-1)) {
        s+=",";
      }
    }
    s += _E;
    macro = macroprev;
    var data = s.split("").map(x=>x.charCodeAt(0));
    var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    saveAs(URL.createObjectURL(file),"wave.vitaltable");
    URL.revokeObjectURL(file);
  });
  buttonN163Export.mousePressed(function(){
    var s = "";
    var macroprev = macro;
    length = n163length;
    for (var i=0;i<step;i++) {
      macro = i/(step-1);
      var wavetable = fm();
      for (var j=0;j<n163length;j++) {
        s += Math.floor(7.5*wavetable[j]+8)+" ";
      }
      s+=";\n";
    }
    length = 2048;
    var macro = macroprev;
    var data = s.split("").map(x=>x.charCodeAt(0));
    var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    saveAs(URL.createObjectURL(file),"wave.n163.txt");
    URL.revokeObjectURL(file);
  });
  buttonFDSExport.mousePressed(function(){
    var s = "";
    length = 64;
    var wavetable = fm();
    for (var j=0;j<64;j++) {
      s += Math.floor(31.5*wavetable[j]+32)+" ";
    }
    length = 2048;
    var data = s.split("").map(x=>x.charCodeAt(0));
    var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    saveAs(URL.createObjectURL(file),"wave.fds.txt");
    URL.revokeObjectURL(file);
  });
  createElement("br");
  
  // patch export //
  var buttonExport = createButton("Export Patch");
  buttonExport.mousePressed(function(){
    var data = [];
    data.push("F".charCodeAt(0));
    data.push("M".charCodeAt(0));
    data.push(0x02);
    data.push(ops);
    data.push(0x00);
    for (var i=0;i<ops;i++) {
      data.push(Math.floor(amp[i]*20));
      data.push(Math.floor((ampmod[i]+8)*8));
      console.log(ampmod[i],(ampmod[i]+8),(ampmod[i]+8)*8);
      data.push(Math.floor(phase[i]*100));
      data.push(Math.floor((phasemod[i]+1)*16));
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
      if (data[pointer]==1) {
        pointer++;
        ops = data[pointer]; pointer++;
        reInit();
        
        length = 2048;
        n163length = data[pointer];
        length163.elt.value = data[pointer]; pointer++;
        for (var i=0;i<ops;i++) {
          var amptemp = data[pointer]/20; pointer++;
          var ampmodtemp = (data[pointer]==1); pointer++;
          amp[i] = (ampmodtemp)?0:amptemp;
          ampmod[i] = (ampmodtemp)?amptemp:0;
          var phasetemp = data[pointer]/100; pointer++;
          var phasemodtemp = (data[pointer]==1); pointer++;
          phase[i] = (phasemodtemp)?0:phasetemp;
          phasemod[i] = (phasemodtemp)?phasetemp:0;
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
          ampModSliders[i].elt.value = ampmod[i];
          phaseSliders[i].elt.value = phase[i];
          phaseSpans[i].elt.innerHTML = "PHASE "+phase[i].toFixed(2);
          phaseModSliders[i].elt.value = phasemod[i];
          multSliders[i].elt.value = mults[i];
          multSpans[i].elt.innerHTML = "MULT "+mults[i].toFixed(2);
          outSliders[i].elt.value = outs[i];
        }
        redrawWaves();
        redraw();
        //resizeCanvas(length*4,61);
        //lenslider.elt.value = length;
        //lenspan.html("<br/>LENGTH: "+length);
        return;
      }
      if (data[pointer]>2) {
        alert("File version too new! Expected version 2 or lower.");
        return;
      }
      pointer++;
      ops = data[pointer]; pointer++;
      reInit();
      //length = data[pointer]; pointer++;
      length = 2048; pointer++;
      for (var i=0;i<ops;i++) {
        amp[i] = data[pointer]/20; pointer++;
        console.log(data[pointer],data[pointer]/8-8);
        ampmod[i] = data[pointer]/8-8; pointer++;
        phase[i] = data[pointer]/100; pointer++;
        phasemod[i] = data[pointer]/16-1; pointer++;
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
        ampModSliders[i].elt.value = ampmod[i];
        phaseSliders[i].elt.value = phase[i];
        phaseSpans[i].elt.innerHTML = "PHASE "+phase[i].toFixed(2);
        phaseModSliders[i].elt.value = phasemod[i];
        multSliders[i].elt.value = mults[i];
        multSpans[i].elt.innerHTML = "MULT "+mults[i].toFixed(2);
        outSliders[i].elt.value = outs[i];
      }
      redrawWaves();
      redraw();
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
  buttonExport.elt.classList.add("import");
  buttonImport.elt.classList.add("import");
}

// every tick, do... //
function draw() {
  clear();
  fill(0);
  wavetable = fm();
  for (var i=0;i<wavetable.length;i++) {
    var x1 = Math.floor(i/4);
    var x2 = Math.floor((i+1)/4);
    var y1 = Math.floor(64-wavetable[i]*64+0.5);
    var y2 = Math.floor(64-wavetable[(i+1)%length]*64+0.5);
    rect(x1,y1,1,1);
    rect(x2,y1,1,y2-y1);
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
  ampModSliders = [];
  phaseSliders = [];
  phaseSpans = [];
  phaseModSliders = [];
  multSliders = [];
  multSpans = [];
  multModSliders = [];
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
