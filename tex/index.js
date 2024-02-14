// load dark.css stylesheet
if (window.location.search == "?dark") {
    var darkStyle_Element = document.createElement("link");
    darkStyle_Element.href = "dark.css";
    darkStyle_Element.rel = "stylesheet";
    document.head.appendChild(darkStyle_Element);
}

// get elements on page
const textarea = document.querySelector("textarea");
const mathContainer = document.querySelector("katex-output");
const math = document.createElement("div");

// enable textarea -- javascript is enabled!
textarea.disabled = false;

// set event listeners
function UpdateTextbox() {
    textarea.style.height = "0px"; // to reset textarea.scrollHeight properly
    textarea.style.height = (textarea.scrollHeight - 8) + "px";
    UpdateMath();
}

textarea.addEventListener("input", UpdateTextbox, false);
window.addEventListener("resize", UpdateTextbox, false);

// helper function: finds and replaces balanced backets.
var tempStr = "";
var substituteBrackets = function(str, brackets, depth) {
    var l=brackets[0], r=brackets[1];
    var depth = isNaN(parseInt(depth)) ? 0 : depth;
    
    // no more to search
    if (depth == 0) { tempStr=""; }
    var middles = XRegExp.matchRecursive(str, l[0], r[0], "g", { escapeChar:"\\", unbalanced:"skip" });
    if (middles.length == 0) {tempStr += str;}
    
    // search further
    var m = XRegExp.matchRecursive(str, l[0], r[0], "g", { escapeChar:"\\", unbalanced:"skip", valueNames:["outside", "left", "middle", "right"] });
    for (var i=0;i<m.length;i++) {
        var part = m[i];
        switch(part.name) {
            case "outside": tempStr += part.value; break;
            case "left": tempStr += l[1]; break;
            case "middle": substituteBrackets(part.value, brackets, depth+1); break;
            case "right": tempStr += r[1]; break;
        }
    }
    // return
    if (depth == 0) { return tempStr; }
}

// macro list for katex
const macros = {
    "\\C":              "\\mathbb{C}",
    "\\(":              "(",
    "\\)":              ")",
    "\\[":              "[",
    "\\]":              "]",
    "/":                "\\over",
    "\\f":              "\\operatorname{f}",
    "\\union":          "\\cup",
    "\\intersect":      "\\cap",
    "\\intersection":   "\\cap",
    "\\matrix":         "\\begin{matrix}#1\\end{matrix}",
    "\\pmatrix":        "\\begin{pmatrix}#1\\end{pmatrix}",
    "\\bmatrix":        "\\begin{bmatrix}#1\\end{bmatrix}",
    "\\Bmatrix":        "\\begin{Bmatrix}#1\\end{Bmatrix}",
    "\\vmatrix":        "\\begin{vmatrix}#1\\end{vmatrix}",
    "\\Vmatrix":        "\\begin{Vmatrix}#1\\end{Vmatrix}",
    "\\mat":            "\\begin{matrix}#1\\end{matrix}",
    "\\pmat":           "\\begin{pmatrix}#1\\end{pmatrix}",
    "\\bmat":           "\\begin{bmatrix}#1\\end{bmatrix}",
    "\\Bmat":           "\\begin{Bmatrix}#1\\end{Bmatrix}",
    "\\vmat":           "\\begin{vmatrix}#1\\end{vmatrix}",
    "\\Vmat":           "\\begin{Vmatrix}#1\\end{Vmatrix}",
    "\\aligned":        "\\begin{aligned}#1\\end{aligned}",
    "\\phaseshift":     "\\overset{#1}{\\rm{P}}",
    "\\FT":             "{\\cal F}",
    "\\sgn":            "\\operatorname{sgn}",
    "\\ihat":           "\\hat\\imath",
    "\\jhat":           "\\,\\hat{\\!\\jmath}",
    "\\khat":           "\\hat{k}"
};

// updates the output display
function UpdateMath() {
    // get input tex
    var input = textarea.value;
    
    // preprocess the input tex
    input = substituteBrackets( input, [[ "\\(", "\\!\\left(" ], [ "\\)", "\\right)" ]] );
    input = XRegExp.replace( input, /[\r\n](?=.)/g, "\\\\" );
    input = XRegExp.replace( input, /[\r\n]/g, "\\\\\\\n" );
    input = XRegExp.replace( input, /\>\=/g, "\\ge " );
    input = XRegExp.replace( input, /\!\=/g, "\\ne " );
    input = XRegExp.replace( input, /\<\=/g, "\\le " );
    input = XRegExp.replace( input, /\\\*/g, "\\ast " );
    input = XRegExp.replace( input, /\*/g, "\\cdot " );
    input = XRegExp.replace( input, /\\ast\b/g, "*" );
    
    // clear all contents of output container
    while (mathContainer.firstChild) { mathContainer.removeChild(mathContainer.lastChild); }
    
    // fill output container with new contents
    katex.render( input, math, { throwOnError:false, displayMode:true, macros } );
    mathContainer.appendChild(math);
}
