var ws;
var player;
function init() {
    ws = new WebSocket("ws://localhost:9005/");
    ws.onopen = function (evt) {
        publishEvent(evt, "opened");
        ws.send("join");
    };
    ws.onmessage = ordinaryOnMessage;
    ws.onclose = function (evt) {
        publishEvent(evt, "closed")
    };
    createField();
    bindClick();
}
function bindClick() {
    var trs = document.getElementsByTagName("tr");
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].children;
        for (var j = 0; j < tds.length; j++) {
            tds[j].addEventListener("click", makeTurn(j, i));
        }
    }
}
function createField() {
    var table = document.createElement("table");
    for(var i = 0; i < 10; i++) {
        var tr = document.createElement("tr");
        table.appendChild(tr);
        for(var j = 0; j < 10; j++) {
            var td = document.createElement("td");
            tr.appendChild(td);
        }
    }
    var content = document.getElementById("game");
    content.appendChild(table);
}
function ordinaryOnMessage(evt) {
    publishEvent(evt, "message");
    json = JSON.parse(evt.data);
    if (json.field) {
        drawField(json.field)
    }
    if (json.ch) {
        player = json.ch;
    }
}
function visualize(elem, sign, size) {
    if(sign == '-') {
        return false;
    }
    while(elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
    var pic = new Image(size, size);
    if(sign == 'x') {
        pic.src  = 'images/x.png';
    }
    if(sign == 'X') {
        pic.src  = 'images/x1.png';
    }
    if(sign == 'o') {
        pic.src  = 'images/o.png';
    }
    if(sign == 'O') {
        pic.src  = 'images/o1.png';
    }
    elem.appendChild(pic);
}
function drawField(field) {
    var trs = document.getElementsByTagName("tr");
    for (var i = 0; i < trs.length; i++) {
        var tds = trs[i].children;
        for (var j = 0; j < tds.length; j++) {
            visualize(tds[j], field[i][j], 30);//field[i][j];
        }
    }
}
function makeTurn(x_move, y_move) {
    return function aux() {
        ws.send(JSON.stringify({x: x_move, y: y_move}));
    }
}
function publishEvent(evt, type) {
    publish(evt.data ? evt.data : "", type);
}
function publish(message, type) {
    console.log(message);
    var text;
    if(type == "opened") {
        text = "Wait for your opponent";
    }
    if(type == "message") {
        var mess = JSON.parse(message);
        if(mess.status == "success" || mess.status == "Game") {
            text = "Wait for your turn";
        }
        if(mess.status == "failure") {
            text = mess.message;
        }
        if(mess.status == "New") {
            text = "Game began, your turn";
        }
        if(mess.status == "YourTurn") {
            text = "Your turn";
        }
        if(mess.status == "Win") {
            text = "Congratulations, you win!";
        }
        if(mess.status == "Lose") {
            text = "Bad luck, you lose!";
        }
        if(mess.status == "Tie") {
            text = "Game over, it is tie";
        }
        if(mess.ch) {
            sign = document.getElementById("sign");
            visualize(sign, mess.ch, 40);
        }
    }
    doc = document.getElementById("messages");
    doc.innerHTML = text;
}
window.addEventListener("load", init, false);
