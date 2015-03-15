alienCoord = {};
ownCoord = {};
function init() {
    canvas = document.getElementById("field");
    canvas.width = 480;
    canvas.height = 320;
    context = canvas.getContext('2d');
    canvas.onmousemove = playerMove;

    ws = new WebSocket("ws://localhost:9003/");
    ws.onopen = function (evt) {
        console.log("opened");
        ws.send("join");
    };
    ws.onmessage = function (evt) {
        if (evt.data) {
            alienCoord = JSON.parse(evt.data);
            context.fillStyle = '#ccc';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#000';
            context.fillRect(alienCoord.x, alienCoord.y, 10, 10);
            context.fillRect(ownCoord.x, ownCoord.y, 10, 10);
        }
    };
    ws.onclose = function (evt) {
        console.log("close");
    };
}
function playerMove(e) {
    context.fillStyle = '#ccc';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    ownCoord = {x: e.x, y: e.y};
    context.fillRect(e.x, e.y, 10, 10);
    context.fillRect(alienCoord.x, alienCoord.y, 10, 10);
    ws.send(JSON.stringify({x: e.x, y: e.y}));
    console.log(e);
}
window.addEventListener("load", init, false);