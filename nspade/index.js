const Row1 = 1;
const Row2 = 2;
const Row3 = 3;

const Column1 = 1;
const Column2 = 2;
const Column3 = 3;
const Column4 = 4;
const Column5 = 5;
const Column6 = 6;

const Map1 = 1;
const Map2 = 2;
const Map3 = 3;
const Map4 = 4;
const Map5 = 5;
const Map6 = 6;
const Map7 = 7;
const Map8 = 8;

const Unknown = -1;

var panels = [];
var safePanels = [];

class Panel {
    constructor(row,column,element) {
        this.row = row;
        this.column = column;
        this.element = element;
        this.element.id = row+""+column;
        this.image = element.querySelector("img");
        this.reset();
    }
    reset() {
        this.value = "blank";
        this.image.src = "blank.png";
    }
    update(value) {
        this.value = value;
        this.image.src = value+".png";
    }
}
var panelSelectUpdate = function(event) {
    var selectElement = event.target;
    var positionString = selectElement.getAttribute("position");
    var row = parseInt(positionString.charAt(0));
    var column = parseInt(positionString.charAt(1));
    panels[row][column].update(selectElement.value);
    console.log(panels[row][column].value);
    checkPanels();
    selectElement.remove();
}

function checkPanels() {
    var knownMap = Unknown;
    for (var mapIndex=Map1; mapIndex<=Map8; mapIndex++) {
        var panelsMatch = false;
        for (var panelIndex=0; panelIndex<safePanels.length; panelIndex++) {
            var panel = safePanels[panelIndex];
            var mapPowerup = maps[mapIndex][panel.row][panel.column-1];
            if (mapPowerup != panel.value) { panelsMatch = false; break; }
            panelsMatch = true;
        }
        if (panelsMatch) {
            knownMap = mapIndex;
            break;
        }
    }
    if (knownMap != Unknown) {
        for (var row=Row1; row<=Row3; row++) {
            for (var column=Column1; column<=Column6; column++) {
                var powerup = maps[knownMap][row][column-1];
                panels[row][column].update(powerup);
            }
        }
    }
}

function reset() {
    var oldForm = document.querySelector("form");
    if (oldForm) { oldForm.remove(); }
    
    safePanels = [];
    
    var form = document.createElement("form");

    var panelGrid = document.createElement("panel-grid");
    var resetDiv = document.createElement("div");
    var resetButton = document.createElement("input");

    resetDiv.appendChild(resetButton);

    resetButton.type = "reset";
    resetButton.addEventListener("click", reset);
    
    
    form.appendChild(panelGrid);
    form.appendChild(resetDiv);
    
    var description = document.createElement("p");
    description.innerHTML = "Hit the panels in game that are highlighted above.<br/>Then, select the items that came up in each panel, and the rest of the panels will be filled out automatically.";
    form.appendChild(description);
    
    var linkDiv = document.createElement("div");
    linkDiv.classList.add("links");
    
    var nsmbwLink = document.createElement("a");
    var smb3Link = document.createElement("a");
    
    nsmbwLink.href = "/poweruppanels/";
    nsmbwLink.textContent = "NSMBW";
    smb3Link.href = "/nspade/";
    smb3Link.textContent = "SMB3";
    
    linkDiv.appendChild(nsmbwLink);
    linkDiv.appendChild(smb3Link);
    
    form.appendChild(linkDiv);
    
    document.body.appendChild(form);
    for (var row=Row1; row<=Row3; row++) {
        panels[row] = [];
        for (var column=Column1; column<=Column6; column++) {
            var panelCell = document.createElement("panel-cell");
            var panelLabel = document.createElement("label");
            var panelImage = document.createElement("img");
            panelLabel.appendChild(panelImage);
            panelCell.appendChild(panelLabel);
            
            panels[row][column] = new Panel(row,column,panelCell);
            panelGrid.appendChild(panelCell);
            
            if (guarantees.includes(row+""+column)) {
                var powerup = maps[Map1][row][column-1];
                panels[row][column].update(powerup);
            }
            
            if (uniqueSpots.includes(row+""+column)) {
                panelCell.classList.add("safe");
                safePanels.push(panels[row][column]);
            } else {
                continue;
            }
            
            var panelSelect = document.createElement("select");
            panelSelect.setAttribute("position",row+""+column);
            panelCell.appendChild(panelSelect);
            var optionList = [];
            for (var map=Map1; map<=Map8; map++) {
                var powerup = maps[map][row][column-1];
                if (optionList.includes(powerup)) { continue; }
                var panelOption = document.createElement("option");
                panelOption.value = powerup;
                panelOption.textContent = itemNames[powerup];
                panelSelect.appendChild(panelOption);
                optionList.push(powerup);
            }
            panelSelect.addEventListener("input", panelSelectUpdate);
            panelSelect.value = "blank";
        }
    }
}

var itemNames = {};
itemNames["blank"] = "";
itemNames["1up"] = "1-Up";
itemNames["10coins"] = "10 Coins";
itemNames["20coins"] = "20 Coins";
itemNames["flower"] = "Fire Flower";
itemNames["mushroom"] = "Super Mushroom";
itemNames["star"] = "Super Star";
var uniqueSpots = ["21","22","23"];
var guarantees = ["34","35","36"];
var maps = {};
maps = {};
maps[Map1] = {};
maps[Map1][Row1] = ["mushroom","flower","20coins","mushroom","10coins","star"];
maps[Map1][Row2] = ["flower","1up","mushroom","10coins","1up","20coins"];
maps[Map1][Row3] = ["star","flower","star","mushroom","flower","star"];
maps[Map2] = {};
maps[Map2][Row1] = ["mushroom","flower","20coins","flower","10coins","star"];
maps[Map2][Row2] = ["20coins","1up","mushroom","10coins","1up","flower"];
maps[Map2][Row3] = ["star","mushroom","star","mushroom","flower","star"];
maps[Map3] = {};
maps[Map3][Row1] = ["mushroom","flower","1up","flower","star","star"];
maps[Map3][Row2] = ["20coins","star","mushroom","10coins","1up","flower"];
maps[Map3][Row3] = ["20coins","mushroom","10coins","mushroom","flower","star"];
maps[Map4] = {};
maps[Map4][Row1] = ["flower","10coins","1up","flower","1up","mushroom"];
maps[Map4][Row2] = ["star","mushroom","20coins","star","mushroom","10coins"];
maps[Map4][Row3] = ["star","flower","20coins","mushroom","flower","star"];
maps[Map5] = {};
maps[Map5][Row1] = ["flower","20coins","mushroom","star","1up","flower"];
maps[Map5][Row2] = ["1up","flower","10coins","mushroom","20coins","star"];
maps[Map5][Row3] = ["mushroom","10coins","star","mushroom","flower","star"];
maps[Map6] = {};
maps[Map6][Row1] = ["flower","star","1up","flower","20coins","mushroom"];
maps[Map6][Row2] = ["10coins","mushroom","20coins","1up","mushroom","10coins"];
maps[Map6][Row3] = ["star","flower","star","mushroom","flower","star"];
maps[Map7] = {};
maps[Map7][Row1] = ["flower","star","1up","flower","1up","mushroom"];
maps[Map7][Row2] = ["10coins","mushroom","flower","star","mushroom","10coins"];
maps[Map7][Row3] = ["star","20coins","20coins","mushroom","flower","star"];
maps[Map8] = {};
maps[Map8][Row1] = ["1up","mushroom","10coins","mushroom","flower","star"];
maps[Map8][Row2] = ["mushroom","10coins","star","20coins","20coins","flower"];
maps[Map8][Row3] = ["star","1up","flower","mushroom","flower","star"];

reset();
