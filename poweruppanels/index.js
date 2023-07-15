const World1 = 1;
const World2 = 2;
const World3 = 3;
const World4 = 4;
const World5 = 5;
const World6 = 6;
const World7 = 7;
const World8 = 8;
const World9 = 9;

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

const Unknown = -1;

var world = World1;
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

var worldSelectUpdate = function(event) { world=parseInt(event.target.value); reset(); }
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
    for (var mapIndex=Map1; mapIndex<=Map6; mapIndex++) {
        var panelsMatch = false;
        for (var panelIndex=0; panelIndex<safePanels.length; panelIndex++) {
            var panel = safePanels[panelIndex];
            var mapPowerup = maps[world][mapIndex][panel.row][panel.column-1];
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
                var powerup = maps[world][knownMap][row][column-1];
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
    var worldDiv = document.createElement("div");
    var worldLabel = document.createElement("label");
    var worldSelect = document.createElement("select");
    worldDiv.appendChild(worldLabel);
    worldDiv.appendChild(worldSelect);

    worldSelect.setAttribute("id", "world");
    worldLabel.setAttribute("for","world");
    worldLabel.textContent = "World ";

    for (var wld=World1; wld<=World9; wld++) {
        var worldOption = document.createElement("option");
        worldOption.value = wld;
        worldOption.textContent = wld;
        worldSelect.appendChild(worldOption);
    }
    
    worldSelect.value = world;
    worldSelect.addEventListener("change", worldSelectUpdate);

    var panelGrid = document.createElement("panel-grid");
    var resetDiv = document.createElement("div");
    var resetButton = document.createElement("input");

    resetDiv.appendChild(resetButton);

    resetButton.type = "reset";
    resetButton.addEventListener("click", reset);

    form.appendChild(worldDiv);
    form.appendChild(panelGrid);
    form.appendChild(resetDiv);
    
    var description = document.createElement("p");
    description.innerHTML = "Select your world number above and hit the panels in game that are highlighted above.<br/>Then, select the items that came up in each panel, and the rest of the panels will be filled out automatically.";
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
            
            if (safeSpots[world].includes(row+""+column)) {
                panelCell.classList.add("safe");
                safePanels.push(panels[row][column]);
            } else {
                continue;
            }
            
            var panelSelect = document.createElement("select");
            panelSelect.setAttribute("position",row+""+column);
            panelCell.appendChild(panelSelect);
            var optionList = [];
            for (var map=Map1; map<=Map6; map++) {
                var powerup = maps[world][map][row][column-1];
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
itemNames["bowser"] = "Bowser";
itemNames["bowserjr"] = "Bowser Jr.";
itemNames["fireflower"] = "Fire Flower";
itemNames["iceflower"] = "Ice Flower";
itemNames["minimushroom"] = "Mini Mushroom";
itemNames["penguinsuit"] = "Penguin Suit";
itemNames["propellermushroom"] = "Propeller Mushroom";
itemNames["supermushroom"] = "Super Mushroom";
itemNames["superstar"] = "Super Star";
var safeSpots = {};
safeSpots[World1] = ["21","23","31"];
safeSpots[World2] = ["12","14"];
safeSpots[World3] = ["23","31","34"];
safeSpots[World4] = ["12","16","25"];
safeSpots[World5] = ["34","35"];
safeSpots[World6] = ["13","26","32"];
safeSpots[World7] = ["15","16","36"];
safeSpots[World8] = ["15","16","34"];
safeSpots[World9] = ["12","16","26","36"];
var maps = {};
maps[World1] = {};
maps[World1][Map1] = {};
maps[World1][Map1][Row1] = ["iceflower","propellermushroom","fireflower","supermushroom","bowser","bowserjr"];
maps[World1][Map1][Row2] = ["supermushroom","iceflower","propellermushroom","bowser","iceflower","propellermushroom"];
maps[World1][Map1][Row3] = ["fireflower","bowserjr","iceflower","propellermushroom","fireflower","fireflower"];
maps[World1][Map2] = {};
maps[World1][Map2][Row1] = ["bowserjr","iceflower","fireflower","fireflower","propellermushroom","propellermushroom"];
maps[World1][Map2][Row2] = ["fireflower","bowser","propellermushroom","supermushroom","iceflower","bowserjr"];
maps[World1][Map2][Row3] = ["iceflower","propellermushroom","supermushroom","bowser","fireflower","iceflower"];
maps[World1][Map3] = {};
maps[World1][Map3][Row1] = ["bowserjr","propellermushroom","fireflower","supermushroom","superstar","propellermushroom"];
maps[World1][Map3][Row2] = ["supermushroom","iceflower","fireflower","bowser","iceflower","superstar"];
maps[World1][Map3][Row3] = ["fireflower","bowserjr","iceflower","bowser","fireflower","iceflower"];
maps[World1][Map4] = {};
maps[World1][Map4][Row1] = ["propellermushroom","propellermushroom","iceflower","fireflower","bowser","propellermushroom"];
maps[World1][Map4][Row2] = ["fireflower","bowser","fireflower","supermushroom","iceflower","bowserjr"];
maps[World1][Map4][Row3] = ["iceflower","bowserjr","supermushroom","propellermushroom","fireflower","iceflower"];
maps[World1][Map5] = {};
maps[World1][Map5][Row1] = ["iceflower","iceflower","fireflower","fireflower","propellermushroom","bowserjr"];
maps[World1][Map5][Row2] = ["supermushroom","bowser","fireflower","bowser","fireflower","superstar"];
maps[World1][Map5][Row3] = ["iceflower","superstar","supermushroom","propellermushroom","bowserjr","iceflower"];
maps[World1][Map6] = {};
maps[World1][Map6][Row1] = ["propellermushroom","iceflower","iceflower","supermushroom","bowser","propellermushroom"];
maps[World1][Map6][Row2] = ["fireflower","iceflower","propellermushroom","supermushroom","fireflower","bowserjr"];
maps[World1][Map6][Row3] = ["fireflower","propellermushroom","iceflower","bowser","bowserjr","fireflower"];

maps[World2] = {};
maps[World2][Map1] = {};
maps[World2][Map1][Row1] = ["minimushroom","propellermushroom","propellermushroom","minimushroom","superstar","propellermushroom"];
maps[World2][Map1][Row2] = ["superstar","fireflower","bowser","iceflower","minimushroom","bowserjr"];
maps[World2][Map1][Row3] = ["minimushroom","bowser","fireflower","bowserjr","iceflower","propellermushroom"];
maps[World2][Map2] = {};
maps[World2][Map2][Row1] = ["propellermushroom","minimushroom","propellermushroom","minimushroom","bowserjr","propellermushroom"];
maps[World2][Map2][Row2] = ["bowser","fireflower","propellermushroom","iceflower","minimushroom","bowserjr"];
maps[World2][Map2][Row3] = ["iceflower","fireflower","fireflower","minimushroom","bowser","fireflower"];
maps[World2][Map3] = {};
maps[World2][Map3][Row1] = ["bowserjr","propellermushroom","fireflower","fireflower","propellermushroom","propellermushroom"];
maps[World2][Map3][Row2] = ["minimushroom","iceflower","propellermushroom","iceflower","minimushroom","minimushroom"];
maps[World2][Map3][Row3] = ["minimushroom","bowser","fireflower","bowserjr","bowser","fireflower"];
maps[World2][Map4] = {};
maps[World2][Map4][Row1] = ["bowserjr","minimushroom","fireflower","fireflower","propellermushroom","bowser"];
maps[World2][Map4][Row2] = ["minimushroom","iceflower","bowser","iceflower","bowserjr","minimushroom"];
maps[World2][Map4][Row3] = ["iceflower","propellermushroom","propellermushroom","minimushroom","iceflower","propellermushroom"];
maps[World2][Map5] = {};
maps[World2][Map5][Row1] = ["minimushroom","propellermushroom","bowser","iceflower","superstar","propellermushroom"];
maps[World2][Map5][Row2] = ["bowser","iceflower","propellermushroom","minimushroom","bowserjr","bowserjr"];
maps[World2][Map5][Row3] = ["minimushroom","superstar","fireflower","minimushroom","propellermushroom","fireflower"];
maps[World2][Map6] = {};
maps[World2][Map6][Row1] = ["propellermushroom","minimushroom","bowser","iceflower","bowserjr","bowser"];
maps[World2][Map6][Row2] = ["minimushroom","fireflower","propellermushroom","iceflower","minimushroom","minimushroom"];
maps[World2][Map6][Row3] = ["iceflower","propellermushroom","propellermushroom","bowserjr","iceflower","fireflower"];

maps[World3] = {};
maps[World3][Map1] = {};
maps[World3][Map1][Row1] = ["bowserjr","bowser","bowser","minimushroom","superstar","penguinsuit"];
maps[World3][Map1][Row2] = ["fireflower","penguinsuit","penguinsuit","iceflower","bowserjr","minimushroom"];
maps[World3][Map1][Row3] = ["iceflower","penguinsuit","propellermushroom","propellermushroom","superstar","fireflower"];
maps[World3][Map2] = {};
maps[World3][Map2][Row1] = ["iceflower","minimushroom","bowser","penguinsuit","minimushroom","penguinsuit"];
maps[World3][Map2][Row2] = ["fireflower","minimushroom","minimushroom","fireflower","penguinsuit","bowser"];
maps[World3][Map2][Row3] = ["penguinsuit","bowserjr","fireflower","fireflower","bowserjr","iceflower"];
maps[World3][Map3] = {};
maps[World3][Map3][Row1] = ["superstar","bowser","penguinsuit","propellermushroom","bowserjr","penguinsuit"];
maps[World3][Map3][Row2] = ["minimushroom","minimushroom","penguinsuit","fireflower","bowserjr","bowser"];
maps[World3][Map3][Row3] = ["iceflower","penguinsuit","propellermushroom","fireflower","superstar","iceflower"];
maps[World3][Map4] = {};
maps[World3][Map4][Row1] = ["iceflower","minimushroom","penguinsuit","penguinsuit","minimushroom","iceflower"];
maps[World3][Map4][Row2] = ["iceflower","bowser","minimushroom","fireflower","bowserjr","bowser"];
maps[World3][Map4][Row3] = ["penguinsuit","penguinsuit","fireflower","minimushroom","bowserjr","iceflower"];
maps[World3][Map5] = {};
maps[World3][Map5][Row1] = ["bowserjr","bowser","bowser","minimushroom","minimushroom","penguinsuit"];
maps[World3][Map5][Row2] = ["fireflower","penguinsuit","minimushroom","fireflower","penguinsuit","minimushroom"];
maps[World3][Map5][Row3] = ["iceflower","bowserjr","fireflower","fireflower","penguinsuit","iceflower"];
maps[World3][Map6] = {};
maps[World3][Map6][Row1] = ["iceflower","minimushroom","bowser","minimushroom","bowserjr","iceflower"];
maps[World3][Map6][Row2] = ["iceflower","minimushroom","penguinsuit","iceflower","penguinsuit","bowser"];
maps[World3][Map6][Row3] = ["penguinsuit","bowserjr","fireflower","minimushroom","penguinsuit","fireflower"];

maps[World4] = {};
maps[World4][Map1] = {};
maps[World4][Map1][Row1] = ["bowser","propellermushroom","fireflower","propellermushroom","bowserjr","penguinsuit"];
maps[World4][Map1][Row2] = ["propellermushroom","bowserjr","iceflower","minimushroom","propellermushroom","iceflower"];
maps[World4][Map1][Row3] = ["bowser","minimushroom","fireflower","superstar","penguinsuit","superstar"];
maps[World4][Map2] = {};
maps[World4][Map2][Row1] = ["bowserjr","penguinsuit","penguinsuit","propellermushroom","bowserjr","penguinsuit"];
maps[World4][Map2][Row2] = ["minimushroom","fireflower","minimushroom","minimushroom","iceflower","iceflower"];
maps[World4][Map2][Row3] = ["bowser","bowser","propellermushroom","fireflower","minimushroom","penguinsuit"];
maps[World4][Map3] = {};
maps[World4][Map3][Row1] = ["penguinsuit","propellermushroom","fireflower","fireflower","minimushroom","penguinsuit"];
maps[World4][Map3][Row2] = ["minimushroom","bowserjr","minimushroom","bowser","iceflower","bowserjr"];
maps[World4][Map3][Row3] = ["penguinsuit","minimushroom","propellermushroom","iceflower","penguinsuit","bowser"];
maps[World4][Map4] = {};
maps[World4][Map4][Row1] = ["bowser","penguinsuit","fireflower","propellermushroom","minimushroom","penguinsuit"];
maps[World4][Map4][Row2] = ["minimushroom","bowserjr","iceflower","bowser","propellermushroom","bowserjr"];
maps[World4][Map4][Row3] = ["penguinsuit","minimushroom","iceflower","fireflower","minimushroom","penguinsuit"];
maps[World4][Map5] = {};
maps[World4][Map5][Row1] = ["bowserjr","propellermushroom","penguinsuit","propellermushroom","superstar","propellermushroom"];
maps[World4][Map5][Row2] = ["propellermushroom","fireflower","minimushroom","bowser","iceflower","iceflower"];
maps[World4][Map5][Row3] = ["penguinsuit","bowser","fireflower","bowserjr","minimushroom","superstar"];
maps[World4][Map6] = {};
maps[World4][Map6][Row1] = ["penguinsuit","penguinsuit","penguinsuit","fireflower","bowserjr","propellermushroom"];
maps[World4][Map6][Row2] = ["minimushroom","fireflower","minimushroom","minimushroom","propellermushroom","iceflower"];
maps[World4][Map6][Row3] = ["penguinsuit","bowser","iceflower","bowserjr","minimushroom","bowser"];

maps[World5] = {};
maps[World5][Map1] = {};
maps[World5][Map1][Row1] = ["iceflower","minimushroom","fireflower","minimushroom","penguinsuit","propellermushroom"];
maps[World5][Map1][Row2] = ["iceflower","bowser","iceflower","penguinsuit","fireflower","bowserjr"];
maps[World5][Map1][Row3] = ["fireflower","bowser","bowserjr","propellermushroom","iceflower","fireflower"];
maps[World5][Map2] = {};
maps[World5][Map2][Row1] = ["iceflower","penguinsuit","fireflower","iceflower","superstar","iceflower"];
maps[World5][Map2][Row2] = ["propellermushroom","bowser","bowserjr","superstar","bowser","bowserjr"];
maps[World5][Map2][Row3] = ["iceflower","penguinsuit","propellermushroom","fireflower","minimushroom","minimushroom"];
maps[World5][Map3] = {};
maps[World5][Map3][Row1] = ["iceflower","propellermushroom","fireflower","minimushroom","bowser","iceflower"];
maps[World5][Map3][Row2] = ["iceflower","bowser","bowserjr","penguinsuit","fireflower","propellermushroom"];
maps[World5][Map3][Row3] = ["fireflower","penguinsuit","bowserjr","iceflower","minimushroom","fireflower"];
maps[World5][Map4] = {};
maps[World5][Map4][Row1] = ["bowser","minimushroom","fireflower","iceflower","penguinsuit","propellermushroom"];
maps[World5][Map4][Row2] = ["propellermushroom","propellermushroom","iceflower","bowserjr","bowser","bowserjr"];
maps[World5][Map4][Row3] = ["iceflower","penguinsuit","propellermushroom","fireflower","iceflower","minimushroom"];
maps[World5][Map5] = {};
maps[World5][Map5][Row1] = ["bowser","minimushroom","bowserjr","iceflower","penguinsuit","propellermushroom"];
maps[World5][Map5][Row2] = ["iceflower","superstar","iceflower","superstar","fireflower","bowserjr"];
maps[World5][Map5][Row3] = ["iceflower","bowser","minimushroom","propellermushroom","penguinsuit","fireflower"];
maps[World5][Map6] = {};
maps[World5][Map6][Row1] = ["bowser","propellermushroom","bowserjr","minimushroom","bowser","propellermushroom"];
maps[World5][Map6][Row2] = ["iceflower","propellermushroom","iceflower","bowserjr","fireflower","propellermushroom"];
maps[World5][Map6][Row3] = ["iceflower","penguinsuit","minimushroom","iceflower","penguinsuit","fireflower"];

maps[World6] = {};
maps[World6][Map1] = {};
maps[World6][Map1][Row1] = ["bowser","superstar","iceflower","propellermushroom","bowser","fireflower"];
maps[World6][Map1][Row2] = ["fireflower","superstar","fireflower","bowserjr","bowserjr","fireflower"];
maps[World6][Map1][Row3] = ["minimushroom","iceflower","penguinsuit","penguinsuit","propellermushroom","minimushroom"];
maps[World6][Map2] = {};
maps[World6][Map2][Row1] = ["bowser","bowserjr","minimushroom","propellermushroom","fireflower","bowserjr"];
maps[World6][Map2][Row2] = ["minimushroom","fireflower","fireflower","iceflower","fireflower","penguinsuit"];
maps[World6][Map2][Row3] = ["minimushroom","iceflower","penguinsuit","bowser","propellermushroom","minimushroom"];
maps[World6][Map3] = {};
maps[World6][Map3][Row1] = ["bowser","bowserjr","iceflower","penguinsuit","fireflower","propellermushroom"];
maps[World6][Map3][Row2] = ["fireflower","bowser","iceflower","iceflower","bowserjr","fireflower"];
maps[World6][Map3][Row3] = ["minimushroom","fireflower","penguinsuit","iceflower","propellermushroom","minimushroom"];
maps[World6][Map4] = {};
maps[World6][Map4][Row1] = ["propellermushroom","fireflower","minimushroom","propellermushroom","penguinsuit","fireflower"];
maps[World6][Map4][Row2] = ["minimushroom","superstar","iceflower","superstar","bowserjr","penguinsuit"];
maps[World6][Map4][Row3] = ["iceflower","fireflower","bowser","bowser","fireflower","bowserjr"];
maps[World6][Map5] = {};
maps[World6][Map5][Row1] = ["propellermushroom","fireflower","minimushroom","penguinsuit","bowser","propellermushroom"];
maps[World6][Map5][Row2] = ["minimushroom","fireflower","iceflower","iceflower","bowserjr","fireflower"];
maps[World6][Map5][Row3] = ["iceflower","iceflower","bowser","penguinsuit","fireflower","bowserjr"];
maps[World6][Map6] = {};
maps[World6][Map6][Row1] = ["propellermushroom","minimushroom","fireflower","propellermushroom","penguinsuit","bowserjr"];
maps[World6][Map6][Row2] = ["minimushroom","bowser","iceflower","bowserjr","fireflower","penguinsuit"];
maps[World6][Map6][Row3] = ["minimushroom","fireflower","bowser","iceflower","fireflower","minimushroom"];

maps[World7] = {};
maps[World7][Map1] = {};
maps[World7][Map1][Row1] = ["propellermushroom","bowser","bowserjr","iceflower","iceflower","propellermushroom"];
maps[World7][Map1][Row2] = ["propellermushroom","superstar","minimushroom","penguinsuit","bowser","superstar"];
maps[World7][Map1][Row3] = ["fireflower","bowserjr","propellermushroom","minimushroom","fireflower","penguinsuit"];
maps[World7][Map2] = {};
maps[World7][Map2][Row1] = ["propellermushroom","fireflower","bowserjr","iceflower","minimushroom","minimushroom"];
maps[World7][Map2][Row2] = ["bowser","bowserjr","iceflower","penguinsuit","bowser","minimushroom"];
maps[World7][Map2][Row3] = ["penguinsuit","propellermushroom","propellermushroom","minimushroom","fireflower","propellermushroom"];
maps[World7][Map3] = {};
maps[World7][Map3][Row1] = ["bowser","fireflower","bowserjr","propellermushroom","iceflower","propellermushroom"];
maps[World7][Map3][Row2] = ["bowser","superstar","propellermushroom","penguinsuit","iceflower","bowserjr"];
maps[World7][Map3][Row3] = ["fireflower","propellermushroom","penguinsuit","minimushroom","superstar","minimushroom"];
maps[World7][Map4] = {};
maps[World7][Map4][Row1] = ["propellermushroom","bowser","propellermushroom","propellermushroom","minimushroom","minimushroom"];
maps[World7][Map4][Row2] = ["bowser","minimushroom","iceflower","minimushroom","iceflower","bowserjr"];
maps[World7][Map4][Row3] = ["fireflower","propellermushroom","penguinsuit","fireflower","bowserjr","penguinsuit"];
maps[World7][Map5] = {};
maps[World7][Map5][Row1] = ["bowser","fireflower","propellermushroom","iceflower","iceflower","minimushroom"];
maps[World7][Map5][Row2] = ["propellermushroom","minimushroom","minimushroom","minimushroom","bowser","bowserjr"];
maps[World7][Map5][Row3] = ["penguinsuit","propellermushroom","penguinsuit","fireflower","bowserjr","propellermushroom"];
maps[World7][Map6] = {};
maps[World7][Map6][Row1] = ["bowser","bowser","propellermushroom","iceflower","minimushroom","propellermushroom"];
maps[World7][Map6][Row2] = ["propellermushroom","bowserjr","minimushroom","penguinsuit","iceflower","minimushroom"];
maps[World7][Map6][Row3] = ["fireflower","bowserjr","propellermushroom","minimushroom","fireflower","penguinsuit"];

maps[World8] = {};
maps[World8][Map1] = {};
maps[World8][Map1][Row1] = ["minimushroom","penguinsuit","bowser","bowserjr","minimushroom","iceflower"];
maps[World8][Map1][Row2] = ["propellermushroom","fireflower","superstar","superstar","bowser","bowserjr"];
maps[World8][Map1][Row3] = ["minimushroom","iceflower","propellermushroom","fireflower","minimushroom","penguinsuit"];
maps[World8][Map2] = {};
maps[World8][Map2][Row1] = ["fireflower","bowser","propellermushroom","bowserjr","iceflower","penguinsuit"];
maps[World8][Map2][Row2] = ["iceflower","bowserjr","bowser","penguinsuit","minimushroom","fireflower"];
maps[World8][Map2][Row3] = ["minimushroom","iceflower","propellermushroom","iceflower","fireflower","fireflower"];
maps[World8][Map3] = {};
maps[World8][Map3][Row1] = ["fireflower","penguinsuit","propellermushroom","bowser","minimushroom","iceflower"];
maps[World8][Map3][Row2] = ["minimushroom","fireflower","iceflower","penguinsuit","bowser","bowserjr"];
maps[World8][Map3][Row3] = ["iceflower","propellermushroom","bowserjr","iceflower","fireflower","fireflower"];
maps[World8][Map4] = {};
maps[World8][Map4][Row1] = ["fireflower","bowser","propellermushroom","bowser","iceflower","penguinsuit"];
maps[World8][Map4][Row2] = ["iceflower","bowserjr","iceflower","penguinsuit","minimushroom","bowserjr"];
maps[World8][Map4][Row3] = ["minimushroom","iceflower","propellermushroom","fireflower","fireflower","fireflower"];
maps[World8][Map5] = {};
maps[World8][Map5][Row1] = ["minimushroom","penguinsuit","bowser","superstar","minimushroom","penguinsuit"];
maps[World8][Map5][Row2] = ["minimushroom","bowserjr","bowser","superstar","minimushroom","bowserjr"];
maps[World8][Map5][Row3] = ["iceflower","propellermushroom","propellermushroom","iceflower","fireflower","fireflower"];
maps[World8][Map6] = {};
maps[World8][Map6][Row1] = ["minimushroom","bowser","propellermushroom","bowserjr","iceflower","iceflower"];
maps[World8][Map6][Row2] = ["minimushroom","fireflower","iceflower","penguinsuit","bowser","fireflower"];
maps[World8][Map6][Row3] = ["iceflower","propellermushroom","bowserjr","fireflower","fireflower","penguinsuit"];

maps[World9] = {};
maps[World9][Map1] = {};
maps[World9][Map1][Row1] = ["bowserjr","superstar","propellermushroom","fireflower","superstar","superstar"];
maps[World9][Map1][Row2] = ["bowser","propellermushroom","iceflower","minimushroom","superstar","fireflower"];
maps[World9][Map1][Row3] = ["bowserjr","iceflower","penguinsuit","bowser","minimushroom","penguinsuit"];
maps[World9][Map2] = {};
maps[World9][Map2][Row1] = ["penguinsuit","superstar","bowserjr","fireflower","minimushroom","propellermushroom"];
maps[World9][Map2][Row2] = ["superstar","bowser","bowserjr","iceflower","bowser","minimushroom"];
maps[World9][Map2][Row3] = ["fireflower","iceflower","penguinsuit","superstar","propellermushroom","superstar"];
maps[World9][Map3] = {};
maps[World9][Map3][Row1] = ["penguinsuit","iceflower","propellermushroom","superstar","bowser","superstar"];
maps[World9][Map3][Row2] = ["bowser","propellermushroom","iceflower","minimushroom","fireflower","fireflower"];
maps[World9][Map3][Row3] = ["bowserjr","bowserjr","superstar","superstar","minimushroom","penguinsuit"];
maps[World9][Map4] = {};
maps[World9][Map4][Row1] = ["penguinsuit","iceflower","bowserjr","superstar","minimushroom","propellermushroom"];
maps[World9][Map4][Row2] = ["superstar","propellermushroom","bowserjr","iceflower","bowser","fireflower"];
maps[World9][Map4][Row3] = ["fireflower","superstar","penguinsuit","bowser","minimushroom","superstar"];
maps[World9][Map5] = {};
maps[World9][Map5][Row1] = ["bowserjr","iceflower","penguinsuit","fireflower","bowser","propellermushroom"];
maps[World9][Map5][Row2] = ["superstar","bowser","iceflower","minimushroom","superstar","minimushroom"];
maps[World9][Map5][Row3] = ["fireflower","bowserjr","superstar","superstar","propellermushroom","penguinsuit"];
maps[World9][Map6] = {};
maps[World9][Map6][Row1] = ["penguinsuit","iceflower","propellermushroom","fireflower","superstar","propellermushroom"];
maps[World9][Map6][Row2] = ["superstar","bowser","bowserjr","iceflower","superstar","minimushroom"];
maps[World9][Map6][Row3] = ["fireflower","bowserjr","penguinsuit","bowser","minimushroom","superstar"];

reset();
