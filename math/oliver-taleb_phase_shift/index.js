
/// RENDER KATEX IN <katex-area> ///

var tempStr = "";
var substituteBrackets = function(str, brackets, depth) {
    var l=brackets[0], r=brackets[1];
    var depth = isNaN(parseInt(depth)) ? 0 : depth;
    
    // no more to search
    if (depth == 0) { tempStr=""; }
    var middles = XRegExp.matchRecursive(str, l[0], r[0], 'g', {escapeChar:"\\", unbalanced:"skip"});
    if (middles.length == 0) {tempStr += str;}
    
    // search further
    var m = XRegExp.matchRecursive(str, l[0], r[0], 'g', {escapeChar:"\\", unbalanced:"skip", valueNames:["outside","left","middle","right"]});
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

const macros = {
    "\\C": "\\mathbb{C}",
    "\\(": "(",
    "\\)": ")",
    "\\[": "[",
    "\\]": "]",
    "/": "\\over",
    "\\f": "\\operatorname{f}",
    "\\union": "\\cup",
    "\\intersection": "\\cap",
    "\\matrix": "\\begin{matrix}#1\\end{matrix}",
    "\\pmatrix": "\\begin{pmatrix}#1\\end{pmatrix}",
    "\\bmatrix": "\\begin{bmatrix}#1\\end{bmatrix}",
    "\\Bmatrix": "\\begin{Bmatrix}#1\\end{Bmatrix}",
    "\\vmatrix": "\\begin{vmatrix}#1\\end{vmatrix}",
    "\\Vmatrix": "\\begin{Vmatrix}#1\\end{Vmatrix}",
    "\\mat": "\\begin{matrix}#1\\end{matrix}",
    "\\pmat": "\\begin{pmatrix}#1\\end{pmatrix}",
    "\\bmat": "\\begin{bmatrix}#1\\end{bmatrix}",
    "\\Bmat": "\\begin{Bmatrix}#1\\end{Bmatrix}",
    "\\vmat": "\\begin{vmatrix}#1\\end{vmatrix}",
    "\\Vmat": "\\begin{Vmatrix}#1\\end{Vmatrix}"
};

var katex_areas = document.getElementsByTagName("katex-area");

for ( var element of katex_areas ) {
    var value = element.innerHTML;
    
    value = substituteBrackets( value, [[ "\\(", "\\!\\left(" ], [ "\\)", "\\right)" ]] );
    value = XRegExp.replace( value, /[\r\n](?=.)/g, "\\\\" );
    value = XRegExp.replace( value, /[\r\n]/g, "\\\\\\\n" );
    value = XRegExp.replace( value, /&amp;/g, "&" );
    value = XRegExp.replace( value, /\\\*/g, "*" );
    
    katex.render( value, element, { throwOnError:false, displayMode:true, fleqn:true, macros } );
}

/// EXPAND <details> ON PRINT ///

window.matchMedia("print").addEventListener("change", evt => {
    if (evt.matches) {
        elms = document.body.querySelectorAll("details:not([open])");
        for (e of elms) {
            e.setAttribute("open", "");
            e.dataset.wasclosed = "";
        }
    } else {
        elms = document.body.querySelectorAll("details[data-wasclosed]");
        for (e of elms) {
            e.removeAttribute("open");
            delete e.dataset.wasclosed;
        }
    }
});
