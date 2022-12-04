var GFX = {};

var characterSpacingUppercase = [
//A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
  5,5,5,5,5,5,6,5,4,5,5,5,7,6,5,5,6,5,5,5,5,5,7,5,6,6
];
var characterSpacingLowercase = [
//a b c d e f g h i j k l m n o p q r s t u v w x y z
  5,5,5,5,5,6,5,5,4,4,5,4,7,5,5,5,5,5,5,4,5,5,7,5,5,5
];
var letterWidth = function(letter) {
  var letterList = "abcdefghijklmnopqrstuvwxyz".split("");
  var LUT = {};
  for (var i=0;i<letterList.length;i++) {
    LUT[letterList[i]] = i;
  }
  if (letter == " ") {return 3;}
  else if (letter.toLowerCase()==letter) {return characterSpacingLowercase[LUT[letter]]+1;}
  else {return characterSpacingUppercase[LUT[letter.toLowerCase()]]+1;}
}

var windows = [];

class ElementSlider {
  constructor(parent,x,y,width,step,min,max,init) {
    this.parent = parent;
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.width = width ? width : 100;
    this.step = step ? step : 1;
    this.min = min ? min : 0;
    this.max = max ? max : 63;
    this._value = init;
    this.init = init;
    this.type = "slider";
    this.onchange = function(e){};
  }
  draw() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    fill(255);
    rect(x,y+1,this.width,4);
    fill(0);
    rect(x+1,y,this.width-2,1);
    rect(x+1,y+5,this.width-2,1);
    rect(x,y+1,1,4);
    rect(x+this.width-1,y+1,1,4);
    var mouseWindow;
    for (var i=windows.length-1;i>=0;i--) {
      if (mouseX>=windows[i].x&&mouseX<=windows[i].x+windows[i].width&&mouseY>=windows[i].y&&mouseY<=windows[i].y+windows[i].height) {
        mouseWindow = windows[i];
        break;
      }
    }
    var mouseElement;
    if (mouseWindow) {
      for (var i=mouseWindow.elements.length-1;i>=0;i--) {
        if (mouseWindow.elements[i].type=="slider") {
          var thumb = mouseWindow.elements[i].getThumb();
          var track = mouseWindow.elements[i].getTrack();
          if (mouseX>=thumb.x&&mouseX<thumb.x+thumb.width&&mouseY>=thumb.y&&mouseY<thumb.y+thumb.height) {
            mouseElement = mouseWindow.elements[i];
            break;
          } else if (mouseX>=track.x&&mouseX<track.x+track.width&&mouseY>=track.y&&mouseY<track.y+track.height) {
            mouseElement = mouseWindow.elements[i];
            break;
          }
        }
      }
    }
    var thumbX = Math.floor(x + ((this.width-8) * (this.value-this.min)/(this.max-this.min)));
    var thumbY = y-3;
    if ((mouseX>=thumbX&&mouseX<thumbX+8&&mouseY>=thumbY&&mouseY<thumbY+12&&!mouseDragWindow&&mouseWindow==this.parent&&mouseElement==this&&!(mouseDragEl!=this&&mouseDragEl!=null)) || mouseDragEl == this) {
      image(GFX.slider_thumb_,thumbX,thumbY);
    } else {
      image(GFX.slider_thumb,thumbX,thumbY);
    }
  }
  getTrack() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    
    var track = {};
    track.x = x;
    track.y = y;
    track.width = this.width;
    track.height = 6;
    
    return track;
  }
  getThumb() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    
    var thumb = {};
    thumb.x = Math.floor(x + ((this.width-8) * (this.value-this.min)/(this.max-this.min)));
    thumb.y = y-3;
    thumb.width = 8;
    thumb.height = 12;
    
    return thumb;
  }
  convertX(x) {
    var mainx = this.x + this.parent.x+2;
    var value = Math.floor(((x - mainx)*(this.max-this.min)/(this.width-8)+this.min)/this.step+0.5)*this.step;
    if (value < this.min) {value = this.min;}
    if (value > this.max) {value = this.max;}
    return value;
  }
  get value() {
    return this._value;
  }
  set value(val) {
    var e = {};
    e.value = val;
    e.target = this;
    this._value = val;
    this.onchange(e);
    updateFinalValues();
  }
}
class ElementKnob {
  constructor(parent,x,y,min,max) {
    this.parent = parent;
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.min = min ? min : -1;
    this.max = max ? max : 1;
    this._value = 0;
    this.type = "knob";
    this.onchange = function(e){};
  }
  draw() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    fill(0);
    image(GFX.wheel,x,y);
    for (var i=0;i<16;i++) {
      for (var j=0;j<16;j++) {
        var valueAngle = 180 * this.value / this.max;
        var radiusMax = 6;
        var radiusMin = 1;
        var pointAngle = (Math.atan2(i-7.5,7.5-j) * 180 / Math.PI);
        var pointRadius = Math.sqrt((i-7.5)**2+(j-7.5)**2);
        if (pointRadius >= radiusMin && pointRadius <= radiusMax) {
          if ((this.value<0&&pointAngle>=valueAngle&&pointAngle<0) || (this.value>0&&pointAngle<=valueAngle&&pointAngle>0)) {
            rect(x+i,y+j,1,1);
          }
        }
      }
    }
  }
  getBody() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    var body = {};
    body.x = x;
    body.y = y;
    body.width = 16;
    body.height = 16;
    return body;
  }
  get value() {
    return this._value;
  }
  set value(val) {
    var e = {};
    e.value = val;
    e.target = this;
    this._value = val;
    this.onchange(e);
    updateFinalValues();
  }
}
class ElementButtonCopy {
  constructor(parent,x,y) {
    this.parent = parent;
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.type = "buttoncopy";
    this.onclick = function(e){};
  }
  draw() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    fill(0);
    if (mouseDragEl==this) {
      image(GFX.button_copy_,x,y);
    } else {
      image(GFX.button_copy,x,y);
    }
  }
  getBody() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    var body = {};
    body.x = x;
    body.y = y;
    body.width = 27;
    body.height = 13;
    return body;
  }
  click() {
    var e = {};
    e.target = this;
    this.onclick(e);
  }
}
class ElementButtonDMW {
  constructor(parent,x,y) {
    this.parent = parent;
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.type = "buttondmw";
    this.onclick = function(e){};
  }
  draw() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    fill(0);
    if (mouseDragEl==this) {
      image(GFX.button_dmw_,x,y);
    } else {
      image(GFX.button_dmw,x,y);
    }
  }
  getBody() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    var body = {};
    body.x = x;
    body.y = y;
    body.width = 31;
    body.height = 13;
    return body;
  }
  click() {
    var e = {};
    e.target = this;
    this.onclick(e);
  }
}
class ElementText {
  constructor(parent,x,y,value) {
    this.parent = parent;
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.value = value;
    this.type = "text";
  }
  draw() {
    var x = this.x + this.parent.x+2;
    var y = this.y + this.parent.y+14;
    drawText(this.value,x,y);
  }
}

class ElementWindow {
  constructor(x,y,type) {
    this.x = x;
    this.y = y;
    this.width = 255;
    this.height = 255;
    this.type = type;
    this.closeButton = true;
    this.multiplier = 1;
    this.phase = 0;
    this.amplitude = 1;
    this.modulation = 1;
    this.pulseWidth = 0.5;
    this.distortion = 0;
    this.cutoff = 1;
    this.resonance = 0.5;
    this.mod_multiplier = 0;
    this.mod_phase = 0;
    this.mod_amplitude = 0;
    this.mod_modulation = 0;
    this.mod_pulseWidth = 0;
    this.mod_distortion = 0;
    this.mod_cutoff = 0;
    this.mod_resonance = 0;
    this.final_multiplier = 0;
    this.final_phase = 0;
    this.final_amplitude = 0;
    this.final_modulation = 0;
    this.final_pulseWidth = 0;
    this.final_distortion = 0;
    this.final_cutoff = 0;
    this.final_resonance = 0;
    this.title = "";
    this.elements = [];
    this.inputCount = 0;
    this.inputs = [];
    this.outputCount = 0;
    this.outputs = [];
    this.checkedOutputs = [];
    this.inputMapping = [];
    this.filterInputHistory = [];
    this.filterOutputHistory = [];
    this.filterNeedsUpdate = false;
    this.feedbackHistory = [];
    this.noiseTable = [];
    this.waveLength = 64;
    this.function = function(x,obj) {return 0;}
    this.updateFinalValues();
    
    if (this.type == "output") {
      this.width = 160;
      this.height = 78+18;
      var macroSlider = new ElementSlider(this,0,4,110,0.01,0,1,1);
      var lengthSlider = new ElementSlider(this,0,17,130,4,4,128,64);
      macroSlider.onchange = function(e){modulation = e.value;}
      lengthSlider.onchange = function(e){e.target.parent.waveLength = e.value;}
      this.appendNode(macroSlider);
      this.appendNode(lengthSlider);
      var buttonCopy = new ElementButtonCopy(this,this.width-3-29,0);
      buttonCopy.onclick = function(e){e.target.parent.createWavetables();}
      this.appendNode(buttonCopy);
      var buttonDMW = new ElementButtonDMW(this,0,65);
      buttonDMW.onclick = function(e){e.target.parent.createDMW();}
      this.appendNode(buttonDMW);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out += obj.inputs[0].function(x,obj.inputs[0]);
        }
        return out*obj.amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 0;
      this.title = "Output";
      this.closeButton = false;
    }
    if (this.type == "help") {
      this.width = 160;
      this.height = 340;
      var text = new ElementText(this,0,0,
"Hello!  This is an N163 \nmodular synth for\nDn-FamiTracker.\n\nMade by Eulous!\n\n- Keyboard Shortcuts -\n1 - Sine\n2 - Sawtooth\n3 - Triangle\n4 - Pulse\n5 - Noise\n6 - Pulse Noise\nShift+5 - Consistent Noise\nShift+6 - Consistent P. Noise\nM - Mixer\nShift+M - Splitter\nI - Inverter\nShift+R - Rectifier\nShift+D - Saturator\nF - PM Feedback\nP - PM\nR - RM\nG - Gainer\nS - Sync\nQ - Quantization\nB - Bitcrusher\nL - Lowpass Filter\nH - Highpass Filter\n\nDouble-click on a\ncontrol to reset it.");
      this.appendNode(text);
      this.inputCount = 0;
      this.outputCount = 0;
      this.title = "Help";
      this.closeButton = false;
    }
    if (this.type == "sine") {
      this.width = 160;
      this.height = 80;
      this.function = function(x,obj) {return Math.sin(x*obj.final_multiplier+obj.final_phase*Math.PI*2)*obj.final_amplitude;};
      var multSlider = new ElementSlider(this,0,4,110,1,0,12,1);
      var phaseSlider = new ElementSlider(this,0,17,110,0.01,0,1,0);
      var ampSlider = new ElementSlider(this,0,30,110,0.01,0,1,1);
      multSlider.onchange = function(e){e.target.parent.multiplier = e.value;}
      phaseSlider.onchange = function(e){e.target.parent.phase = e.value;}
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(multSlider);
      this.appendNode(phaseSlider);
      this.appendNode(ampSlider);
      var multKnob = new ElementKnob(this,0,this.height-32,-12,12);
      var phaseKnob = new ElementKnob(this,17,this.height-32,-1,1);
      var ampKnob = new ElementKnob(this,34,this.height-32,-1,1);
      multKnob.onchange = function(e){e.target.parent.mod_multiplier = e.value;}
      phaseKnob.onchange = function(e){e.target.parent.mod_phase = e.value;}
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(multKnob);
      this.appendNode(phaseKnob);
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Sine Oscillator";
    }
    if (this.type == "sawtooth") {
      this.width = 160;
      this.height = 80;
      this.function = function(x,obj) {return (modulo(((x/(Math.PI*2))*obj.final_multiplier+obj.final_phase),(1))*2-1)*obj.final_amplitude;};
      var multSlider = new ElementSlider(this,0,4,110,1,0,12,1);
      var phaseSlider = new ElementSlider(this,0,17,110,0.01,0,1,0);
      var ampSlider = new ElementSlider(this,0,30,110,0.01,0,1,1);
      multSlider.onchange = function(e){e.target.parent.multiplier = e.value;}
      phaseSlider.onchange = function(e){e.target.parent.phase = e.value;}
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(multSlider);
      this.appendNode(phaseSlider);
      this.appendNode(ampSlider);
      var multKnob = new ElementKnob(this,0,this.height-32,-12,12);
      var phaseKnob = new ElementKnob(this,17,this.height-32,-1,1);
      var ampKnob = new ElementKnob(this,34,this.height-32,-1,1);
      multKnob.onchange = function(e){e.target.parent.mod_multiplier = e.value;}
      phaseKnob.onchange = function(e){e.target.parent.mod_phase = e.value;}
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(multKnob);
      this.appendNode(phaseKnob);
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Sawtooth Oscillator";
    }
    if (this.type == "triangle") {
      this.width = 160;
      this.height = 80;
      this.function = function(x,obj) {
        return (1-Math.abs(modulo((x*obj.final_multiplier/(Math.PI*2)+obj.final_phase),1)*2-1)*2)*obj.final_amplitude;
      };
      var multSlider = new ElementSlider(this,0,4,110,1,0,12,1);
      var phaseSlider = new ElementSlider(this,0,17,110,0.01,0,1,0);
      var ampSlider = new ElementSlider(this,0,30,110,0.01,0,1,1);
      multSlider.onchange = function(e){e.target.parent.multiplier = e.value;}
      phaseSlider.onchange = function(e){e.target.parent.phase = e.value;}
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(multSlider);
      this.appendNode(phaseSlider);
      this.appendNode(ampSlider);
      var multKnob = new ElementKnob(this,0,this.height-32,-12,12);
      var phaseKnob = new ElementKnob(this,17,this.height-32,-1,1);
      var ampKnob = new ElementKnob(this,34,this.height-32,-1,1);
      multKnob.onchange = function(e){e.target.parent.mod_multiplier = e.value;}
      phaseKnob.onchange = function(e){e.target.parent.mod_phase = e.value;}
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(multKnob);
      this.appendNode(phaseKnob);
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Triangle Oscillator";
    }
    if (this.type == "noise") {
      this.width = 160;
      this.height = 54;
      this.updateNoise();
      this.function = function(x,obj) {
        return (this.noiseTable[Math.floor(modulo(x*256/(Math.PI*2),256))]*2-1)*obj.final_amplitude;
      };
      var ampSlider = new ElementSlider(this,0,4,110,0.01,0,1,1);
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(ampSlider);
      var ampKnob = new ElementKnob(this,0,this.height-32,-1,1);
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Random Noise";
    }
    if (this.type == "pulsenoise") {
      this.width = 160;
      this.height = 54;
      this.updateNoise();
      this.function = function(x,obj) {
        if (this.noiseTable[Math.floor(modulo(x*256/(Math.PI*2),256))]>0.5) {
          return obj.final_amplitude;
        } else {
          return -obj.final_amplitude;
        }
      };
      var ampSlider = new ElementSlider(this,0,4,110,0.01,0,1,1);
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(ampSlider);
      var ampKnob = new ElementKnob(this,0,this.height-32,-1,1);
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Random Pulse Noise";
    }
    if (this.type == "noiseconsistent") {
      this.width = 160;
      this.height = 54;
      this.updateNoise();
      this.function = function(x,obj) {
        return (this.noiseTable[Math.floor(modulo(x*256/(Math.PI*2),256))]*2-1)*obj.final_amplitude;
      };
      var ampSlider = new ElementSlider(this,0,4,110,0.01,0,1,1);
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(ampSlider);
      var ampKnob = new ElementKnob(this,0,this.height-32,-1,1);
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Consistent Noise";
    }
    if (this.type == "pulsenoiseconsistent") {
      this.width = 160;
      this.height = 54;
      this.updateNoise();
      this.function = function(x,obj) {
        if (this.noiseTable[Math.floor(modulo(x*256/(Math.PI*2),256))]>0.5) {
          return obj.final_amplitude;
        } else {
          return -obj.final_amplitude;
        }
      };
      var ampSlider = new ElementSlider(this,0,4,110,0.01,0,1,1);
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      this.appendNode(ampSlider);
      var ampKnob = new ElementKnob(this,0,this.height-32,-1,1);
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(ampKnob);
      this.outputCount = 1;
      this.title = "Consistent Pulse Noise";
    }
    if (this.type == "pulse") {
      this.width = 160;
      this.height = 93;
      this.function = function(x,obj) {
        var out = -1;
        if (modulo((x*obj.final_multiplier/(Math.PI*2)+obj.final_phase),1) >= obj.final_pulseWidth) {out=1;};
        return out*obj.final_amplitude;
      };
      var multSlider = new ElementSlider(this,0,4,110,1,0,12,1);
      var phaseSlider = new ElementSlider(this,0,17,110,0.01,0,1,0);
      var ampSlider = new ElementSlider(this,0,30,110,0.01,0,1,1);
      var widthSlider = new ElementSlider(this,0,43,110,0.01,0,1,0.5);
      multSlider.onchange = function(e){e.target.parent.multiplier = e.value;}
      phaseSlider.onchange = function(e){e.target.parent.phase = e.value;}
      ampSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      widthSlider.onchange = function(e){e.target.parent.pulseWidth = e.value;}
      this.appendNode(multSlider);
      this.appendNode(phaseSlider);
      this.appendNode(ampSlider);
      this.appendNode(widthSlider);
      var multKnob = new ElementKnob(this,0,this.height-32,-12,12);
      var phaseKnob = new ElementKnob(this,17,this.height-32,-1,1);
      var ampKnob = new ElementKnob(this,34,this.height-32,-1,1);
      var widthKnob = new ElementKnob(this,51,this.height-32,-1,1);
      multKnob.onchange = function(e){e.target.parent.mod_multiplier = e.value;}
      phaseKnob.onchange = function(e){e.target.parent.mod_phase = e.value;}
      ampKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      widthKnob.onchange = function(e){e.target.parent.mod_pulseWidth = e.value;}
      this.appendNode(multKnob);
      this.appendNode(phaseKnob);
      this.appendNode(ampKnob);
      this.appendNode(widthKnob);
      this.outputCount = 1;
      this.title = "Pulse Oscillator";
    }
    if (this.type == "mixer") {
      this.width = 70;
      this.height = 50;
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out += obj.inputs[0].function(x,obj.inputs[0]);
        }
        if (obj.inputs[1]) {
          out += obj.inputs[1].function(x,obj.inputs[1]);
        }
        if (obj.inputs[2]) {
          out += obj.inputs[2].function(x,obj.inputs[2]);
        }
        if (obj.inputs[3]) {
          out += obj.inputs[3].function(x,obj.inputs[3]);
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 4;
      this.outputCount = 1;
      this.title = "Mixer";
    }
    if (this.type == "inverter") {
      this.width = 70;
      this.height = 50;
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out += -obj.inputs[0].function(x,obj.inputs[0]);
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Inverter";
    }
    if (this.type == "rectifier") {
      this.width = 70;
      this.height = 50;
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out = Math.max(obj.inputs[0].function(x,obj.inputs[0]),0);
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Rectifier";
    }
    if (this.type == "saturator") {
      this.width = 70;
      this.height = 50;
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out = 2/(1+Math.E**(-2*obj.inputs[0].function(x,obj.inputs[0])))-1;
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Saturator";
    }
    if (this.type == "phasemodulation") {
      this.width = 140;
      this.height = 75;
      var modSlider = new ElementSlider(this,3,4,130,0.1,0,16,1);
      this.appendNode(modSlider);
      modSlider.onchange = function(e){e.target.parent.modulation = e.value;}
      var modKnob = new ElementKnob(this,0,this.height-32,-16,16);
      modKnob.onchange = function(e){e.target.parent.mod_modulation = e.value;}
      this.appendNode(modKnob);
      this.function = function(x,obj) {
        var mod = 0;
        var out = 0;
        if (obj.inputs[1]) {
          mod = obj.inputs[1].function(x,obj.inputs[1]);
        }
        if (obj.inputs[0]) {
          out = obj.inputs[0].function(x+mod*obj.final_modulation,obj.inputs[0]);
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 2;
      this.outputCount = 1;
      this.title = "Phase Modulation";
    }
    if (this.type == "ringmodulation") {
      this.width = 140;
      this.height = 75;
      var modSlider = new ElementSlider(this,3,4,130,0.01,0,1,1);
      this.appendNode(modSlider);
      modSlider.onchange = function(e){e.target.parent.modulation = e.value;}
      var modKnob = new ElementKnob(this,0,this.height-32,-1,1);
      modKnob.onchange = function(e){e.target.parent.mod_modulation = e.value;}
      this.appendNode(modKnob);
      this.function = function(x,obj) {
        var op1 = 1;
        var op2 = 1;
        if (obj.inputs[0]) {
          op1 = obj.inputs[0].function(x,obj.inputs[0]);
        }
        if (obj.inputs[1]) {
          op2 = obj.inputs[1].function(x,obj.inputs[1])*obj.final_modulation + (1-obj.final_modulation);
        }
        if (!obj.inputs[0]&&!obj.inputs[1]) {
          op1 = 0;
        }
        return op1*op2*obj.final_amplitude;
      };
      this.inputCount = 2;
      this.outputCount = 1;
      this.title = "Ring Modulation";
    }
    if (this.type == "splitter") {
      this.width = 70;
      this.height = 50;
      this.function = function(x,obj) {
        return ((obj.inputs[0]) ? obj.inputs[0].function(x,obj.inputs[0])*obj.final_amplitude : 0);
      };
      this.inputCount = 1;
      this.outputCount = 4;
      this.title = "Splitter";
    }
    if (this.type == "gainer") {
      this.width = 140;
      this.height = 75;
      var amplitudeSlider = new ElementSlider(this,3,4,130,0.1,0,4,1);
      this.appendNode(amplitudeSlider);
      amplitudeSlider.onchange = function(e){e.target.parent.amplitude = e.value;}
      var amplitudeKnob = new ElementKnob(this,0,this.height-32,-4,4);
      amplitudeKnob.onchange = function(e){e.target.parent.mod_amplitude = e.value;}
      this.appendNode(amplitudeKnob);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out = obj.inputs[0].function(x,obj.inputs[0]);
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Gainer";
    }
    if (this.type == "syncer") {
      this.width = 140;
      this.height = 75;
      var modSlider = new ElementSlider(this,3,4,130,0.1,0,16,1);
      this.appendNode(modSlider);
      modSlider.onchange = function(e){e.target.parent.modulation = e.value;}
      var modKnob = new ElementKnob(this,0,this.height-32,-16,16);
      modKnob.onchange = function(e){e.target.parent.mod_modulation = e.value;}
      this.appendNode(modKnob);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          out = obj.inputs[0].function(x*obj.final_modulation%(Math.PI*2),obj.inputs[0]);
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Sync";
    }
    if (this.type == "feedback") {
      this.width = 140;
      this.height = 75;
      this.modulation = 0;
      var modSlider = new ElementSlider(this,3,4,130,0.01,0,2,0);
      this.appendNode(modSlider);
      modSlider.onchange = function(e){e.target.parent.modulation = e.value;}
      var modKnob = new ElementKnob(this,0,this.height-32,-2,2);
      modKnob.onchange = function(e){e.target.parent.mod_modulation = e.value;}
      this.appendNode(modKnob);
      this.osc_phase = 0;
      this.osc_prev = 0;
      this.filterNeedsUpdate = true;
      this.function = function(x,obj) {
        var out = 0;
        var deltaT = 1/(256*4*4);
        if (obj.filterNeedsUpdate) {
          if (obj.inputs[0]) {
            obj.osc_phase = 0;
            obj.osc_prev = 0;
            for (var i=0;i<Math.PI*2;i+=deltaT) {
              obj.osc_phase += deltaT + (obj.inputs[0].function(obj.osc_phase,obj.inputs[0])-obj.osc_prev)*obj.final_modulation;
              obj.osc_prev = out;
              out = obj.inputs[0].function(obj.osc_phase,obj.inputs[0]);
              obj.feedbackHistory[Math.floor(i/deltaT)] = out;
            }
          } else {
            for (var i=0;i<Math.PI*2;i+=deltaT) {
              obj.feedbackHistory[Math.floor(i/deltaT)] = 0;
            }
          }
          obj.filterNeedsUpdate = false;
        }
        return obj.feedbackHistory[Math.floor(modulo(x,Math.PI*2)/deltaT)]*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "PM Feedback";
    }
    if (this.type == "quantizer") {
      this.width = 140;
      this.height = 75;
      this.distortion = 1;
      var distortionSlider = new ElementSlider(this,3,4,130,0.01,0,1,1);
      this.appendNode(distortionSlider);
      distortionSlider.onchange = function(e){e.target.parent.distortion = e.value;}
      var distortionKnob = new ElementKnob(this,0,this.height-32,-1,1);
      distortionKnob.onchange = function(e){e.target.parent.mod_distortion = e.value;}
      this.appendNode(distortionKnob);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          if (this.final_distortion<1) {
            for (var i=0;i<x;i+=(1-this.final_distortion)*Math.PI*2) {
              out = obj.inputs[0].function(i,obj.inputs[0]);
            }
          } else {
            out = obj.inputs[0].function(x,obj.inputs[0]);
          }
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Quantization";
    }
    if (this.type == "bitcrusher") {
      this.width = 140;
      this.height = 75;
      this.distortion = 1;
      var distortionSlider = new ElementSlider(this,3,4,130,0.01,0,1,1);
      this.appendNode(distortionSlider);
      distortionSlider.onchange = function(e){e.target.parent.distortion = e.value;}
      var distortionKnob = new ElementKnob(this,0,this.height-32,-1,1);
      distortionKnob.onchange = function(e){e.target.parent.mod_distortion = e.value;}
      this.appendNode(distortionKnob);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          if (this.final_distortion<1) {
            var val = obj.inputs[0].function(x,obj.inputs[0]);
            if (val >= 0) {
              for (var i=0;i<val;i+=(1-this.final_distortion)) {
                out = i;
              }
            } else {
              for (var i=0;i>val;i-=(1-this.final_distortion)) {
                out = i;
              }
            }
          } else {
            out = obj.inputs[0].function(x,obj.inputs[0]);
          }
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Bitcrusher";
    }
    if (this.type == "lowpass") {
      this.width = 167;
      this.height = 88;
      this.resonance = 0.75;
      var cutoffSlider = new ElementSlider(this,3,4,130,0.01,0,1,1);
      var resonanceSlider = new ElementSlider(this,3,17,130,0.01,0,1,0.75);
      cutoffSlider.onchange = function(e){e.target.parent.cutoff = e.value;e.target.parent.filterNeedsUpdate=true;}
      resonanceSlider.onchange = function(e){e.target.parent.resonance = e.value;e.target.parent.filterNeedsUpdate=true;}
      this.appendNode(cutoffSlider);
      this.appendNode(resonanceSlider);
      var cutoffKnob = new ElementKnob(this,0,this.height-32,-1,1);
      var resonanceKnob = new ElementKnob(this,17,this.height-32,-1,1);
      cutoffKnob.onchange = function(e){e.target.parent.mod_cutoff = e.value;}
      resonanceKnob.onchange = function(e){e.target.parent.mod_resonance = e.value;}
      this.appendNode(cutoffKnob);
      this.appendNode(resonanceKnob);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          if (obj.filterInputHistory.length==0) {
            for (var i=0;i<=(4*(Math.PI*2)+(Math.PI*2))*100;i++) {
              obj.filterInputHistory[i] = obj.inputs[0].function(i/100,obj.inputs[0]);
            }
            obj.filterNeedsUpdate = true;
          } else {
            for (var i=0;i<=(4*(Math.PI*2)+(Math.PI*2))*100;i+=25) {
              if (obj.filterInputHistory[i]!=obj.inputs[0].function(i/100,obj.inputs[0])) {
                obj.filterNeedsUpdate = true;
                break;
              }
            }
          }
          if (obj.filterNeedsUpdate) {
            for (var i=0;i<=(4*(Math.PI*2)+(Math.PI*2))*100;i++) {
                obj.filterInputHistory[i] = obj.inputs[0].function(i/100,obj.inputs[0]);
            }
            obj.filterOutputHistory = [];
            var w = 0, v = 0, a = 0;
            var cutoff = 4**(obj.final_cutoff*6-6);
            for (var i=0;i<=(4*(Math.PI*2))*100;i++) {
              a = (obj.filterInputHistory[i] - w);
              v += (a - v) * (1-obj.final_resonance);
              w += v * cutoff;
            }
            for (var i=0;i<=Math.PI*2*100;i++) {
              a = (obj.filterInputHistory[i] - w);
              v += (a - v) * (1-obj.final_resonance);
              w += v * cutoff;
              obj.filterOutputHistory[i] = w;
            }
            obj.filterNeedsUpdate = false;
          }
          out = obj.filterOutputHistory[Math.floor(x*100)];
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Lowpass Filter";
    }
    if (this.type == "highpass") {
      this.width = 167;
      this.height = 88;
      this.resonance = 0.75;
      var cutoffSlider = new ElementSlider(this,3,4,130,0.01,0,1,1);
      var resonanceSlider = new ElementSlider(this,3,17,130,0.01,0,1,0.75);
      cutoffSlider.onchange = function(e){e.target.parent.cutoff = e.value;e.target.parent.filterNeedsUpdate=true;}
      resonanceSlider.onchange = function(e){e.target.parent.resonance = e.value;e.target.parent.filterNeedsUpdate=true;}
      this.appendNode(cutoffSlider);
      this.appendNode(resonanceSlider);
      var cutoffKnob = new ElementKnob(this,0,this.height-32,-1,1);
      var resonanceKnob = new ElementKnob(this,17,this.height-32,-1,1);
      cutoffKnob.onchange = function(e){e.target.parent.mod_cutoff = e.value;}
      resonanceKnob.onchange = function(e){e.target.parent.mod_resonance = e.value;}
      this.appendNode(cutoffKnob);
      this.appendNode(resonanceKnob);
      this.function = function(x,obj) {
        var out = 0;
        if (obj.inputs[0]) {
          if (obj.filterInputHistory.length==0) {
            for (var i=0;i<=(4*(Math.PI*2)+(Math.PI*2))*100;i++) {
              obj.filterInputHistory[i] = obj.inputs[0].function(i/100,obj.inputs[0]);
            }
            obj.filterNeedsUpdate = true;
          } else {
            for (var i=0;i<=(4*(Math.PI*2)+(Math.PI*2))*100;i+=25) {
              if (obj.filterInputHistory[i]!=obj.inputs[0].function(i/100,obj.inputs[0])) {
                obj.filterNeedsUpdate = true;
                break;
              }
            }
          }
          if (obj.filterNeedsUpdate) {
            for (var i=0;i<=(4*(Math.PI*2)+(Math.PI*2))*100;i++) {
                obj.filterInputHistory[i] = obj.inputs[0].function(i/100,obj.inputs[0]);
            }
            obj.filterOutputHistory = [];
            var w = 0, v = 0, a = 0;
            var cutoff = 4**(obj.final_cutoff*6-6);
            for (var i=0;i<=(4*(Math.PI*2))*100;i++) {
              a = (obj.filterInputHistory[i] - w);
              v += (a - v) * (1-obj.final_resonance);
              w += v * cutoff;
            }
            for (var i=0;i<=Math.PI*2*100;i++) {
              a = (obj.filterInputHistory[i] - w);
              v += (a - v) * (1-obj.final_resonance);
              w += v * cutoff;
              obj.filterOutputHistory[i] = w;
            }
            obj.filterNeedsUpdate = false;
          }
          out = obj.inputs[0].function(x,obj.inputs[0])-obj.filterOutputHistory[Math.floor(x*100)];
        }
        return out*obj.final_amplitude;
      };
      this.inputCount = 1;
      this.outputCount = 1;
      this.title = "Highpass Filter";
    }
    windows[windows.length] = this;
  }
  appendNode(node) {
    this.elements[this.elements.length] = node;
  }
  
  draw() {
    fill(0);
    rect(this.x,this.y,this.width,this.height);
    rect(this.x+1,this.y+1,this.width,this.height);
    fill(255);
    rect(this.x+1,this.y+1,this.width-2,this.height-2);
    
    for (var i=0;i<this.elements.length;i++) {
      this.elements[i].draw();
    }
    
    fill(0);
    rect(this.x,this.y,this.width,13);
    drawCaptionText(this.title,this.x+2,this.y+1);
    
    var mouseWindow;
    for (var i=windows.length-1;i>=0;i--) {
      if (mouseX>=windows[i].x&&mouseX<=windows[i].x+windows[i].width&&mouseY>=windows[i].y&&mouseY<=windows[i].y+windows[i].height) {
        mouseWindow = windows[i];
        break;
      }
    }
    if (this.closeButton) {
      if (mouseX>=this.x+this.width-13&&mouseX<=this.x+this.width&&mouseY>=this.y&&mouseY<=this.y+13&&!mouseDragWindow&&mouseWindow==this) {
        if (!mousePressing) {
          image(GFX.x_,this.x+this.width-12,this.y+1);
        } else {
          image(GFX.x,this.x+this.width-12,this.y+1);
        }
        cursor("pointer");
      } else {
        if (mouseCloseWindow == this) {
          image(GFX.x_,this.x+this.width-12,this.y+1);
        } else {
          image(GFX.x,this.x+this.width-12,this.y+1);
        }
      }
    }
    
    if (this.type=="sine"||this.type=="sawtooth"||this.type=="triangle"||this.type=="pulse"||this.type=="noise"||this.type=="pulsenoise"||this.type=="noiseconsistent"||this.type=="pulsenoiseconsistent") {
      rect(this.x+this.width-3-65,this.y+this.height-3,66,1);
      rect(this.x+this.width-3-65,this.y+this.height-20,66,1);
      rect(this.x+this.width-3-65,this.y+this.height-20,1,17);
      rect(this.x+this.width-3,this.y+this.height-20,1,17);
      for (var i=0;i<64;i+=0.25) {
        var sampleValue = Math.min(Math.max(Math.floor((this.function(i*Math.PI*2/64,this))*15/2+8),0),15);
        var sampleValueNext = Math.min(Math.max(Math.floor((this.function(((i+0.25)%64)*Math.PI*2/64,this))*15/2+8),0),15);
        rect(this.x+this.width-3-64+Math.floor(i),this.y+this.height-16-3+15-sampleValue,1,1);
        if (sampleValueNext-sampleValue > 1) {
          rect(this.x+this.width-3-64+Math.floor(i),this.y+this.height-16-3+15-sampleValue,1,sampleValue-sampleValueNext+1);
        }
        if (sampleValueNext-sampleValue < 0) {
          rect(this.x+this.width-3-64+Math.floor(i),this.y+this.height-16-3+15-sampleValue,1,sampleValue-sampleValueNext);
        }
      }
      if (this.type=="noise"||this.type=="pulsenoise"||this.type=="noiseconsistent"||this.type=="pulsenoiseconsistent") {
        image(GFX.amp,this.x+119,this.y+18);
        if (this.amplitude == 1) {
          drawNumber("1.0",this.x+140,this.y+18);
        } else {
          drawNumber("."+this.amplitude.toFixed(2).split(".")[1],this.x+140,this.y+18);
        }
      } else {
        image(GFX.mul,this.x+119,this.y+18);
        drawNumber(this.multiplier.toString().padStart(2,"0"),this.x+140,this.y+18);
        image(GFX.phs,this.x+119,this.y+31);
        if (this.phase == 1) {
          drawNumber("1.0",this.x+140,this.y+31);
        } else {
          drawNumber("."+this.phase.toFixed(2).split(".")[1],this.x+140,this.y+31);
        }
        image(GFX.amp,this.x+119,this.y+44);
        if (this.amplitude == 1) {
          drawNumber("1.0",this.x+140,this.y+44);
        } else {
          drawNumber("."+this.amplitude.toFixed(2).split(".")[1],this.x+140,this.y+44);
        }
      }
    }
    if (this.type=="pulse") {
      if (this.pulseWidth == 1) {
        drawNumber("100",this.x+124,this.y+57);
      } else {
        drawNumber(Math.floor(this.pulseWidth*100),this.x+135,this.y+57);
      }
    }
    if (this.type=="phasemodulation") {
      fill(0);
      rect(this.x+1,this.y+31,34,1);
      rect(this.x+35,this.y+31,1,24);
      rect(this.x+35,this.y+55,34,1);
      rect(this.x+1,this.y+43,31,1);
      rect(this.x+34,this.y+42,3,3);
      rect(this.x+29,this.y+41,1,5);
      rect(this.x+30,this.y+42,1,3);
      rect(this.x+66,this.y+53,1,5);
      rect(this.x+67,this.y+54,1,3);
      if (this.modulation < 10) {
        drawNumber(this.modulation.toFixed(1),this.x+120,this.y+30);
      } else {
        drawNumber(this.modulation.toFixed(1),this.x+120-8,this.y+30);
      }
    }
    if (this.type=="ringmodulation") {
      fill(0);
      rect(this.x+1,this.y+31,34,1);
      rect(this.x+35,this.y+31,1,24);
      rect(this.x+35,this.y+55,34,1);
      rect(this.x+1,this.y+43,31,1);
      rect(this.x+34,this.y+42,3,3);
      rect(this.x+29,this.y+41,1,5);
      rect(this.x+30,this.y+42,1,3);
      rect(this.x+66,this.y+53,1,5);
      rect(this.x+67,this.y+54,1,3);
      drawNumber(this.modulation.toFixed(2),this.x+120-8,this.y+30);
    }
    if (this.type=="gainer") {
      fill(0);
      rect(this.x+1,this.y+37,34,1);
      rect(this.x+35,this.y+37,1,18);
      rect(this.x+35,this.y+55,34,1);
      rect(this.x+66,this.y+53,1,5);
      rect(this.x+67,this.y+54,1,3);
      drawNumber(this.amplitude.toFixed(1),this.x+120,this.y+30);
    }
    if (this.type=="syncer") {
      fill(0);
      rect(this.x+1,this.y+37,34,1);
      rect(this.x+35,this.y+37,1,18);
      rect(this.x+35,this.y+55,34,1);
      rect(this.x+66,this.y+53,1,5);
      rect(this.x+67,this.y+54,1,3);
      if (this.modulation < 10) {
        drawNumber(this.modulation.toFixed(1),this.x+120,this.y+30);
      } else {
        drawNumber(this.modulation.toFixed(1),this.x+120-8,this.y+30);
      }
    }
    if (this.type=="feedback") {
      fill(0);
      rect(this.x+1,this.y+37,23,1);
      rect(this.x+23,this.y+37,1,18);
      rect(this.x+22,this.y+36,3,3);
      rect(this.x+23,this.y+55,46,1);
      rect(this.x+66,this.y+53,1,5);
      rect(this.x+67,this.y+54,1,3);
      rect(this.x+46,this.y+37,1,18);
      rect(this.x+29,this.y+35,1,5);
      rect(this.x+28,this.y+36,1,3);
      rect(this.x+27,this.y+37,20,1);
      drawNumber(this.modulation.toFixed(2),this.x+120-8,this.y+30);
    }
    if (this.type=="quantizer"||this.type=="bitcrusher") {
      fill(0);
      rect(this.x+1,this.y+37,34,1);
      rect(this.x+35,this.y+37,1,18);
      rect(this.x+35,this.y+55,34,1);
      rect(this.x+66,this.y+53,1,5);
      rect(this.x+67,this.y+54,1,3);
      drawNumber(this.distortion.toFixed(2),this.x+120-8,this.y+30);
    }
    if (this.type=="lowpass"||this.type=="highpass") {
      fill(0);
      rect(this.x+1,this.y+44,47,1);
      rect(this.x+48,this.y+44,1,24);
      rect(this.x+48,this.y+68,48,1);
      rect(this.x+93,this.y+66,1,5);
      rect(this.x+94,this.y+67,1,3);
      drawNumber(this.cutoff.toFixed(2),this.x+this.width-5-24,this.y+18);
      drawNumber(this.resonance.toFixed(2),this.x+this.width-5-24,this.y+31);
    }
    if (this.type=="mixer"||this.type=="splitter"||this.type=="phasemodulation"||this.type=="ringmodulation"||this.type=="gainer"||this.type=="syncer"||this.type=="feedback"||this.type=="quantizer"||this.type=="bitcrusher"||this.type=="lowpass"||this.type=="highpass"||this.type=="inverter"||this.type=="rectifier"||this.type=="saturator") {
      rect(this.x+this.width-3-65,this.y+this.height-3,66,1);
      rect(this.x+this.width-3-65,this.y+this.height-36,66,1);
      rect(this.x+this.width-3-65,this.y+this.height-36,1,33);
      rect(this.x+this.width-3,this.y+this.height-36,1,33);
      for (var i=0;i<64;i+=0.25) {
        var sampleValue = Math.min(Math.max(Math.floor((this.function(i*Math.PI*2/64,this))*15.5+16),0),31);
        var sampleValueNext = Math.min(Math.max(Math.floor((this.function(((i+0.25)%64)*Math.PI*2/64,this))*15.5+16),0),31);
        rect(this.x+this.width-3-64+Math.floor(i),this.y+this.height-16-3+15-sampleValue,1,1);
        if (sampleValueNext-sampleValue > 1) {
          rect(this.x+this.width-3-64+Math.floor(i),this.y+this.height-16-3+15-sampleValue,1,sampleValue-sampleValueNext+1);
        }
        if (sampleValueNext-sampleValue < 0) {
          rect(this.x+this.width-3-64+Math.floor(i),this.y+this.height-16-3+15-sampleValue,1,sampleValue-sampleValueNext);
        }
      }
    }
    if (this.type=="output") {
      rect(this.x+2,this.y+78-3,2+this.waveLength,1);
      rect(this.x+2,this.y+78-36,2+this.waveLength,1);
      rect(this.x+2,this.y+78-36,1,33);
      rect(this.x+this.waveLength+3,this.y+78-36,1,33);
      for (var i=0;i<this.waveLength;i++) {
        var sampleValue = 0;
        var sampleValueNext = 0;
        for (var j=0;j<1;j+=0.25) {
          sampleValue += this.function((i+j)*Math.PI*2/this.waveLength,this)*0.25;
          sampleValueNext += this.function(((i+1)%this.waveLength+j)*Math.PI*2/this.waveLength,this)*0.25;
        }
        sampleValue = Math.min(Math.max(Math.floor(sampleValue*7.5+8),0),15)*2;
        sampleValueNext = Math.min(Math.max(Math.floor(sampleValueNext*7.5+8),0),15)*2;
        rect(this.x+3+i,this.y+78-16-3+15-sampleValue,1,1);
        if (sampleValueNext-sampleValue > 1) {
          rect(this.x+3+i,this.y+78-16-3+15-sampleValue,1,sampleValue-sampleValueNext);
        }
        if (sampleValueNext-sampleValue < 0) {
          rect(this.x+3+i,this.y+78-16-3+15-sampleValue,1,sampleValue-sampleValueNext+1);
        }
      }
      drawNumber(this.waveLength,this.x+134,this.y+30);
    }
  }
  remove() {
    for (var i=0;i<this.outputCount;i++) {
      var count = 1;
      while (count > 0) {
        count = 0;
        var idx = -1;
        if (this.outputs[i]) {
          for (var j=0;j<this.outputs[i].inputs.length;j++) {
            if (this.outputs[i].inputs[j] == this) {
              idx = j;
              count++;
            }
          }
          if (idx != -1) {
            this.outputs[i].inputs[idx] = null;
          }
        }
      }
    }
    for (var i=0;i<this.inputCount;i++) {
      var count = 1;
      while (count > 0) {
        count = 0;
        var idx = 0;
        if (this.inputs[i]) {
          for (var j=0;j<this.inputs[i].outputs.length;j++) {
            if (this.inputs[i].outputs[j] == this) {
              idx = j;
              count++;
            }
          }
          this.inputs[i].outputs[idx] = null;
        }
      }
    }
    var index = 0;
    for (var i=0;i<windows.length;i++) {
      if (windows[i] == this) {
        index = i;
      }
    }
    windows.splice(index,1);
    updateFinalValues();
  }
  onClose() {
    var mouseWindow;
    for (var i=windows.length-1;i>=0;i--) {
      if (mouseX>=windows[i].x&&mouseX<=windows[i].x+windows[i].width&&mouseY>=windows[i].y&&mouseY<=windows[i].y+windows[i].height) {
        mouseWindow = windows[i];
        break;
      }
    }
    return (mouseX>=this.x+this.width-13&&mouseX<=this.x+this.width&&mouseY>=this.y&&mouseY<=this.y+13&&!mouseDragWindow&&mouseWindow==this);
  }
  updateFinalValues() {
    this.final_multiplier = Math.min(Math.max(Math.floor(this.multiplier+this.mod_multiplier*modulation+0.5),0),12);
    this.final_phase = this.phase+this.mod_phase*modulation;
    this.final_amplitude = Math.max(this.amplitude+this.mod_amplitude*modulation,0);
    if (this.type == "ringmodulation") {
      this.final_modulation = Math.min(Math.max(this.modulation+this.mod_modulation*modulation,0),1);
    } else if (this.type == "syncer") {
      this.final_modulation = Math.min(Math.max(this.modulation+this.mod_modulation*modulation,0),16);
    } else {
      this.final_modulation = Math.max(this.modulation+this.mod_modulation*modulation,0);
    }
    this.final_pulseWidth = modulo(this.pulseWidth+this.mod_pulseWidth*modulation,1);
    this.final_distortion = Math.min(Math.max(this.distortion+this.mod_distortion*modulation,0),1);
    this.final_cutoff = Math.min(Math.max(this.cutoff+this.mod_cutoff*modulation,0),1);
    this.final_resonance = Math.min(Math.max(this.resonance+this.mod_resonance*modulation,0),1);
  }
  createWavetables() {
    var out = "";
    for (var i=0;i<64;i++) {
      modulation = i/64;
      updateFinalValues();
      for (var j=0;j<windows.length;j++) {
        if (windows[j].type=="noise"||windows[j].type=="pulsenoise") {
          windows[j].updateNoise();
        }
      }
      
      for (var x=0;x<this.waveLength;x++) {
        var val = 0;
        if (this.inputs[0]) {
          for (var j=0;j<1;j+=0.25) {
            val += this.inputs[0].function((x+j)*Math.PI*2/this.waveLength,this.inputs[0])*0.25;
          }
        }
        val = Math.min(Math.max(Math.floor(val*7.5+8),0),15);
        out += val+" ";
      }
      out += ";\n";
    }
    setClipboard(out);
    modulation = this.elements[0].value;
    updateFinalValues();
  }
  updateNoise() {
    this.seed = Math.random()*1024;
    randomSeed(this.seed);
    for (var i=0;i<32;i++) {
      random();
    }
    for (var i=0;i<256;i++) {
      this.noiseTable[i]=random();
    }
  }
  createDMW() {
    var data = [];
    data.push(this.waveLength);
    data.push(0x00);
    data.push(0x00);
    data.push(0x00);
    data.push(0xFF);
    data.push(0x01);
    data.push(0xFF);
    for (var i=0;i<this.waveLength;i++) {
      var val = 0;
      if (this.inputs[0]) {
        for (var j=0;j<1;j+=0.25) {
          val += this.inputs[0].function((i+j)*Math.PI*2/this.waveLength,this.inputs[0])*0.25;
        }
      }
      data.push(Math.floor((val*0.5+0.5)*255));
      data.push(0x00);
      data.push(0x00);
      data.push(0x00);
    }
    var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
    saveAs(URL.createObjectURL(file),"patch.dmw");
    URL.revokeObjectURL(file);
  }
}

var wireEnd = [
  [-1,-1,1,1,1,1,1,-1,-1],
  [-1,1,0,0,0,0,0,1,-1],
  [1,0,0,1,1,1,0,0,1],
  [1,0,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,0,1],
  [1,0,0,1,1,1,0,0,1],
  [-1,1,0,0,0,0,0,1,-1],
  [-1,-1,1,1,1,1,1,-1,-1],
]
var needsUpdate = false;
var modulation = 1;

var m1,m2,o1,o2,o3;
function setup() {
  var canvas = createCanvas(innerWidth, innerHeight);
  canvas.elt.ondrop = dropHandler;
  canvas.elt.ondragover = function(ev) {
    ev.preventDefault();
  }
  noStroke();
  GFX.x = loadImage("x.png");
  GFX.x_ = loadImage("x_.png");
  GFX.slider_thumb = loadImage("slider_thumb.png");
  GFX.slider_thumb_ = loadImage("slider_thumb_.png");
  GFX.button_copy = loadImage("button_copy.png");
  GFX.button_copy_ = loadImage("button_copy_.png");
  GFX.button_dmw = loadImage("button_dmw.png");
  GFX.button_dmw_ = loadImage("button_dmw_.png");
  GFX.wheel = loadImage("wheel.png");
  GFX.numbers = loadImage("numbers.png");
  GFX.mul = loadImage("mul.png");
  GFX.phs = loadImage("phs.png");
  GFX.amp = loadImage("amp.png");
  GFX.text_lowercase = loadImage("text_lowercase.png");
  GFX.text_uppercase = loadImage("text_uppercase.png");
  GFX.text_lowercase_black = loadImage("text_lowercase_black.png");
  GFX.text_uppercase_black = loadImage("text_uppercase_black.png");
  GFX.text_symbols_black = loadImage("text_symbols_black.png");
  GFX.text_numbers_black = loadImage("text_numbers_black.png");
  var sine = new ElementWindow(20, 20, "sine");
  var output = new ElementWindow(512, 20, "output");
  new ElementWindow(innerWidth-160-20, innerHeight-340-20, "help");
  sine.outputs = [output];
  sine.inputMapping = [0];
  output.inputs = [sine];
  for (var i=0;i<windows.length;i++) {
    if (windows[i].x<0) {windows[i].x=0;}
    if (windows[i].y<0) {windows[i].y=0;}
    if (windows[i].x>innerWidth-windows[i].width) {windows[i].x=innerWidth-windows[i].width;}
    if (windows[i].y>innerHeight-windows[i].height) {windows[i].y=innerHeight-windows[i].height;}
  }
}

var tickCount = 0;
function draw() {
  background(255);
  for (var i=0;i<windows.length;i++) {
    var outputs = windows[i].outputs;
    var inputs = windows[i].inputs;
    var windowMidY = windows[i].y+windows[i].height*0.5;
    fill(0);
    for (var j=0;j<windows[i].outputCount;j++) {
      var pointY = Math.floor(windowMidY-windows[i].outputCount*6+12*j+6);
      var pointX = Math.floor(windows[i].x+windows[i].width+8);
      rect(pointX-1,pointY-2,3,1);
      rect(pointX-2,pointY-1,1,3);
      rect(pointX-1,pointY+2,3,1);
      rect(pointX+2,pointY-1,1,3);
    }
    for (var j=0;j<windows[i].inputCount;j++) {
      var pointY = Math.floor(windowMidY-windows[i].inputCount*6+12*j+6);
      var pointX = Math.floor(windows[i].x-8);
      rect(pointX-1,pointY-2,3,1);
      rect(pointX-2,pointY-1,1,3);
      rect(pointX-1,pointY+2,3,1);
      rect(pointX+2,pointY-1,1,3);
    }
    for (var j=0;j<windows[i].outputCount;j++) {
      var point1Y = Math.floor(windowMidY-windows[i].outputCount*6+12*j+6);
      var point1X = Math.floor(windows[i].x+windows[i].width+8);
      if (!outputs[j]) {
        if (!(outputDragged[0]==windows[i]&&outputDragged[1]==j)) {
          for (var y=0;y<wireEnd.length;y++) {
            for (var x=0;x<wireEnd[y].length;x++) {
              if (wireEnd[y][x]==0) {fill(255);}
              else if (wireEnd[y][x]==1) {fill(0);}
              if (wireEnd[y][x]!=-1) {
                rect(point1X+x-4,point1Y+y-4,1,1);
              }
            }
          }
        }
      } else {
        var windowMid2Y = outputs[j].y+outputs[j].height*0.5;
        var inputindex = -1;
        inputindex = windows[i].inputMapping[j];
        if (inputindex != -1) {
          var point2Y = Math.floor(windowMid2Y-outputs[j].inputCount*6+12*inputindex+6);
          var point2X = Math.floor(outputs[j].x-8);
          if (outputDragged[0]==windows[i]&&outputDragged[1]==j) {
            point2X = mouseX - mousedx;
            point2Y = mouseY - mousedy;
          }
          fill(0);
          if (point2X >= point1X) {
            var averageX = Math.floor((point1X+point2X)*0.5);
            rect(point1X,point1Y,averageX-point1X,1);
            rect(averageX,point1Y+((point2Y < point1Y) ? 1 : 0),1,point2Y-point1Y);
            rect(averageX,point2Y,point2X-averageX+1,1);
          } else {
            var averageY = Math.floor((point1Y+point2Y)*0.5);
            rect(point1X,point1Y,1,averageY-point1Y+((point2Y > point1Y) ? 1 : 0));
            rect(point1X+((point2X > point1X) ? 1 : 0),averageY,point2X-point1X,1);
            rect(point2X,averageY,1,point2Y-averageY+((point2Y > point1Y) ? 1 : 0));
          }
          fill(255);
          rect(point1X-1,point1Y-1,3,3);
          fill(0);

          for (var y=0;y<wireEnd.length;y++) {
            for (var x=0;x<wireEnd[y].length;x++) {
              if (wireEnd[y][x]==0) {fill(255);}
              else if (wireEnd[y][x]==1) {fill(0);}
              if (wireEnd[y][x]!=-1) {
                rect(point2X+x-4,point2Y+y-4,1,1);
              }
            }
          }
        }
      }
      
      if (outputDragged[0]==windows[i]&&outputDragged[1]==j) {
        var point2X = mouseX - mousedx;
        var point2Y = mouseY - mousedy;
        fill(0);
        if (point2X >= point1X) {
          var averageX = Math.floor((point1X+point2X)*0.5);
          rect(point1X,point1Y,averageX-point1X,1);
          rect(averageX,point1Y+((point2Y < point1Y) ? 1 : 0),1,point2Y-point1Y);
          rect(averageX,point2Y,point2X-averageX+1,1);
        } else {
          var averageY = Math.floor((point1Y+point2Y)*0.5);
          rect(point1X,point1Y,1,averageY-point1Y+((point2Y > point1Y) ? 1 : 0));
          rect(point1X+((point2X > point1X) ? 1 : 0),averageY,point2X-point1X,1);
          rect(point2X,averageY,1,point2Y-averageY+((point2Y > point1Y) ? 1 : 0));
        }
        fill(255);
        rect(point1X-1,point1Y-1,3,3);
        fill(0);
        for (var y=0;y<wireEnd.length;y++) {
          for (var x=0;x<wireEnd[y].length;x++) {
            if (wireEnd[y][x]==0) {fill(255);}
            else if (wireEnd[y][x]==1) {fill(0);}
            if (wireEnd[y][x]!=-1) {
              rect(point2X+x-4,point2Y+y-4,1,1);
            }
          }
        }
      }
    }
  }
  cursor("default");
  for (var i=0;i<windows.length;i++) {
    windows[i].draw();
  }
  tickCount++;
}

function drawNumber(n,x,y) {
  var dx = 0;
  var digits = n.toString().split("");
  for (var i=0;i<digits.length;i++) {
    if (!isNaN(parseInt(digits[i]))) {
      image(GFX.numbers,x+dx,y,8,8,8*digits[i],0,8,8);
      dx += 8;
    } else {
      image(GFX.numbers,x+dx,y,8,8,8*10,0,8,8);
      dx += 3;
    }
  }
}
function drawCaptionText(str,x,y) {
  var letters = str.split("");
  var dx = 0;
  var letterList = "abcdefghijklmnopqrstuvwxyz".split("");
  var LUT = {};
  for (var i=0;i<letterList.length;i++) {
    LUT[letterList[i]] = i;
  }
  for (var i=0;i<letters.length;i++) {
    var gfx = (letters[i].toUpperCase()==letters[i])?GFX.text_uppercase:GFX.text_lowercase;
    if (letters[i]!=" ") {
      image(gfx,x+dx,y,8,11,8*LUT[letters[i].toLowerCase()],0,8,11);
    }
    dx += letterWidth(letters[i]);
  }
}
function drawText(str,x,y) {
  var letters = str.split("");
  var dx = 0;
  var dy = 0;
  var letterList = "abcdefghijklmnopqrstuvwxyz".split("");
  var LUT = {};
  for (var i=0;i<letterList.length;i++) {
    LUT[letterList[i]] = i;
  }
  for (var i=0;i<letters.length;i++) {
    var gfx = (letters[i].toUpperCase()==letters[i])?GFX.text_uppercase_black:GFX.text_lowercase_black;
    if (letters[i] == "\n") {
      dy += 10;
      dx = 0;
    } else if (letters[i] == ".") {
      image(GFX.text_symbols_black,x+dx,y+dy,8,11,8*0,0,8,11);
      dx += 3;
    } else if (letters[i] == ",") {
      image(GFX.text_symbols_black,x+dx,y+dy,8,11,8*1,0,8,11);
      dx += 3;
    } else if (letters[i] == "-") {
      image(GFX.text_symbols_black,x+dx,y+dy,8,11,8*2,0,8,11);
      dx += 7;
    } else if (letters[i] == "+") {
      image(GFX.text_symbols_black,x+dx,y+dy,8,11,8*3,0,8,11);
      dx += 6;
    } else if (letters[i] == "!") {
      image(GFX.text_symbols_black,x+dx,y+dy,8,11,8*4,0,8,11);
      dx += 3;
    } else if (letters[i] == "0") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 7;
    } else if (letters[i] == "1") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 5;
    } else if (letters[i] == "2") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i] == "3") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i] == "3") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i] == "4") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 7;
    } else if (letters[i] == "5") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i] == "6") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i] == "7") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 7;
    } else if (letters[i] == "8") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i] == "9") {
      image(GFX.text_numbers_black,x+dx,y+dy,8,11,8*parseInt(letters[i]),0,8,11);
      dx += 6;
    } else if (letters[i]!=" ") {
      image(gfx,x+dx,y+dy,8,11,8*LUT[letters[i].toLowerCase()],0,8,11);
      dx += letterWidth(letters[i]);
    } else {
      dx += 3;
    }
  }
}

function updateFinalValues() {
  for (var i=0;i<windows.length;i++) {
    windows[i].updateFinalValues();
    windows[i].filterNeedsUpdate = true;
  }
}
function modulo(a,b) {
  return ((a % b) + b) % b;
}

var stack = [];
var terminateSearch = false;
function checkLoop(thisWindow,thisOutput) {
  stack = [];
  terminateSearch = false;
  traverse(thisWindow,thisOutput,thisWindow);
  
}
function traverse(thisWindow,thisOutput,origWindow) {
  if (thisWindow.outputs[thisOutput] == origWindow) {
    terminateSearch = true;
  }
  stack.push([thisWindow,thisOutput]);
  if (!terminateSearch) {
    connectedWindow = thisWindow.outputs[thisOutput];
    if (connectedWindow) {
      for (var i=0;i<connectedWindow.outputCount;i++) {
        if (connectedWindow.outputs[i]) {
          traverse(connectedWindow,i,origWindow);
        }
      }
    }
  }
  stack.pop([thisWindow,thisOutput]);
}

var mouseDragWindow;
var mousedx = 0, mousedy = 0;
var mousePressing = false;
var mouseDragEl;
var mouseCloseWindow;
var outputDragged = [];
var origKnobValue = 0;
var doubleClicking = false;

function mousePressed() {
  mousePressing = true;
  var mouseWindow;
  if (outputDragged[0]) {
    outputDragged = [];
  }
  for (var i=windows.length-1;i>=0;i--) {
    var doBreak = false;
    for (var j=windows.length-1;j>=0;j--) {
      if (mouseX>=windows[j].x&&mouseX<=windows[j].x+windows[j].width&&mouseY>=windows[j].y&&mouseY<=windows[j].y+windows[j].height) {
        mouseWindow = windows[j];
        windows.splice(j,1);
        windows.push(mouseWindow);
        
        break;
      }
    }
    for (var j=0;j<windows[i].outputCount;j++) {
      var windowMidY = windows[i].y+windows[i].height*0.5;
      var point1Y = Math.floor(windowMidY-windows[i].outputCount*6+12*j+6);
      var point1X = Math.floor(windows[i].x+windows[i].width+8);
      var inputindex = -1;
      if (windows[i].outputs[j]) {
        inputindex = windows[i].inputMapping[j];
      }
      if (inputindex != -1) {
        var windowMid2Y = windows[i].outputs[j].y+windows[i].outputs[j].height*0.5;
        var point2Y = Math.floor(windowMid2Y-windows[i].outputs[j].inputCount*6+12*inputindex+6);
        var point2X = Math.floor(windows[i].outputs[j].x-8);
        if (mouseX>=point2X-4&&mouseX<point2X+4&&mouseY>=point2Y-4&&mouseY<point2Y+4) {
          outputDragged = [windows[i],j];
          windows[i].outputs[j].inputs[inputindex] = null;
          windows[i].outputs[j] = null;
          mousedx = mouseX - point2X;
          mousedy = mouseY - point2Y;
          break;
        }
      } else if (mouseX>=point1X-4&&mouseX<point1X+4&&mouseY>=point1Y-4&&mouseY<point1Y+4) {
        outputDragged = [windows[i],j];
        mousedx = mouseX - point1X;
        mousedy = mouseY - point1Y;
        break;
      }
    }
    var offX = (windows[i].closeButton) ? -13 : 0;
    if (mouseX>=windows[i].x&&mouseX<windows[i].x+windows[i].width+offX&&mouseY>=windows[i].y&&mouseY<=windows[i].y+12&&mouseWindow==windows[i]) {
      mouseDragWindow = windows[i];
      mousedx = mouseX - windows[i].x;
      mousedy = mouseY - windows[i].y;
      doBreak = true;
    }
    
    if (windows[i].onClose()&&windows[i].closeButton) {
      mouseCloseWindow = windows[i];
    }
    
    if (doBreak) {
      return;
    }
  }
  if (mouseWindow) {
    for (var i=mouseWindow.elements.length-1;i>=0;i--) {
      if (mouseWindow.elements[i].type=="slider") {
        var thumb = mouseWindow.elements[i].getThumb();
        var track = mouseWindow.elements[i].getTrack();
        if (mouseX>=thumb.x&&mouseX<thumb.x+thumb.width&&mouseY>=thumb.y&&mouseY<thumb.y+thumb.height) {
          if (doubleClicking) {
            mouseWindow.elements[i].value = mouseWindow.elements[i].init;
          } else {
            mousedx = mouseX - thumb.x;
            mousedy = mouseY - thumb.y;
            mouseDragEl = mouseWindow.elements[i];
          }
          break;
        } else if (mouseX>=track.x&&mouseX<track.x+track.width&&mouseY>=track.y&&mouseY<track.y+track.height) {
          if (doubleClicking) {
            mouseWindow.elements[i].value = mouseWindow.elements[i].init;
          } else {
            mouseWindow.elements[i].value = mouseWindow.elements[i].convertX(mouseX);
          }
          break;
        }
      }
      if (mouseWindow.elements[i].type=="knob") {
        var knob = mouseWindow.elements[i].getBody();
        if (mouseX>=knob.x&&mouseX<knob.x+knob.width&&mouseY>=knob.y&&mouseY<knob.y+knob.height) {
          if (doubleClicking) {
            mouseWindow.elements[i].value = 0;
          } else {
            mousedx = mouseX - knob.x;
            mousedy = mouseY;
            mouseDragEl = mouseWindow.elements[i];
            origKnobValue = mouseWindow.elements[i].value;
          }
          break;
        }
      }
      if (mouseWindow.elements[i].type=="buttoncopy"||mouseWindow.elements[i].type=="buttondmw") {
        var button = mouseWindow.elements[i].getBody();
        if (mouseX>=button.x&&mouseX<button.x+button.width&&mouseY>=button.y&&mouseY<button.y+button.height) {
          mouseDragEl = mouseWindow.elements[i];
          break;
        }
      }
    }
  }
  doubleClicking = false;
}

function doubleClicked() {
  doubleClicking = true;
  mousePressed();
}

function mouseDragged() {
  if (mouseDragWindow) {
    mouseDragWindow.x = mouseX - mousedx;
    mouseDragWindow.y = mouseY - mousedy;
    if (mouseDragWindow.x<0) {mouseDragWindow.x=0;}
    if (mouseDragWindow.y<0) {mouseDragWindow.y=0;}
    if (mouseDragWindow.x>innerWidth-mouseDragWindow.width) {mouseDragWindow.x=innerWidth-mouseDragWindow.width;}
    if (mouseDragWindow.y>innerHeight-mouseDragWindow.height) {mouseDragWindow.y=innerHeight-mouseDragWindow.height;}
  }
  if (mouseDragEl) {
    if (mouseDragEl.type == "slider") {
      mouseDragEl.value = mouseDragEl.convertX(mouseX - mousedx);
    }
    if (mouseDragEl.type == "knob") {
      mouseDragEl.value = Math.max(Math.min(origKnobValue - (mouseY - mousedy)*0.01*mouseDragEl.max,mouseDragEl.max),mouseDragEl.min);
    }
  }
  //redraw();
}
function mouseReleased() {
  if (mouseCloseWindow) {
    if (mouseCloseWindow.onClose()) {
      mouseCloseWindow.remove();
    }
  }
  if (mouseDragEl) {
    if (mouseDragEl.type=="buttoncopy"||mouseDragEl.type=="buttondmw") {
      var button = mouseDragEl.getBody();
      if (mouseX>=button.x&&mouseX<button.x+button.width&&mouseY>=button.y&&mouseY<button.y+button.height) {
        mouseDragEl.click();
        mouseDragEl = null;
      }
    }
  }
  if (outputDragged[0]) {
    var hitNode = false;
    for (var i=windows.length-1;i>=0;i--) {
      for (var j=0;j<windows[i].inputCount;j++) {
        var windowMidY = windows[i].y+windows[i].height*0.5;
        var pointY = Math.floor(windowMidY-windows[i].inputCount*6+12*j+6);
        var pointX = Math.floor(windows[i].x-8);
        
        var currOutputs = [...outputDragged[0].outputs];
        outputDragged[0].outputs[outputDragged[1]] = windows[i];
        checkLoop(outputDragged[0],0);
        outputDragged[0].outputs = currOutputs;
        if (pointX>=mouseX-mousedx-4 && pointX<=mouseX-mousedx+4 && pointY>=mouseY-mousedy-4 && pointY<=mouseY-mousedy+4 && !windows[i].inputs[j]&&!terminateSearch) {
          outputDragged[0].inputMapping[outputDragged[1]] = j;
          windows[i].inputs[j] = outputDragged[0];
          outputDragged[0].outputs[outputDragged[1]] = windows[i];
          outputDragged = [];
          hitNode = true;
          break;
        }
      }
      if (hitNode) {
        break;
      }
    }
    if (!hitNode) {
      outputDragged = [];
    }
    updateFinalValues();
  }
  mousePressing = false;
  mouseDragWindow = null;
  mouseDragEl = null;
  mouseCloseWindow = null;
}
function setClipboard(text) {
  navigator.clipboard.writeText(text);
}

window.onresize = function() {
  resizeCanvas(innerWidth,innerHeight);
  for (var i=0;i<windows.length;i++) {
    if (windows[i].x<0) {windows[i].x=0;}
    if (windows[i].y<0) {windows[i].y=0;}
    if (windows[i].x>innerWidth-windows[i].width) {windows[i].x=innerWidth-windows[i].width;}
    if (windows[i].y>innerHeight-windows[i].height) {windows[i].y=innerHeight-windows[i].height;}
  }
}

window.onkeydown = function(e) {
  e.preventDefault();
  if (e.ctrlKey && !e.shiftKey && e.code == "KeyS") {
    fileExport();
    return;
  }
  var newWindow;
  if (!e.shiftKey && e.code == "KeyM") {
    newWindow = new ElementWindow(mouseX-Math.floor(70/2), mouseY-Math.floor(50/2), "mixer");
  }
  if (e.shiftKey && e.code == "KeyM") {
    newWindow = new ElementWindow(mouseX-Math.floor(70/2), mouseY-Math.floor(50/2), "splitter");
  }
  if (!e.shiftKey && e.code == "KeyI") {
    newWindow = new ElementWindow(mouseX-Math.floor(70/2), mouseY-Math.floor(50/2), "inverter");
  }
  if (e.shiftKey && e.code == "KeyD") {
    newWindow = new ElementWindow(mouseX-Math.floor(70/2), mouseY-Math.floor(50/2), "saturator");
  }
  if (e.shiftKey && e.code == "KeyR") {
    newWindow = new ElementWindow(mouseX-Math.floor(70/2), mouseY-Math.floor(50/2), "rectifier");
  }
  if (!e.shiftKey && e.code == "Digit1") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(80/2), "sine");
  }
  if (!e.shiftKey && e.code == "Digit2") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(80/2), "sawtooth");
  }
  if (!e.shiftKey && e.code == "Digit3") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(80/2), "triangle");
  }
  if (!e.shiftKey && e.code == "Digit4") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(93/2), "pulse");
  }
  if (!e.shiftKey && e.code == "Digit5") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(54/2), "noise");
  }
  if (!e.shiftKey && e.code == "Digit6") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(54/2), "pulsenoise");
  }
  if (e.shiftKey && e.code == "Digit5") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(54/2), "noiseconsistent");
  }
  if (e.shiftKey && e.code == "Digit6") {
    newWindow = new ElementWindow(mouseX-Math.floor(160/2), mouseY-Math.floor(54/2), "pulsenoiseconsistent");
  }
  if (!e.shiftKey && e.code == "KeyP") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "phasemodulation");
  }
  if (!e.shiftKey && e.code == "KeyR") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "ringmodulation");
  }
  if (!e.shiftKey && e.code == "KeyG") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "gainer");
  }
  if (!e.shiftKey && e.code == "KeyQ") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "quantizer");
  }
  if (!e.shiftKey && e.code == "KeyB") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "bitcrusher");
  }
  if (!e.shiftKey && e.code == "KeyL") {
    newWindow = new ElementWindow(mouseX-Math.floor(167/2), mouseY-Math.floor(88/2), "lowpass");
  }
  if (!e.shiftKey && e.code == "KeyH") {
    newWindow = new ElementWindow(mouseX-Math.floor(167/2), mouseY-Math.floor(88/2), "highpass");
  }
  if (!e.shiftKey && e.code == "KeyS") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "syncer");
  }
  if (!e.shiftKey && e.code == "KeyF") {
    newWindow = new ElementWindow(mouseX-Math.floor(140/2), mouseY-Math.floor(75/2), "feedback");
  }
  if (newWindow) {
    if (newWindow.x<0) {newWindow.x=0;}
    if (newWindow.y<0) {newWindow.y=0;}
    if (newWindow.x>innerWidth-newWindow.width) {newWindow.x=innerWidth-newWindow.width;}
    if (newWindow.y>innerHeight-newWindow.height) {newWindow.y=innerHeight-newWindow.height;}
  }
}

function dropHandler(ev) {
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    var item = [...ev.dataTransfer.items][0];
    if (item.kind === 'file') {
      const file = item.getAsFile();
      fileImport(file);
      console.log(file.name);
    }
  } else {
    var file = [...ev.dataTransfer.files][0];
    fileImport(file);
    console.log(file.name);
  }
}

var windowtypes = ["output","help","sine","sawtooth","triangle","pulse","noise","pulsenoise","noiseconsistent","pulsenoiseconsistent","mixer","splitter","inverter","saturator","rectifier","feedback","phasemodulation","ringmodulation","gainer","syncer","quantizer","bitcrusher","lowpass","highpass"];
function fileExport() {
  var versionNumber = 0x01;
  var data = [];
  data.push("W".charCodeAt(0));
  data.push("S".charCodeAt(0));
  data.push(versionNumber);
  data.push(Math.floor(windows.length));
  for (var i=0;i<windows.length;i++) {
    windows[i].id = i;
  }
  for (var i=0;i<windows.length;i++) {
    var typeID = -1;
    for (var j=0;j<windowtypes.length;j++) {
      if (windowtypes[j]==windows[i].type) {typeID = j;}
    }
    if (typeID==-1) {continue;}
    data.push(typeID);
    data.push(Math.floor(windows[i].x/256));
    data.push(Math.floor(windows[i].x%256));
    data.push(Math.floor(windows[i].y/256));
    data.push(Math.floor(windows[i].y%256));
    for (var j=0;j<windows[i].inputCount;j++) {
      if (windows[i].inputs[j]) {
        data.push(Math.floor(windows[i].inputs[j].id));
      } else {
        data.push(0xFF);
      }
    }
    for (var j=0;j<windows[i].outputCount;j++) {
      data.push(Math.floor(windows[i].inputMapping[j]));
    }
    for (var j=0;j<windows[i].outputCount;j++) {
      if (windows[i].outputs[j]) {
        data.push(Math.floor(windows[i].outputs[j].id));
      } else {
        data.push(0xFF);
      }
    }
    switch (windows[i].type) {
      case "output":
        data.push(Math.floor(windows[i].waveLength));
        break;
      case "help":
        break;
      case "sine":
      case "sawtooth":
      case "triangle":
        data.push(Math.floor(windows[i].multiplier));
        data.push(Math.floor(windows[i].mod_multiplier*100/12)+128);
        data.push(Math.floor(windows[i].phase*100));
        data.push(Math.floor(windows[i].mod_phase*100)+128);
        data.push(Math.floor(windows[i].amplitude*100));
        data.push(Math.floor(windows[i].mod_amplitude*100)+128);
        break;
      case "pulse":
        data.push(Math.floor(windows[i].multiplier));
        data.push(Math.floor(windows[i].mod_multiplier*100/12)+128);
        data.push(Math.floor(windows[i].phase*100));
        data.push(Math.floor(windows[i].mod_phase*100)+128);
        data.push(Math.floor(windows[i].amplitude*100));
        data.push(Math.floor(windows[i].mod_amplitude*100)+128);
        data.push(Math.floor(windows[i].pulseWidth*100));
        data.push(Math.floor(windows[i].mod_pulseWidth*100)+128);
        break;
      case "noise":
      case "pulsenoise":
      case "noiseconsistent":
      case "pulsenoiseconsistent":
        data.push(Math.floor(windows[i].amplitude*100));
        data.push(Math.floor(windows[i].mod_amplitude*100)+128);
        break;
      case "mixer":
      case "splitter":
      case "inverter":
      case "saturator":
      case "rectifier":
        break;
      case "feedback":
        data.push(Math.floor(windows[i].modulation*100));
        data.push(Math.floor(windows[i].mod_modulation*100/2)+128);
        break;
      case "phasemodulation":
      case "ringmodulation":
      case "syncer":
        data.push(Math.floor(windows[i].modulation*10));
        data.push(Math.floor(windows[i].mod_modulation*100/16)+128);
        break;
      case "gainer":
        data.push(Math.floor(windows[i].amplitude*50));
        data.push(Math.floor(windows[i].mod_amplitude*100/4)+128);
        break;
    case "quantizer":
    case "bitcrusher":
        data.push(Math.floor(windows[i].distortion*100));
        data.push(Math.floor(windows[i].mod_distortion*100)+128);
        break;
    case "lowpass":
    case "highpass":
        data.push(Math.floor(windows[i].cutoff*100));
        data.push(Math.floor(windows[i].mod_cutoff*100)+128);
        data.push(Math.floor(windows[i].resonance*100));
        data.push(Math.floor(windows[i].mod_resonance*100)+128);
        break;
    }
  }
  var file = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
  saveAs(URL.createObjectURL(file),"patch.eup");
  URL.revokeObjectURL(file);
}
function fileImport(file) {
  var reader = new FileReader();
  reader.addEventListener("load",_=>{
    var data = reader.result.split("").map(x=>x.charCodeAt(0));
    var pointer = 0;
    if (String.fromCharCode(data[pointer])+String.fromCharCode(data[pointer+1])=="FM") {
      alert("Invalid format. Expected WaveSynth patch, format is FM patch.");
      return;
    }
    if (String.fromCharCode(data[pointer])+String.fromCharCode(data[pointer+1])!="WS") {
      alert("Invalid format. Not WaveSynth patch format.");
      return;
    }
    pointer += 2;
    if (data[pointer]>0x01) {
      alert("File version too new! Expected version 1 or lower.");
      return;
    }
    pointer++;
    
    windows = [];
    var windowAmount = data[pointer]; pointer++;
    for (var i=0;i<windowAmount;i++) {
      var id = i;
      var typeID = data[pointer]; pointer++;
      var x = data[pointer]*256; pointer++;
      x += data[pointer]; pointer++;
      var y = data[pointer]*256; pointer++;
      y += data[pointer]; pointer++;
      windows[i] = new ElementWindow(x,y,windowtypes[typeID]);
      windows[i].inputIds = [];
      for (var j=0;j<windows[i].inputCount;j++) {
        if (data[pointer]!=0xFF) {windows[i].inputIds[j] = data[pointer];}
        pointer++;
      }
      for (var j=0;j<windows[i].outputCount;j++) {
        windows[i].inputMapping[j] = data[pointer]; pointer++;
      }
      windows[i].outputIds = [];
      for (var j=0;j<windows[i].outputCount;j++) {
        if (data[pointer]!=0xFF) {windows[i].outputIds[j] = data[pointer];}
        pointer++;
      }
      switch (windows[i].type) {
        case "output":
          windows[i].waveLength = data[pointer]; pointer++;
          windows[i].elements[1].value = windows[i].waveLength;
          break;
        case "help":
          break;
        case "sine":
        case "sawtooth":
        case "triangle":
          windows[i].multiplier = data[pointer]; pointer++;
          windows[i].mod_multiplier = (data[pointer]-128)*12/100; pointer++;
          windows[i].phase = data[pointer]/100; pointer++;
          windows[i].mod_phase = (data[pointer]-128)/100; pointer++;
          windows[i].amplitude = data[pointer]/100; pointer++;
          windows[i].mod_amplitude = (data[pointer]-128)/100; pointer++;
          windows[i].elements[0].value = windows[i].multiplier;
          windows[i].elements[1].value = windows[i].phase;
          windows[i].elements[2].value = windows[i].amplitude;
          windows[i].elements[3].value = windows[i].mod_multiplier;
          windows[i].elements[4].value = windows[i].mod_phase;
          windows[i].elements[5].value = windows[i].mod_amplitude;
          break;
        case "pulse":
          windows[i].multiplier = data[pointer]; pointer++;
          windows[i].mod_multiplier = (data[pointer]-128)*12/100; pointer++;
          windows[i].phase = data[pointer]/100; pointer++;
          windows[i].mod_phase = (data[pointer]-128)/100; pointer++;
          windows[i].amplitude = data[pointer]/100; pointer++;
          windows[i].mod_amplitude = (data[pointer]-128)/100; pointer++;
          windows[i].pulseWidth = data[pointer]/100; pointer++;
          windows[i].mod_pulseWidth = (data[pointer]-128)/100; pointer++;
          windows[i].elements[0].value = windows[i].multiplier;
          windows[i].elements[1].value = windows[i].phase;
          windows[i].elements[2].value = windows[i].amplitude;
          windows[i].elements[3].value = windows[i].pulseWidth;
          windows[i].elements[4].value = windows[i].mod_multiplier;
          windows[i].elements[5].value = windows[i].mod_phase;
          windows[i].elements[6].value = windows[i].mod_amplitude;
          windows[i].elements[7].value = windows[i].mod_pulseWidth;
          break;
        case "noise":
        case "pulsenoise":
        case "noiseconsistent":
        case "pulsenoiseconsistent":
          windows[i].amplitude = data[pointer]/100; pointer++;
          windows[i].mod_amplitude = (data[pointer]-128)/100; pointer++;
          windows[i].elements[0].value = windows[i].amplitude;
          windows[i].elements[1].value = windows[i].mod_amplitude;
          break;
        case "mixer":
        case "splitter":
        case "inverter":
        case "saturator":
        case "rectifier":
          break;
        case "feedback":
          windows[i].modulation = data[pointer]/100; pointer++;
          windows[i].mod_modulation = (data[pointer]-128)*2/100; pointer++;
          windows[i].elements[0].value = windows[i].modulation;
          windows[i].elements[1].value = windows[i].mod_modulation;
          break;
        case "phasemodulation":
        case "ringmodulation":
        case "syncer":
          windows[i].modulation = data[pointer]/10; pointer++;
          windows[i].mod_modulation = (data[pointer]-128)*16/100; pointer++;
          windows[i].elements[0].value = windows[i].modulation;
          windows[i].elements[1].value = windows[i].mod_modulation;
          break;
        case "gainer":
          windows[i].amplitude = data[pointer]/50; pointer++;
          windows[i].mod_amplitude = (data[pointer]-128)*4/100; pointer++;
          windows[i].elements[0].value = windows[i].amplitude;
          windows[i].elements[1].value = windows[i].mod_amplitude;
          break;
        case "quantizer":
        case "bitcrusher":
          windows[i].distortion = data[pointer]/100; pointer++;
          windows[i].mod_distortion = (data[pointer]-128)/100; pointer++;
          windows[i].elements[0].value = windows[i].distortion;
          windows[i].elements[1].value = windows[i].mod_distortion;
          break;
        case "lowpass":
        case "highpass":
          windows[i].cutoff = data[pointer]/100; pointer++;
          windows[i].mod_cutoff = (data[pointer]-128)/100; pointer++;
          windows[i].resonance = data[pointer]/100; pointer++;
          windows[i].mod_resonance = (data[pointer]-128)/100; pointer++;
          windows[i].elements[0].value = windows[i].cutoff;
          windows[i].elements[1].value = windows[i].resonance;
          windows[i].elements[2].value = windows[i].mod_cutoff;
          windows[i].elements[3].value = windows[i].mod_resonance;
          break;
      }
    }
    for (var i=0;i<windows.length;i++) {
      for (var j=0;j<windows[i].inputCount;j++) {
        windows[i].inputs[j] = windows[windows[i].inputIds[j]];
      }
      for (var j=0;j<windows[i].outputCount;j++) {
        windows[i].outputs[j] = windows[windows[i].outputIds[j]];
      }
    }
    needsUpdate = true;
    modulation = 1;
  });
  reader.readAsBinaryString(file);
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
