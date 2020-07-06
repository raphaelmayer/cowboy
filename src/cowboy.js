import * as cl from "./classes.js";
import * as ctrl from "./Controller.js";
import { toTileSize, getIndex, getTileIndex, rand, getTileDistance, isInBounds, pythagoras, getTilesWithinDistance, convert1dto2d, convertTileMapToPolyMap, calculateVisibilityPolygon, drawLine } from "./util.js";
import { STANDARD_MODE, ATTACK_MODE } from "./constants.js";
import GameState from "./GameState.js";

"use strict";

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


export default function main() {
    // canvas shit
    const canvas = document.createElement("canvas");
    const bgcanvas = document.createElement("canvas");
    canvas.width = bgcanvas.width = WINDOW_WIDTH;
    canvas.height = bgcanvas.height = WINDOW_HEIGHT;
    canvas.style.position = bgcanvas.style.position = "absolute";
    document.body.style.margin = 0;
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    document.body.insertBefore(bgcanvas, document.body.childNodes[0]);
    const context = canvas.getContext("2d");
    const bgcontext = bgcanvas.getContext("2d");
    // const imageData = context.createImageData(WINDOW_WIDTH, WINDOW_HEIGHT);

    // game state data structures
    const gs = new GameState();


    for (let i = 0; i < TM_WIDTH * 4; i++) {
        gs.get("weatherParticles").push({ x: rand(WINDOW_WIDTH), y: -rand(WINDOW_HEIGHT) })
    }

    console.log("resolution: " + WINDOW_WIDTH + " * " + WINDOW_HEIGHT)
    console.log("tile size: " + TILE_SIZE + ", tile resolution: " + TM_WIDTH + " * " + WINDOW_HEIGHT / TILE_SIZE)

    // load map
    console.log("MAP_CHAR_COUNT:", MAP_TEMPLATE.length);
    for (let i = 0; i < MAP_TEMPLATE.length - 1; i++) {
        const { x, y } = convert1dto2d(i, TM_WIDTH);
        if (MAP_TEMPLATE[i] == " ")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "grass tile", sprite: { x: 0, y: 0 } }) });
        if (MAP_TEMPLATE[i] == "-")
            gs.set("screen_buffer", i, { ...cl.highgrass({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "high grass tile", sprite: { x: 7, y: 2 } }) });
        if (MAP_TEMPLATE[i] == "#")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "wall tile", sprite: { x: 1, y: 0 } }) });
        if (MAP_TEMPLATE[i] == "h")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "tree", sprite: { x: 2, y: 0 } }) });
        if (MAP_TEMPLATE[i] == "=")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 4, y: 0 } }) });
        if (MAP_TEMPLATE[i] == "H")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 3, y: 1 } }) });
        if (MAP_TEMPLATE[i] == "l")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 5, y: 1 } }) });
        if (MAP_TEMPLATE[i] == "L")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 4, y: 2 } }) });
        if (MAP_TEMPLATE[i] == "X")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "road", sprite: { x: 3, y: 0 } }) });

        // house
        if (MAP_TEMPLATE[i] == "1")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 2 } }) });
        if (MAP_TEMPLATE[i] == "2")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 2 } }) });
        if (MAP_TEMPLATE[i] == "3")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 2 } }) });
        if (MAP_TEMPLATE[i] == "6")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "deer stand", sprite: { x: 6, y: 0 } }) });
        if (MAP_TEMPLATE[i] == "7")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 7, y: 0 } }) });

        if (MAP_TEMPLATE[i] == "q")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 3 } }) });
        if (MAP_TEMPLATE[i] == "w")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 3 } }) });
        if (MAP_TEMPLATE[i] == "e")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 3 } }) });
        if (MAP_TEMPLATE[i] == "r")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 3, y: 3 } }) });
        if (MAP_TEMPLATE[i] == "t")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 4, y: 3 } }) });
        if (MAP_TEMPLATE[i] == "z")
            gs.set("screen_buffer", i, { ...cl.halfwall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "halfwall H", sprite: { x: 6, y: 1 } }) });
        if (MAP_TEMPLATE[i] == "u")
            gs.set("screen_buffer", i, { ...cl.halfwall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "halfwall V", sprite: { x: 7, y: 1 } }) });

        if (MAP_TEMPLATE[i] == "a")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 4 } }) });
        if (MAP_TEMPLATE[i] == "s")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 4 } }) });
        if (MAP_TEMPLATE[i] == "d")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 4 } }) });
        if (MAP_TEMPLATE[i] == "f")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 3, y: 4 } }) });
        if (MAP_TEMPLATE[i] == "g")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 4, y: 4 } }) });

        if (MAP_TEMPLATE[i] == "y")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 0, y: 5 } }) });
        if (MAP_TEMPLATE[i] == "x")
            gs.set("screen_buffer", i, { ...cl.floor({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 1, y: 5 } }) });
        if (MAP_TEMPLATE[i] == "c")
            gs.set("screen_buffer", i, { ...cl.wall({ x: x * TILE_SIZE, y: y * TILE_SIZE, name: "house", sprite: { x: 2, y: 5 } }) });
    }
    //screen_buffer.forEach(tile => drawSprite(tile, bgcontext));

    // load entities
    gs.get("entities").push(cl.gunner({ x: 21 * TILE_SIZE, y: 15 * TILE_SIZE, friendly: 1 }));
    gs.get("entities").push(cl.gunner({ x: 15 * TILE_SIZE, y: 15 * TILE_SIZE, sprite: { x: 1, y: 1 }, friendly: 1 }));
    gs.get("entities").push(cl.gunner({ x: 21 * TILE_SIZE, y: 20 * TILE_SIZE, friendly: 1 }));
    gs.get("entities").push(cl.gunner({ x: 15 * TILE_SIZE, y: 20 * TILE_SIZE, sprite: { x: 1, y: 1 }, friendly: 1 }));
    gs.get("entities").push(cl.sniper({ x: 5 * TILE_SIZE, y: 4 * TILE_SIZE, friendly: -1 }));
    gs.get("entities").push(cl.chicken({ x: 10 * TILE_SIZE, y: 12 * TILE_SIZE }));

    // for (let i = 0; i < 32; i++) {
    //     gs.get("entities").push(cl.gunner({ x: TILE_SIZE * i, y: TILE_SIZE, sprite: { x: 1, y: 1 } }));
    //     gs.get("entities").push(cl.gunner({ x: TILE_SIZE * i, y: TILE_SIZE * 2, sprite: { x: 1, y: 1 } }));
    //     gs.get("entities").push(cl.gunner({ x: TILE_SIZE * i, y: TILE_SIZE * 3, sprite: { x: 1, y: 1 } }));
    //     gs.get("entities").push(cl.gunner({ x: TILE_SIZE * i, y: TILE_SIZE * 4, sprite: { x: 1, y: 1 } }));
    // }

    // draw screen buffer
    if (!gs.get("mapInitialized")) {
        bgcontext.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        bgcontext.fillStyle = AMBIENT_COLOR; // set background color
        bgcontext.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);


        drawTilemap();
        // screen_buffer.forEach(tile => {
        //     drawSprite(tile, bgcontext);
        // });
        gs.set("mapInitialized", true);
    }

    // also ob de überhaupt nice is und nied einfach drawSprite besser wär
    function drawTilemap() {
        gs.get("screen_buffer").forEach((tile, i) => {
            // i is in tile units
            const x = Math.floor(i % (TM_WIDTH)) * TILE_SIZE;
            const y = Math.floor(i / (TM_WIDTH)) * TILE_SIZE;
            bgcontext.drawImage(spriteSheet, TILE_SIZE * tile.sprite.x, TILE_SIZE * tile.sprite.y, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE, TILE_SIZE);
        });
    }
    
    
    window.onkeyup = function (e) { gs.set("pressedKeys", [e.keyCode], false); }
    window.onkeydown = function (e) { gs.set("pressedKeys", [e.keyCode], true); }

    let keydown_event = document.addEventListener("keydown", e => ctrl.handleKeyDown(e, gs));
    let mousemove_event = document.addEventListener("mousemove", e => ctrl.handleMouseMove(e, gs));
    // let mousedown_event = document.addEventListener("mousedown", handleLeftClick);
    let mouseup_event = document.addEventListener("mouseup", e => ctrl.handleLeftClick(e, gs));
    let rightclick_event = document.addEventListener('contextmenu', e => ctrl.handleRightClick(e, gs)); // Right click
    window.requestAnimationFrame(update);


    function update() {
        // console.log("update")
        context.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        // context.fillStyle = AMBIENT_COLOR; // set background color
        // context.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

        // fps counter (braucht 2 main variablen)
        function getFps() {
            const now = performance.now();
            const prev = gs.get("timePreviousFrame");
            if (!prev) {
                gs.set("timePreviousFrame", now);
                gs.set("fps", 0);
                return;
            }
            let delta = (now - prev) / 1000;
            gs.set("timePreviousFrame", now);
            gs.set("fps", (1 / delta).toFixed(0));
        }
        getFps();

        // fog of war attempt
        // const visibleTiles = [];
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


        // set all tiles to unoccupied and then go through entities and set occupied accordingly.
        // not sure about doing it on each frame, but having it in wouldCollide and animateWalk sucks balls
        gs.get("screen_buffer").forEach(tile => tile.occupied = false);

        // draw debug info
        const debug = gs.get("debug");
        if (debug) {
            const { x, y } = gs.get("mousePos");
            context.font = "10px Arial";
            // go through different debug overlays
            if (debug === 4) {
                gs.get("screen_buffer").forEach(tile => {
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
                edges = convertTileMapToPolyMap(gs.get("screen_buffer"), key, 0, 0, TM_WIDTH, TM_HEIGHT, TILE_SIZE, TM_WIDTH);
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
                edges = convertTileMapToPolyMap(gs.get("screen_buffer"), key, 0, 0, TM_WIDTH, TM_HEIGHT, TILE_SIZE, TM_WIDTH);
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
                edges = convertTileMapToPolyMap(gs.get("screen_buffer"), key, 0, 0, TM_WIDTH, TM_HEIGHT, TILE_SIZE, TM_WIDTH);
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
            context.fillText("" + "x: " + x + " y: " + y + " tx: " + toTileSize(x) + " ty: " + toTileSize(y) + ", fps: " + gs.get("fps"), 0, 30);
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
        gs.get("entities").forEach(e => {
            // // friendlies haben damit immer an circle drum herum
            if (e.friendly === 1) context.strokeStyle = "blue";
            else if (e.friendly === -1) context.strokeStyle = "red";
            // else return; // if neither friendly or not friendly, dont draw circle

            // set occupied on tiles
            let i = getTileIndex(e.x, e.y);
            if (gs.get("screen_buffer", i))
                gs.get("screen_buffer", i).occupied = true;

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
        if (gs.get("currentSelection")) {
            const { x, y, friendly, range } = gs.get("currentSelection");

            // draw rectangle around selected tile
            if (friendly === -1) context.strokeStyle = "red";
            else if (friendly === 1) context.strokeStyle = "blue";
            else context.strokeStyle = "#222";
            
            context.beginPath();
            
            // check if entity or tile
            if (range) context.arc(toTileSize(x) * TILE_SIZE + TILE_SIZE / 2, toTileSize(y) * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, 0, 2 * Math.PI);
            else context.rect(toTileSize(x) * TILE_SIZE, toTileSize(y) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            context.stroke();

            // if attack mode, draw range
            if (gs.get("mode") === ATTACK_MODE) {
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
            const { movementSpeed, movementCost, name, traversable, occupied, attack } = gs.get("currentSelection");
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
            drawSprite(gs.get("currentSelection"), context, WINDOW_WIDTH - 30, 350);


        }

        // gs.get("overlays").length > 0 && console.log("ol:", gs.get("overlays").length);
        if (gs.get("overlays") && gs.get("overlays").length > 0) {
            context.strokeStyle = "#1aa";
            context.beginPath();
            gs.get("overlays").forEach(o => o.animate ? drawSprite(o, context) : context.rect(o.x, o.y, TILE_SIZE, TILE_SIZE));
            context.stroke();
        }

        if (gs.get("mousePos")) {
            const { x, y } = gs.get("mousePos");
            if (gs.get("mode") === ATTACK_MODE) context.strokeStyle = "red";
            if (gs.get("mode") === STANDARD_MODE) context.strokeStyle = "blue";
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
}

