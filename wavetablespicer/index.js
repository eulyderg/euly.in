let waveel = document.querySelector(".wave");
waveel.onchange = function(e) {generate(waveel.value.split(" ;").join("").split(",").join(" ").trimEnd());};
let textarea = document.querySelector(".textarea");
textarea.onclick = function(e) {textarea.select();document.execCommand('copy');};
function generate(wavedata) {
    // setup //
    var wave = wavedata.split(" ").map(x=>parseInt(x));
    var wavetable = "";            // wavetable string
    const depth = 16;              // depth
    const length = wave.length;
    for (var p=0;p<length;p++) {
        // calculate //
        for (var i=0;i<length;i++) {
            let x = i;
            let x_p = (i+p)%length;
            let output = Math.floor(wave[x]*0.75+wave[x_p]*0.25);
            // add sample //
            wavetable += Math.floor(output)+" ";
        }
        // add newline //
        wavetable += ";\n";
    }
    textarea.value = wavetable;
    return wavetable;
}
generate(waveel.value.split(";").join("").split(",").join("").trimEnd());
let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext("2d");
let phase = 0;
function draw() {
    let wavetables = textarea.value.split(" ;\n");
    if (wavetables[phase]) {
        let wavetable = wavetables[phase].split(" ").map(x=>parseInt(x));
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        for (var i=0;i<wavetable.length;i++) {
            ctx.fillRect(i*2, canvas.height-wavetable[i]*2-2, 2, 2);
        }
        phase = phase+1;
        while (phase >= wavetables.length-1) {phase -= wavetables.length-1;}
    }
    window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);
