// "use strict";

const WINDOW_WIDTH = 640; // 2048 | 640; // 640 / 20 = 32
const WINDOW_HEIGHT = 480 // 1536 | 480; // 480 / 20 = 24
const PIXEL_SIZE = 1;
const TILE_SIZE = 20 * PIXEL_SIZE; // in my pixel
const TM_WIDTH = WINDOW_WIDTH / TILE_SIZE; // TILEMAP WIDTH
const TM_HEIGHT = WINDOW_HEIGHT / TILE_SIZE; // TILEMAP HEIGHT

const FLOOR = "floor";
const WALL = "wall";
const TREE = "tree";
const STANDARD_MODE = "STD";
const ATTACK_MODE = "ATK";

const spriteSheet = new Image(40, 20);
spriteSheet.src = "./sprite-sheet.png";
const AMBIENT_COLOR = "#e1c699"; // "#191970"; // midnight blue

let MAP_TEMPLATE = "";

MAP_TEMPLATE += "#####################H##########";
MAP_TEMPLATE += "#hhhhhhhhhhhhhh#     Hhhhhhhhhh#";
MAP_TEMPLATE += "#hhhh       hhh#     H   hhhhhh#";
MAP_TEMPLATE += "#hh           h  z  zH     hhhh#";
MAP_TEMPLATE += "#hh   ------      uu H      -hh#";
MAP_TEMPLATE += "#hh  hh####-    --   H      -hh#";
MAP_TEMPLATE += "#hh   h####-   ---hh H     -hhh#";
MAP_TEMPLATE += "#hh   h hhH    --hhhhH    -hhhh#";
MAP_TEMPLATE += "==========X==========X==========";
MAP_TEMPLATE += "#####     H    hhhh  H 6   hhhh#";
MAP_TEMPLATE += "#h        H     hh   H      hhh#";
MAP_TEMPLATE += "#h  1223h Hh123      H       ###";
MAP_TEMPLATE += "#h  qwweh Hhqwe      H        h#";
MAP_TEMPLATE += "#h  assdh Hhqwe      H #  --  h#";
MAP_TEMPLATE += "#h hyxfch Hhqwe   h  H # ---  h#";
MAP_TEMPLATE += "#h        Hhqwe      H # --  hh#";
MAP_TEMPLATE += "#h  12223 Hhqwe      H      hhh#";
MAP_TEMPLATE += "#h  qwwwe Hhqwe    --H      hhh#";
MAP_TEMPLATE += "#h  asssd Hhasd   ---H      hhh#";
MAP_TEMPLATE += "#h hyxgfc Hhyxc   ---H     --hh#";
MAP_TEMPLATE += "==========L==========X=========-";
MAP_TEMPLATE += "#h            #      H   ---hhh#";
MAP_TEMPLATE += "#hhhhhhhhhhhhh#hhhhh H ----hhhh#";
MAP_TEMPLATE += "#####################H##########";



window.onload = main;

function main() {
    // canvas shit
    const canvas = document.createElement("canvas");
    const bgcanvas = document.createElement("canvas");
    canvas.width = bgcanvas.width = WINDOW_WIDTH;
    canvas.height = bgcanvas.height = WINDOW_HEIGHT;
    canvas.style.position = bgcanvas.style.position = "absolute";
    document.body.style.margin = 0;
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    document.body.insertBefore(bgcanvas, document.body.childNodes[0]);
    context = canvas.getContext("2d");
    bgcontext = bgcanvas.getContext("2d");
    const imageData = context.createImageData(WINDOW_WIDTH, WINDOW_HEIGHT);

    // game data structures
    const screen_buffer = []; // holds tiles objects
    const entities = []; // holds entities
    const overlays = []; // holds overlays
    const weatherParticles = [];
    let lightning = 5;
    const fogOfWar = [];

    let mode = STANDARD_MODE;
    let currentSelection;
    let currentMousePosition = { x: 0, y: 0 };
    let mapInitialized = false; // as to only load static tiles once
    let debug = 0;

    let preview = [];
    var pressedKeys = {};
    let leftMousePressed = false;
    let leftMouseDownStart = null;
    let timePreviousFrame;
    let fps = 0;

    for (let i = 0; i < TM_WIDTH * 4; i++) {
        weatherParticles.push({ x: rand(WINDOW_WIDTH), y: -rand(WINDOW_HEIGHT) })
    }

    console.log("resolution: " + WINDOW_WIDTH + " * " + WINDOW_HEIGHT)
    console.log("tile size: " + TILE_SIZE + ", tile resolution: " + TM_WIDTH + " * " + WINDOW_HEIGHT / TILE_SIZE)

    // load map
    console.log("MAP_CHAR_COUNT:", MAP_TEMPLATE.length);
    for (let i = 0; i < MAP_TEMPLATE.length - 1; i++) {
        const { x, y } = convert1dto2d(i, TM_WIDTH);
        if (MAP_TEMPLATE[i] == " ")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "grass tile", sprite: { x: 0, y: 0 } }) };
        if (MAP_TEMPLATE[i] == "-")
            screen_buffer[i] = { ...highgrass({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "high grass tile", sprite: { x: 7, y: 2 } }) };
        if (MAP_TEMPLATE[i] == "#")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "wall tile", sprite: { x: 1, y: 0 } }) };
        if (MAP_TEMPLATE[i] == "h")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "tree", sprite: { x: 2, y: 0 } }) };
        if (MAP_TEMPLATE[i] == "=")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 4, y: 0 } }) };
        if (MAP_TEMPLATE[i] == "H")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 3, y: 1 } }) };
        if (MAP_TEMPLATE[i] == "l")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 5, y: 1 } }) };
        if (MAP_TEMPLATE[i] == "L")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 4, y: 2 } }) };
        if (MAP_TEMPLATE[i] == "X")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 3, y: 0 } }) };

        // house
        if (MAP_TEMPLATE[i] == "1")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 2 } }) };
        if (MAP_TEMPLATE[i] == "2")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 2 } }) };
        if (MAP_TEMPLATE[i] == "3")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 2 } }) };
        if (MAP_TEMPLATE[i] == "6")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "deer stand", sprite: { x: 6, y: 0 } }) };
        if (MAP_TEMPLATE[i] == "7")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 7, y: 0 } }) };

        if (MAP_TEMPLATE[i] == "q")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 3 } }) };
        if (MAP_TEMPLATE[i] == "w")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 3 } }) };
        if (MAP_TEMPLATE[i] == "e")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 3 } }) };
        if (MAP_TEMPLATE[i] == "r")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 3, y: 3 } }) };
        if (MAP_TEMPLATE[i] == "t")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 4, y: 3 } }) };
        if (MAP_TEMPLATE[i] == "z")
            screen_buffer[i] = { ...halfwall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "halfwall H", sprite: { x: 6, y: 1 } }) };
        if (MAP_TEMPLATE[i] == "u")
            screen_buffer[i] = { ...halfwall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "halfwall V", sprite: { x: 7, y: 1 } }) };

        if (MAP_TEMPLATE[i] == "a")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 4 } }) };
        if (MAP_TEMPLATE[i] == "s")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 4 } }) };
        if (MAP_TEMPLATE[i] == "d")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 4 } }) };
        if (MAP_TEMPLATE[i] == "f")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 3, y: 4 } }) };
        if (MAP_TEMPLATE[i] == "g")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 4, y: 4 } }) };

        if (MAP_TEMPLATE[i] == "y")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 5 } }) };
        if (MAP_TEMPLATE[i] == "x")
            screen_buffer[i] = { ...floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 5 } }) };
        if (MAP_TEMPLATE[i] == "c")
            screen_buffer[i] = { ...wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 5 } }) };
    }
    //screen_buffer.forEach(tile => drawSprite(tile, bgcontext));

    // load entities
    entities.push(gunner({ x: 21 * TILE_SIZE, y: 15 * TILE_SIZE, friendly: 1 }));
    entities.push(gunner({ x: 15 * TILE_SIZE, y: 15 * TILE_SIZE, sprite: { x: 1, y: 1 }, friendly: 1 }));
    entities.push(gunner({ x: 21 * TILE_SIZE, y: 320 * TILE_SIZE, friendly: 1 }));
    entities.push(gunner({ x: 15 * TILE_SIZE, y: 20 * TILE_SIZE, sprite: { x: 1, y: 1 }, friendly: 1 }));
    entities.push(sniper({ x: 5 * TILE_SIZE, y: 4 * TILE_SIZE, friendly: -1 }));
    entities.push(chicken({ x: 10 * TILE_SIZE, y: 12 * TILE_SIZE }));

    // for (let i = 0; i < 32; i++) {
    //     entities.push(gunner({ x: TILE_SIZE * i, y: TILE_SIZE, sprite: { x: 1, y: 1 } }));
    //     entities.push(gunner({ x: TILE_SIZE * i, y: TILE_SIZE * 2, sprite: { x: 1, y: 1 } }));
    //     entities.push(gunner({ x: TILE_SIZE * i, y: TILE_SIZE * 3, sprite: { x: 1, y: 1 } }));
    //     entities.push(gunner({ x: TILE_SIZE * i, y: TILE_SIZE * 4, sprite: { x: 1, y: 1 } }));
    // }

    window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
    window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }

    let keydown_event = document.addEventListener("keydown", handleKeyDown);
    let mousemove_event = document.addEventListener("mousemove", handleMouseMove);
    // let mousedown_event = document.addEventListener("mousedown", handleLeftClick);
    let mouseup_event = document.addEventListener("mouseup", handleLeftClick);
    let rightclick_event = document.addEventListener('contextmenu', handleRightClick); // Right click
    window.requestAnimationFrame(update);

    function update() {
        // console.log("update")
        context.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        // context.fillStyle = AMBIENT_COLOR; // set background color
        // context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

        // fps counter (braucht 2 globale variablen)
        function getFps() {
            const now = performance.now();
            if (!timePreviousFrame) {
                timePreviousFrame = now;
                fps = 0;
                return;
            }
            let delta = (now - timePreviousFrame) / 1000;
            timePreviousFrame = now;
            fps = (1 / delta).toFixed(0);
            return fps;
        }
        getFps();

        // fog of war attempt
        const visibleTiles = [];
        // entities.forEach(e => {
        //     if (e.friendly === 1) {
        //         getTilesWithinDistance(e.x, e.y, e.vision).forEach(tile => visibleTiles.push(tile));
        //     }
        // });
        // // bgcontext.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        // // bgcontext.fillStyle = "black"; // set background color
        // bgcontext.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        // visibleTiles.forEach(tile => {
        //     drawSprite(screen_buffer[getTileIndex(tile.x, tile.y)], bgcontext);
        //     // bgcontext.fillStyle = "black"; // set background color
        //     // bgcontext.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        // });


        // also ob de üerhaupt nice is und nied einfach drawSprite besser wär
        function drawTilemap() {
            screen_buffer.forEach((tile, i) => {
                // i is in tile units
                const x = Math.floor(i % (TM_WIDTH)) * TILE_SIZE;
                const y = Math.floor(i / (TM_WIDTH)) * TILE_SIZE;
                bgcontext.drawImage(spriteSheet, TILE_SIZE * tile.sprite.x, TILE_SIZE * tile.sprite.y, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
            });
        }
        // draw screen buffer
        if (!mapInitialized) {
            bgcontext.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
            bgcontext.fillStyle = AMBIENT_COLOR; // set background color
            bgcontext.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);


            drawTilemap();
            // screen_buffer.forEach(tile => {
            //     drawSprite(tile, bgcontext);
            // });
            mapInitialized = true;
        }

        // set all tiles to unoccupied and then go through entities and set occupied accordingly.
        // not sure about doing it on each frame, but having it in wouldCollide and animateWalk sucks balls
        screen_buffer.forEach(tile => tile.occupied = false);

        // draw debug info
        if (debug) {
            const { x, y } = currentMousePosition;
            context.font = "10px Arial";
            // go through different debug overlays
            if (debug === 4) {
                screen_buffer.forEach(tile => {
                    context.fillStyle = tile.traversable ? "green" : "red";
                    context.fillText("T", tile.x, tile.y + 10);
                    context.fillStyle = tile.occupied ? "green" : "red";
                    context.fillText("O", tile.x + 10, tile.y + 10);
                    context.fillStyle = tile.penetrable ? "green" : "red";
                    context.fillText("P", tile.x, tile.y + 20);
                    context.fillStyle = tile.seeable ? "green" : "red";
                    context.fillText("S", tile.x + 10, tile.y + 20);

                });
            }

            let edges;
            let key;
            if (debug === 3) {
                key = "traversable";
                edges = convertTileMapToPolyMap(screen_buffer, key, 0, 0, TM_WIDTH, TM_HEIGHT, TILE_SIZE, TM_WIDTH);
                edges.forEach(edge => drawLine(edge.sx, edge.sy, edge.ex, edge.ey, context, "blue"));
                const polygon = calculateVisibilityPolygon(edges, x, y, 1000);
                drawPolygonTriangles(x, y, polygon);

                context.font = "30px Arial";
                context.fillStyle = "white";
                context.fillText(key, 20, 270);
                context.fillText("Rays cast: " + polygon.length, 20, 300);
            }
            if (debug === 2) {
                key = "seeable";
                edges = convertTileMapToPolyMap(screen_buffer, key, 0, 0, TM_WIDTH, TM_HEIGHT, TILE_SIZE, TM_WIDTH);
                edges.forEach(edge => drawLine(edge.sx, edge.sy, edge.ex, edge.ey, context, "blue"));
                const polygon = calculateVisibilityPolygon(edges, x, y, 1000);
                fillInversePolygon(polygon, "black");

                context.font = "30px Arial";
                context.fillStyle = "white";
                context.fillText(key, 20, 270);
                context.fillText("Rays cast: " + polygon.length, 20, 300);
            }
            if (debug === 1) {
                key = "penetrable";
                edges = convertTileMapToPolyMap(screen_buffer, key, 0, 0, TM_WIDTH, TM_HEIGHT, TILE_SIZE, TM_WIDTH);
                edges.forEach(edge => drawLine(edge.sx, edge.sy, edge.ex, edge.ey, context, "blue"));
                const polygon = calculateVisibilityPolygon(edges, x, y, 1000);
                drawPolygonTriangles(x, y, polygon);

                context.font = "30px Arial";
                context.fillStyle = "white";
                context.fillText(key, 20, 270);
                context.fillText("Rays cast: " + polygon.length, 20, 300);
            }

            context.font = "30px Arial";
            context.fillStyle = "white";
            context.fillText("" + "x: " + x + " y: " + y + " tx: " + toTileSize(x) + " ty: " + toTileSize(y) + ", fps: " + fps, 0, 30);
        }
        function drawPolygonTriangles(xSource, ySource, polygon) {
            // // Draw each triangle in fan
            for (let i = 0; i < polygon.length - 1; i++) {
                drawLine(xSource, ySource, polygon[i].min_px, polygon[i].min_py, context);
                drawLine(xSource, ySource, polygon[i + 1].min_px, polygon[i + 1].min_py, context);
                drawLine(polygon[i].min_px, polygon[i].min_py, polygon[i + 1].min_px, polygon[i + 1].min_py, context);
            }
            drawLine(xSource, ySource, polygon[0].min_px, polygon[0].min_py, context);
            drawLine(xSource, ySource, polygon[polygon.length - 1].min_px, polygon[polygon.length - 1].min_py, context);
            drawLine(polygon[polygon.length - 1].min_px, polygon[polygon.length - 1].min_py, polygon[0].min_px, polygon[0].min_py, context);

        }

        function fillInversePolygon(polygon, color) {
            context.beginPath();
            // set context styles
            context.fillStyle = color;
            context.moveTo(0, 0);
            context.lineTo(0, WINDOW_HEIGHT);
            context.lineTo(WINDOW_WIDTH, WINDOW_HEIGHT);
            context.lineTo(WINDOW_WIDTH, 0);
            context.lineTo(0, 0);
            context.closePath();

            // context.globalCompositeOperation = "lighter"; // spaciger look
            context.moveTo(polygon[0].min_px, polygon[0].min_py);
            polygon.forEach(p => {
                context.lineTo(p.min_px, p.min_py);
            });
            context.lineTo(polygon[0].min_px, polygon[0].min_py);
            context.closePath(); // automatically moves back to bottom left corner
            context.fill();
        }

        // draw entities
        entities.forEach(e => {
            // // friendlies haben damit immer an circle drum herum
            if (e.friendly === 1) context.strokeStyle = "blue";
            else if (e.friendly === -1) context.strokeStyle = "red";
            // else return; // if neither friendly or not friendly, dont draw circle

            const { x, y } = e;
            // context.beginPath();
            // context.arc(toTileSize(x) * TILE_SIZE + TILE_SIZE / 2, toTileSize(y) * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0, 2 * Math.PI);
            // context.stroke();

            // set occupied on tiles
            let i = getTileIndex(e.x, e.y);
            if (screen_buffer[i])
                screen_buffer[i].occupied = true;

            // vll a drawEntity(), de dann zb sich um die sprite walking animation kümmert
            drawSprite(e, context);
        });

        // draw highlighted tiles (hätt des links halten und path ziehen sein sollen)
        // for (let i = 0; i < preview.length; i++) {
        //     context.beginPath();
        //     context.rect(preview[i].x, preview[i].y, TILE_SIZE, TILE_SIZE);
        //     context.stroke();
        // }

        // draw current selection window (current top right tile) and rectangular highlight
        if (currentSelection) {
            const { x, y, friendly, range } = currentSelection;

            // draw rectangle around selected tile
            if (friendly === -1) context.strokeStyle = "red";
            else if (friendly === 1) context.strokeStyle = "blue";
            else context.strokeStyle = "#222";
            context.beginPath();
            context.rect(x, y, TILE_SIZE, TILE_SIZE);
            context.stroke();

            // if attack mode, draw range
            if (mode === ATTACK_MODE) {
                getTilesWithinDistance(x, y, range).forEach(tile => {
                    context.beginPath();
                    context.rect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
                    context.stroke();
                });
            }

            // draw selection window
            context.font = "12px Arial";
            context.fillStyle = "#eee";
            context.fillRect(530, 340, WINDOW_WIDTH, WINDOW_HEIGHT);
            const { movementSpeed, movementCost, name, traversable, occupied, attack } = currentSelection;
            context.fillStyle = "#222";
            context.fillText(name, 540, 365);
            context.font = "10px Arial";
            context.fillText("MOV: " + (movementSpeed || movementCost), 540, 390);
            if (movementSpeed) { // if entity
                context.fillText("ATK: " + (attack), 540, 410);
                context.fillText("RNG: " + (range), 540, 430);
            } else {
                context.fillText("TRA: " + (traversable), 540, 410);
                context.fillText("OCC: " + (occupied), 540, 430);
            }
            drawSprite(currentSelection, context, WINDOW_WIDTH - 30, 350);


        }

        overlays.length > 0 && console.log("ol:", overlays.length);
        if (overlays && overlays.length > 0) {
            context.strokeStyle = "#1aa";
            context.beginPath();
            overlays.forEach(o => o.animate ? drawSprite(o, context) : context.rect(o.x, o.y, TILE_SIZE, TILE_SIZE));
            context.stroke();
        }

        if (currentMousePosition) {
            const { x, y } = currentMousePosition;
            if (mode === ATTACK_MODE) context.strokeStyle = "red";
            if (mode === STANDARD_MODE) context.strokeStyle = "blue";
            context.beginPath();
            context.rect(toTileSize(x) * TILE_SIZE, toTileSize(y) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            context.stroke();
        }

        // weather particle try
        // des wär ohne a weatherParticles array
        // for (let y = 0; y < TM_HEIGHT; y++) {
        //     for (let x = 0; x < TM_WIDTH; x++) {
        //         // if (rand(2) === 1) {
        //         //     drawSprite(screen_buffer[0], context, x * TILE_SIZE, y * TILE_SIZE);
        //         // }
        //         const coord_x = rand(TILE_SIZE) + TILE_SIZE * x;
        //         const coord_y = rand(TILE_SIZE) + TILE_SIZE * y;
        //         const size = rand(2) + 1;
        //         context.fillRect(coord_x, 0 + y*x, size, size);
        //     }
        // }

        // weather effects
        // needs global lightning variable
        // if (!lightning && rand(200) === 1) lightning = (rand(4) + 1) * 5;
        // if (lightning || lightning === 0) {
        //     if (lightning % 6 === 5) context.fillStyle = "#fff";
        //     if (lightning % 6 === 4) context.fillStyle = "#eee";
        //     if (lightning % 6 === 3) context.fillStyle = "#ddd";
        //     if (lightning % 6 === 2) context.fillStyle = "#aaa";
        //     if (lightning % 6 === 1) context.fillStyle = "#000";
        //     if (lightning % 6 === 0) context.fillStyle = "#555";
        //     screen_buffer.forEach(tile => context.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE))
        //     lightning = lightning < 1 ? false : lightning - 1;
        // }

        // // des braucht a weatherParticles array
        // for (let i = 0; i < weatherParticles.length; i++) {
        //     if (weatherParticles[i].y > WINDOW_HEIGHT) {
        //         weatherParticles[i].y = 0;
        //     }
        //     if (weatherParticles[i].x > WINDOW_WIDTH) {
        //         weatherParticles[i].x = 0;
        //     }
        //     context.fillStyle = "#19a";
        //     context.fillRect(weatherParticles[i].x += 1, weatherParticles[i].y += 10, 1, 30);
        // }

        window.requestAnimationFrame(update);
    }

    /**
     * Takes any game object (entity, tile, etc) and draws the corresponding sprite to its position.
     * @param {*} gameObject - any tile or entity
     * @param {*} ctx - context to draw to (multiple canvases)
     * @param {*} overrideX - override target x coordinate
     * @param {*} overrideY - override target y coordinate
     * eig sollts wohl so aufgrufen werden: drawSprite(tile.x, tile.y)
     */
    function drawSprite(gameObject, ctx, overrideX, overrideY) { // besserer name statt gameObject ha
        if (!gameObject || !ctx) {
            console.error("drawSprite(): Insufficient params");
            gameObject && console.log(gameObject);
            return;
        }
        const { color, sprite } = gameObject;
        const x = overrideX >= 0 ? overrideX : gameObject.x;
        const y = overrideY >= 0 ? overrideY : gameObject.y;
        // context.drawImage(image, image-offset.x, image-offset.y, image.width canvas.x, canvas.y);
        if (gameObject) {
            if (sprite) {
                ctx.drawImage(spriteSheet, TILE_SIZE * sprite.x, TILE_SIZE * sprite.y, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillstyle = color;
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    function handleMouseMove(event) {
        let x = event.x;
        let y = event.y;
        let xdone = false;
        let ydone = false;
        preview = [];
        if (leftMousePressed) {
            // // find good path
            // if (leftMouseDownStart.x + TILE_SIZE < x) {
            //     while (leftMouseDownStart.x < x) {
            //         preview.push({ x: x += TILE_SIZE, y });
            //     }
            //     console.log(leftMouseDownStart.x, x);
            //     xdone = true;
            // } else if (leftMouseDownStart.x + TILE_SIZE > x && !xdone) {
            //     while (leftMouseDownStart.x > x) {
            //         preview.push({ x: x -= TILE_SIZE, y });
            //     }
            //     console.log(leftMouseDownStart.x, x);
            // }
            // if (leftMouseDownStart.y + TILE_SIZE < y) {
            //     while (leftMouseDownStart.y < y) {
            //         preview.push({ x, y: y += TILE_SIZE });
            //     }
            //     console.log(leftMouseDownStart.y, y);
            //     ydone = true;
            // } else if (leftMouseDownStart.y + TILE_SIZE > y && !ydone) {
            //     while (leftMouseDownStart.y > y) {
            //         preview.push({ x, y: y -= TILE_SIZE });
            //     }
            //     console.log(leftMouseDownStart.y, y);
            // }
            preview.push({
                x: toTileSize(x) * TILE_SIZE,
                y: toTileSize(y) * TILE_SIZE,
                color: "#" + rand(100).toFixed(0) + rand(100).toFixed(0) + rand(100).toFixed(0)
            });

        }
        currentMousePosition = { x, y };

        // preview.push({
        //     x: toTileSize(x) * TILE_SIZE,
        //     y: toTileSize(y) * TILE_SIZE,
        // })
    }
    function handleKeyDown(event) {
        console.log(event.code);
        // if (!currentSelection || !currentSelection.movementSpeed) return;

        if (event.code !== "Digit1") {
            while (overlays.length > 0)
                overlays.pop();
            mode = STANDARD_MODE;
        }

        /**
         * 
         * @param {*} duration 
         * @param {*} steps 
         * @param {*} animFunction 
         */
        function animateWalk(tile, duration, steps, animFunction) {
            for (let i = 0; i < duration; i += (duration / steps)) {
                setTimeout(() => {
                    animFunction();
                    if (i > duration - 2 * (duration / steps))
                        console.log("tile:", tile);
                    tile.occupied = true;
                }, i);
            }
        }
        function wouldCollide(entity, code) {
            if (!entity || !entity.movementSpeed) return true;
            const x = toTileSize(entity.x);
            const y = toTileSize(entity.y);
            let toX = 0;
            let toY = 0;

            if (code === "KeyW") toY = -1;
            if (code === "KeyS") toY = 1;
            if (code === "KeyA") toX = -1;
            if (code === "KeyD") toX = 1;

            // falls mir schon in bewegung sind nach rechts oder unten, isses toTileSize
            // natürlich immer no links oben, sollt aber eig die kollision vom tile aus
            // checken, des eins weiter rechts bzw unten is.
            if (x * TILE_SIZE < entity.x) ++toX;
            if (y * TILE_SIZE < entity.y) ++toY;


            const i = getIndex(x + toX, y + toY, TM_WIDTH); // index of next tile
            console.log("x:", x, "y:", y, " => i:", i);

            // needs to check entities aswell; either look into entities or screen buffer.occupied
            if (!screen_buffer[i].traversable || screen_buffer[i].occupied) {
                console.log("collision detected:", screen_buffer[i]);
                console.log("entity:", entity);
                // drawSprite(screen_buffer[i], bgcontext);
                return true;
            }
            // getIndex weil x, y oben scho toTileSize() 
            const j = getIndex(x, y, TM_WIDTH); // index of current tile
            console.log(i, j)
            screen_buffer[j].occupied = false;
            // screen_buffer[i].occupied = true;
            console.log(screen_buffer[i]);
            return false;
        }

        switch (event.code) {
            case "KeyW":
                if (!wouldCollide(currentSelection, event.code))
                    animateWalk(
                        screen_buffer[getTileIndex(currentSelection.x, currentSelection.y - TILE_SIZE)],
                        200, TILE_SIZE, () => currentSelection.y--);
                // animateWalk(200, 20, () => currentSelection.y += -TILE_SIZE / 20);
                break;
            case "KeyD":
                if (!wouldCollide(currentSelection, event.code))
                    animateWalk(
                        screen_buffer[getTileIndex(currentSelection.x + TILE_SIZE, currentSelection.y)],
                        200, TILE_SIZE, () => currentSelection.x++);
                // animateWalk(200, 20, () => currentSelection.x += TILE_SIZE / 20);
                break;
            case "KeyS":
                if (!wouldCollide(currentSelection, event.code))
                    animateWalk(
                        screen_buffer[getTileIndex(currentSelection.x, currentSelection.y + TILE_SIZE)],
                        200, TILE_SIZE, () => currentSelection.y++);
                // animateWalk(200, 20, () => currentSelection.y += TILE_SIZE / 20);
                break;
            case "KeyA":
                if (!wouldCollide(currentSelection, event.code))
                    animateWalk(
                        screen_buffer[getTileIndex(currentSelection.x - TILE_SIZE, currentSelection.y)],
                        200, TILE_SIZE, () => currentSelection.x--);
                // animateWalk(200, 20, () => currentSelection.x += -TILE_SIZE / 20);
                break;
            case "Digit1": // attack mode
                console.log("attack mode");

                if (!currentSelection || mode === ATTACK_MODE) {
                    while (overlays.length > 0)
                        overlays.pop();
                    mode = STANDARD_MODE;
                } else {
                    mode = ATTACK_MODE;
                    while (overlays.length > 0)
                        overlays.pop();

                    const { x, y, range } = currentSelection;
                    for (let i = -range; i < range; i++) {
                        for (let j = -range; j < range; j++)
                            if (getTileDistance(x, y, x + i * TILE_SIZE, y + j * TILE_SIZE) < range)
                                overlays.push({ x: x + i * TILE_SIZE, y: y + j * TILE_SIZE });
                    }
                }
                break;
            case "Digit2":
                break;
            case "Digit3":
                break;
            case "Digit4":
                break;
            case "Digit9":
                debug = debug === 0 ? 5 : debug - 1;
                break;
            case "Digit0":
                lightning = 10;
                break;
        }
    }
    function handleLeftClick(event) {
        if (event.button === 2) return; // prevent right click from firing this

        console.log("left", event);
        leftMousePressed = !leftMousePressed;

        // handle tile selection
        // check entities first
        let entityFound = false; // hack to prevent tile selection loop from running
        for (let i = 0; i < entities.length; i++) {
            const e = entities[i];

            // only if tile has entity
            if (toTileSize(e.x) === toTileSize(event.x) && toTileSize(e.y) === toTileSize(event.y)) {
                if (mode === ATTACK_MODE) {
                    console.log("target");

                    // check if within range
                    const { x, y, range, weapon } = currentSelection;
                    if (getTileDistance(x, y, e.x, e.y) < range) {
                        // shoot entity
                        const bullet = projectile({
                            x, y,
                            targetX: e.x, targetY: e.y,
                            animate: (velocity) => {
                                // velocity in tile / second
                                console.log("bullet animate")
                                const steps = 100;
                                const distance = getTileDistance(x, y, e.x, e.y);
                                const duration = distance / velocity;
                                console.log("distance:", distance, "tiles, duration:", duration, "s");

                                let collided = false;
                                const dx = e.x - x;
                                const dy = e.y - y;
                                for (let i = 0, j = 1; i < duration; i += (duration / steps), j++) {
                                    setTimeout(() => {
                                        if (!screen_buffer[getTileIndex(bullet.x, bullet.y)].traversable) {
                                            console.log("bullet stopped");
                                            collided = true;
                                            return;
                                        }
                                        // console.log("dx " + dx + ", dy " + dy)
                                        bullet.x += dx / steps;
                                        bullet.y += dy / steps;
                                    }, j * (duration / steps) * 1000);
                                }

                                setTimeout(() => !collided && entities.splice(i, 1), duration * 1000);


                            }
                        });
                        entities.push(bullet); // spawn bullet
                        // bullet.animate(500, 10);
                        bullet.animate(weapon.velocity);

                        // entities.splice(i, 1); // remove entity
                        console.log(entities);
                    }
                } else {
                    console.log("select entity");
                    mode = STANDARD_MODE;
                    currentSelection = e;
                }

                // // close attack mode / return to standard mode
                // while (overlays.length > 0)
                //     overlays.pop();
                // // naja eig kannt ma ja scho ruhig weiterballern
                // mode = STANDARD_MODE;
                entityFound = true;
            } else {
            }
        }

        if (!entityFound) console.log("no entity");

        // else select building

        // else select tile
        // if attack mode, keep currently selected entity and continue
        if (!entityFound && mode !== ATTACK_MODE) {
            const i = getTileIndex(event.x, event.y);
            currentSelection = screen_buffer[i];
        }

        // highlght selection (machma später)
        if (leftMousePressed) {
            leftMouseDownStart = { x: event.x, y: event.y };
            preview.push({
                x: toTileSize(event.x) * TILE_SIZE,
                y: toTileSize(event.y) * TILE_SIZE,
                data: [],
                color: "#" + rand(100).toFixed(0) + rand(100).toFixed(0) + rand(100).toFixed(0)
            });
        } else {
            leftMouseDownStart = null;
            // currentSelection = null; // geht nied, wiel click down und up is

            // while (preview.length > 0) {
            //     screen_buffer.push(preview.pop());
            // }
        }
    }

    function handleRightClick(event) {
        event.preventDefault();
        console.log("right", event);


        if (currentSelection.friendly === 1) {
            // currentSelection.x = toTileSize(event.x) * TILE_SIZE;
            // currentSelection.y = toTileSize(event.y) * TILE_SIZE;

            currentSelection.moveTo && currentSelection.moveTo(currentSelection.x, currentSelection.y, toTileSize(event.x) * TILE_SIZE, toTileSize(event.y) * TILE_SIZE, 5);
        }
    }

    function handleMouseDown(event) {
        leftMousePressed = true;
    }

    function handleMouseUp(event) {

    }
}

// util
function convert1dto2d(i, width) {
    return {
        x: i % width,
        y: Math.floor(i / width)
    };
}

/**
 * Takes any 2d pixel coordinates and returns the 1d index specified be width.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} width 
 */
function getIndex(x, y, width = WINDOW_WIDTH) {
    return x + width * y;
}

/**
 * Takes any 2d pixel coordinates and returns the 1d tile index.
 * @param {Number} x 
 * @param {Number} y 
 */
function getTileIndex(x, y) {
    return getIndex(toTileSize(x), toTileSize(y), TM_WIDTH);
}

function toTileSize(n) {
    return Math.floor(n / TILE_SIZE);
}

/**
 * Returns a random integer between 0 and n-1.
 * @param {Number} n 
 */
function rand(n) {
    return Math.floor(Math.random() * n);
}
/**
 * Calculate distance between two points and return in tile units.
 * 
 * Es könnt insofern besser sein bei die echten Koordinaten zu bleiben, da getTileDistance viel dividiert.
 * Da große Unterschied is, dass ma dann beim range-check (range * TILE_SIZE) machen müssen: 
 * if (getDistance(x, y, e.x, e.y) < range * TILE_SIZE) vs
 * if (getTileDistance(x, y, e.x, e.y) < range) 
 * @param {Number} x1 
 * @param {Number} y1 
 * @param {Number} x2 
 * @param {Number} y2 
 */
function getTileDistance(x1, y1, x2, y2) {
    const dx = toTileSize(x2) - toTileSize(x1);
    const dy = toTileSize(y2) - toTileSize(y1);
    return Math.sqrt(pythagoras(dx, dy));
}

/**
 * In actual pixels, not tiles!
 * @param {*} x 
 * @param {*} y 
 */
function isInBounds(x, y) {
    return (
        (0 <= x && x < WINDOW_WIDTH) &&
        (0 <= y && y < WINDOW_HEIGHT)
    );
}

/**
 * Returns distance of hypotenuse squared.
 * @param {Number} a 
 * @param {Number} b 
 */
function pythagoras(a, b) {
    return a * a + b * b;
}

/**
 * returns array of tiles within given range
 * @param {Number} x  - in pixel units
 * @param {Number} y - in pixel units
 * @param {Number} range - in tile units
 */
function getTilesWithinDistance(x, y, range) {
    const tilesInRange = [];
    for (let i = -range; i < range; i++) {
        for (let j = -range; j < range; j++) {
            const targetX = x + i * TILE_SIZE;
            const targetY = y + j * TILE_SIZE;

            if (
                isInBounds(targetX, targetY) && (
                    // if x and y is smaller than our range - (range / 5), it is in range
                    (Math.abs(i) < range - (range / 5) && Math.abs(j) < range - (range / 5)) ||
                    getTileDistance(x, y, targetX, targetY) < range
                )
            ) {
                // it should not include duplicates (overlapping regions of vision), but does
                tilesInRange.push({ x: targetX, y: targetY });
            }
        }
    }
    return tilesInRange;
}


// ------------ EDGE DETECTION ___________
function sEdge() {
    return {
        sx: 0, sy: 0, // Start coordinate
        ex: 0, ey: 0 // End coordinate
    };
}

function sCell() {
    return {
        edge_id: [],
        edge_exist: [],
        exist: false
    };
}

const NORTH = 0;
const SOUTH = 1;
const EAST = 2;
const WEST = 3;

/**
 * Takes a tile map in 1d and returns an array of edges.
 * Heavily inspired by Javidx9's video on ray casting. 
 * Line Of Sight or Shaodw Casting in 2D: https://www.youtube.com/watch?v=fc3nnG2CG8U
 * @param {Object} tilemap 
 * @param {String} key - the field of the tile to check for 
 * @param {*} sx - start coordinates
 * @param {*} sy - start coordinates
 * @param {*} w - tilemap width
 * @param {*} h - tilemap height
 * @param {*} fBlockWidth - tile size
 * @param {*} pitch - tile size (warum auch immer)
 */
function convertTileMapToPolyMap(tilemap, key, sx, sy, w, h, fBlockWidth, pitch) {
    "use strict";
    const world = [];

    const edges = [];

    for (let x = 0; x < w; x++)
        for (let y = 0; y < h; y++)
            for (let j = 0; j < 4; j++) {
                const cell = sCell();
                cell.edge_exist[j] = false;
                cell.edge_id[j] = 0;
                world[(y + sy) * pitch + (x + sx)] = cell;
            }

    // Iterate through region from top left to bottom right
    for (let x = 1; x < w - 1; x++)
        for (let y = 1; y < h - 1; y++) {
            // Create some convenient indices
            const i = (y + sy) * pitch + (x + sx);			// This
            const n = (y + sy - 1) * pitch + (x + sx);		// Northern Neighbour
            const s = (y + sy + 1) * pitch + (x + sx);		// Southern Neighbour
            const w = (y + sy) * pitch + (x + sx - 1);	// Western Neighbour
            const e = (y + sy) * pitch + (x + sx + 1);	// Eastern Neighbour

            // If this cell exists, check if it needs edges
            if (tilemap[i][key]) {
                world[i].exist = true;
                // If this cell has no western neighbour, it needs a western edge
                if (!tilemap[w][key]) {
                    // It can either extend it from its northern neighbour if they have
                    // one, or It can start a new one.
                    if (world[n].edge_exist[WEST]) {
                        // Northern neighbour has a western edge, so grow it downwards
                        edges[world[n].edge_id[WEST]].ey += fBlockWidth;
                        world[i].edge_id[WEST] = world[n].edge_id[WEST];
                        world[i].edge_exist[WEST] = true;
                    }
                    else {
                        // Northern neighbour does not have one, so create one
                        const edge = sEdge();
                        edge.sx = (sx + x) * fBlockWidth; edge.sy = (sy + y) * fBlockWidth;
                        edge.ex = edge.sx; edge.ey = edge.sy + fBlockWidth;

                        // Add edge to Polygon Pool
                        const edge_id = edges.length;
                        edges.push(edge);

                        // Update tile information with edge information
                        world[i].edge_id[WEST] = edge_id;
                        world[i].edge_exist[WEST] = true;
                    }
                }

                // If this cell dont have an eastern neighbour, It needs a eastern edge
                if (!tilemap[e][key]) {
                    // It can either extend it from its northern neighbour if they have
                    // one, or It can start a new one.
                    if (world[n].edge_exist[EAST]) {
                        // Northern neighbour has one, so grow it downwards
                        edges[world[n].edge_id[EAST]].ey += fBlockWidth;
                        world[i].edge_id[EAST] = world[n].edge_id[EAST];
                        world[i].edge_exist[EAST] = true;
                    }
                    else {
                        // Northern neighbour does not have one, so create one
                        const edge = sEdge();
                        edge.sx = (sx + x + 1) * fBlockWidth; edge.sy = (sy + y) * fBlockWidth;
                        edge.ex = edge.sx; edge.ey = edge.sy + fBlockWidth;

                        // Add edge to Polygon Pool
                        const edge_id = edges.length;
                        edges.push(edge);

                        // Update tile information with edge information
                        world[i].edge_id[EAST] = edge_id;
                        world[i].edge_exist[EAST] = true;
                    }
                }

                // If this cell doesnt have a northern neignbour, It needs a northern edge
                if (!tilemap[n][key]) {
                    // It can either extend it from its western neighbour if they have
                    // one, or It can start a new one.
                    if (world[w].edge_exist[NORTH]) {
                        // Western neighbour has one, so grow it eastwards
                        edges[world[w].edge_id[NORTH]].ex += fBlockWidth;
                        world[i].edge_id[NORTH] = world[w].edge_id[NORTH];
                        world[i].edge_exist[NORTH] = true;
                    }
                    else {
                        // Western neighbour does not have one, so create one
                        const edge = sEdge();
                        edge.sx = (sx + x) * fBlockWidth; edge.sy = (sy + y) * fBlockWidth;
                        edge.ex = edge.sx + fBlockWidth; edge.ey = edge.sy;

                        // Add edge to Polygon Pool
                        const edge_id = edges.length;
                        edges.push(edge);

                        // Update tile information with edge information
                        world[i].edge_id[NORTH] = edge_id;
                        world[i].edge_exist[NORTH] = true;
                    }
                }

                // If this cell doesnt have a southern neignbour, It needs a southern edge
                if (!tilemap[s][key]) {
                    // It can either extend it from its western neighbour if they have
                    // one, or It can start a new one.
                    if (world[w].edge_exist[SOUTH]) {
                        // Western neighbour has one, so grow it eastwards
                        edges[world[w].edge_id[SOUTH]].ex += fBlockWidth;
                        world[i].edge_id[SOUTH] = world[w].edge_id[SOUTH];
                        world[i].edge_exist[SOUTH] = true;
                    } else {
                        // Western neighbour does not have one, so I need to create one
                        const edge = sEdge();
                        edge.sx = (sx + x) * fBlockWidth; edge.sy = (sy + y + 1) * fBlockWidth;
                        edge.ex = edge.sx + fBlockWidth; edge.ey = edge.sy;

                        // Add edge to Polygon Pool
                        const edge_id = edges.length;
                        edges.push(edge);

                        // Update tile information with edge information
                        world[i].edge_id[SOUTH] = edge_id;
                        world[i].edge_exist[SOUTH] = true;
                    }
                }

            }

        }
    return edges;
}

/**
 * 
 * Heavily inspired by Javidx9's video on ray casting. 
 * Line Of Sight or Shaodw Casting in 2D: https://www.youtube.com/watch?v=fc3nnG2CG8U
 * @param {*} edges 
 * @param {*} ox 
 * @param {*} oy 
 * @param {*} radius 
 */
function calculateVisibilityPolygon(edges, ox, oy, radius) {
    // Get rid of existing polygon
    const polygon = [];

    // For each edge in PolyMap
    for (let i = 0; i < edges.length; i++) {
        const e1 = edges[i];
        // Take the start point, then the end point (we could use a pool of
        // non-duplicated points here, it would be more optimal)
        for (let i = 0; i < 2; i++) {
            let rdx, rdy;
            rdx = (i == 0 ? e1.sx : e1.ex) - ox;
            rdy = (i == 0 ? e1.sy : e1.ey) - oy;

            const base_ang = Math.atan2(rdy, rdx);

            let ang = 0;
            // For each point, cast 3 rays, 1 directly at point
            // and 1 a little bit either side
            for (let j = 0; j < 3; j++) {
                if (j == 0) ang = base_ang - 0.0001;
                if (j == 1) ang = base_ang;
                if (j == 2) ang = base_ang + 0.0001;

                // Create ray along angle for required distance
                rdx = radius * Math.cos(ang);
                rdy = radius * Math.sin(ang);

                let min_t1 = Infinity;
                let min_px = 0, min_py = 0, min_ang = 0;
                let bValid = false;

                // Check for ray intersection with all edges
                for (let j = 0; j < edges.length; j++) {
                    const e2 = edges[j];
                    // Create line segment vector
                    const sdx = e2.ex - e2.sx;
                    const sdy = e2.ey - e2.sy;

                    // ensure that both edges are reasonably different. They could be identical
                    // and thus produce infinite solutions.
                    if (Math.abs(sdx - rdx) > 0.0 && Math.abs(sdy - rdy) > 0.0) {
                        // t2 is normalised distance from line segment start to line segment end of intersect point
                        const t2 = (rdx * (e2.sy - oy) + (rdy * (ox - e2.sx))) / (sdx * rdy - sdy * rdx);
                        // t1 is normalised distance from source along ray to ray length of intersect point
                        const t1 = (e2.sx + sdx * t2 - ox) / rdx;

                        // If intersect point exists along ray, and along line 
                        // segment then intersect point is valid
                        if (t1 > 0 && t2 >= 0 && t2 <= 1.0) {
                            // Check if this intersect point is closest to source. If
                            // it is, then store this point and reject others
                            if (t1 < min_t1) {
                                min_t1 = t1;
                                min_px = ox + rdx * t1;
                                min_py = oy + rdy * t1;
                                min_ang = Math.atan2(min_py - oy, min_px - ox);
                                bValid = true;
                            }
                        }
                    }
                }

                if (bValid)// Add intersection point to visibility polygon perimeter
                    polygon.push({ min_ang, min_px, min_py });
            }
        }
    }

    // Sort perimeter points by angle from source. This will allow
    // us to draw a triangle fan.
    return polygon.sort((a, b) => a.min_ang - b.min_ang);

}


function getShortestPath(tilemap, sx, sy, ex, ey) {
    const path = [];

    // tilemap

    return path;
}

function drawLine(sx, sy, ex, ey, context, color) {
    if (color) context.strokeStyle = color;
    context.beginPath();
    context.moveTo(sx, sy);
    context.lineTo(ex, ey);
    context.stroke();

}
