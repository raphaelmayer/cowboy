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
const AMBIENT_COLOR = "#e1c699";

let MAP_TEMPLATE = "";
MAP_TEMPLATE += "################################";
MAP_TEMPLATE += "#hhhhhhhhhhhhhh#      hhhhhhhhh#";
MAP_TEMPLATE += "#hhhh       hhh#         hhhhhh#";
MAP_TEMPLATE += "#hh           h   z  z     hhhh#";
MAP_TEMPLATE += "#hh                uu       hhh#";
MAP_TEMPLATE += "#hh  hh####                 hhh#";
MAP_TEMPLATE += "#hh   h####        hh      hhhh#";
MAP_TEMPLATE += "#hh   h hhH       hhhh    hhhhh#";
MAP_TEMPLATE += "#hhh    ==X==========l=========#";
MAP_TEMPLATE += "#####     H     hhhh H 6   hhhh#";
MAP_TEMPLATE += "#h        H      hh  H      hhh#";
MAP_TEMPLATE += "#h  1223h Hh123      H       ###";
MAP_TEMPLATE += "#h  qwweh Hhqwe      H      hhh#";
MAP_TEMPLATE += "#h  assdh Hhqwe      H #    hhh#";
MAP_TEMPLATE += "#h hyxfch Hhqwe   h  H #    hhh#";
MAP_TEMPLATE += "#h        Hhqwe      H #   hhhh#";
MAP_TEMPLATE += "#h  12223 Hhqwe      H      hhh#";
MAP_TEMPLATE += "#h  qwwwe Hhqwe      H      hhh#";
MAP_TEMPLATE += "#h  asssd Hhasd      H      hhh#";
MAP_TEMPLATE += "#h hyxgfc Hhyxc      H     hhhh#";
MAP_TEMPLATE += "#h        L==========X=========#";
MAP_TEMPLATE += "#h            #      H   hhhhhh#";
MAP_TEMPLATE += "#hhhhhhhhhhhhh#hhhhh H hhhhhhhh#";
MAP_TEMPLATE += "################################";

window.onload = main;

/**
 * Tile object with dimensions x = x / TILE_SIZE, y = y / TILE_SIZE
 * @param {Float} x 
 * @param {Float} y 
 */
function gameObject({ x, y, name, color, sprite }) {
    return {
        x, y, name: name || "null", sprite: sprite || { x: 6, y: 2 }, color: color || "red"
    }
}

function tile({ x, y, name, color, sprite, traversable, occupied, movementCost }) {
    return {
        ...gameObject({ x, y, name, color, sprite }),
        traversable: traversable, // can characters / projectiles / units  move through
        occupied: occupied === true ? true : false, // is a unit on the tile (eig woll ma de static objects ja nied ändern)
        // hasBuilding: occupied === true ? true : false, // does tile already have building
        movementCost: movementCost || 1
    }
}

function floor({ x, y, name, sprite, movementCost }) {
    return {
        ...tile({
            x, y, name, color: "white", traversable: true,
            movementCost: movementCost || 1,
            sprite
        }),
    }
}
function wall({ x, y, name, sprite, movementCost }) {
    return {
        ...tile({
            x, y, name, color: "grey", traversable: false,
            movementCost: movementCost || 1,
            sprite
        }),
    }
}
function halfwall({ x, y, name, sprite }) {
    return {
        ...tile({
            x, y, name, color: "lightgrey", traversable: true,
            movementCost: 2,
            sprite
        })
    }
}

function entity({ x, y, name, color, sprite, movementSpeed, friendly, vision }) {
    return {
        ...gameObject({ x, y, name, color, sprite }),
        draw: null, // not in use; array of entities gets drawn to screen by coordinates
        movementSpeed,
        friendly: friendly ? friendly : 0, // enemy: -1, neutral: 0, friendliy: 1
        vision: vision || 10,

    };
}

function soldier({ x, y, name, color, sprite, range, movementSpeed, friendly }) {
    movementSpeed = 4;
    return {
        ...entity({ x, y, name, color, sprite, movementSpeed, friendly }),
        // health: 10,
        // attack: 10, // eigentlich gun stats
        range: (range || range === 0) ? range : 10, // eigentlich gun stats
        // attackSpeed: 1, // eigentlich gun stats
        // shoot: null // ?
        // weapon?
        // hory shiet da kommt no viel
    };
}

function gunner({ x, y, name, sprite, friendly }) {
    return {
        ...soldier({
            x, y, name, friendly,
            sprite: sprite || { x: 0, y: 1 },
            range: 10,
            movementSpeed: 5,
            name: "gunner",
        }),
        weapon: {
            attack: 5,
            velocity: 10,
        }
    }
}

function sniper({ x, y, friendly }) {
    return {
        ...soldier({
            x, y, friendly,
            sprite: { x: 3, y: 2 },
            range: 20,
            movementSpeed: 3,
            name: "sniper",
        }),
        weapon: {
            attack: 10,
            velocity: 20,
        }
    }
}

function chicken({ x, y, name }) {
    return {
        ...entity({ x, y, name: "chicken", sprite: { x: 2, y: 1 }, movementSpeed: 3 })
    }
}

function projectile({ x, y, sprite, targetX, targetY, animate }) {
    sprite = sprite || { x: 5, y: 0 };
    return {
        ...entity({ x, y, sprite }),
        targetX,
        targetY,
        animate: animate || null
    };
}

function main() {
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
    const screen_buffer = []; // holds tiles objects
    const entities = []; // holds entities
    const overlays = []; // holds overlays
    const weatherParticles = [];
    let lightning = 5;
    const fogOfWar = [];

    let mode = STANDARD_MODE;
    let currentMousePosition = { x: 0, y: 0 };
    let mapInitialized = false; // as to only static tiles once
    let debug = false;

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
    console.log(screen_buffer)
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

    let preview = [];
    var pressedKeys = {};
    let leftMousePressed = false;
    let leftMouseDownStart = null;
    let currentSelection;
    let timePreviousFrame;
    let fps = 0;

    window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
    window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }

    let keydown = document.addEventListener("keydown", handleKeyDown);
    let mousemove = document.addEventListener("mousemove", handleMouseMove);
    // let mousedown = document.addEventListener("mousedown", handleMouseClick);
    let mouseup = document.addEventListener("mouseup", handleMouseClick);

    window.requestAnimationFrame(update);

    function getTilesWithinVision(x, y, range) {
        const tilesInRange = [];
        for (let i = -range; i < range; i++) {
            for (let j = -range; j < range; j++) {
                // easy pythagoras to determine distance 
                const targetX = x + i * TILE_SIZE;
                const targetY = y + j * TILE_SIZE;

                if (
                    isInBounds(targetX, targetY) && (
                        // if x and y is smaller than our range - (range / 5), it is in range
                        (Math.abs(i) < range - (range / 5) && Math.abs(j) < range - (range / 5)) ||
                        pythagoras(targetX - x, targetY - y) < (range * TILE_SIZE) * (range * TILE_SIZE)
                    )
                ) {
                    tilesInRange.push({ x: targetX, y: targetY });
                }
            }
        }
        return tilesInRange;
    }

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
        entities.forEach(e => {
            if (e.friendly === 1) {
                getTilesWithinVision(e.x, e.y, e.vision).forEach(tile => visibleTiles.push(tile));
            }
        });
        // bgcontext.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        // bgcontext.fillStyle = "black"; // set background color
        bgcontext.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        visibleTiles.forEach(tile => {
            drawSprite(screen_buffer[convert2dto1d(toTileSize(tile.x), toTileSize(tile.y), TM_WIDTH)], bgcontext)
        });


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
            const { x, y } = currentSelection;

            // draw rectangle around selected tile
            if (currentSelection.friendly === -1) context.strokeStyle = "red";
            else if (currentSelection.friendly === 1) context.strokeStyle = "blue";
            else context.strokeStyle = "#222";
            context.beginPath();
            context.rect(toTileSize(x) * TILE_SIZE, toTileSize(y) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            context.stroke();

            // draw selection window
            context.font = "12px Arial";
            context.fillStyle = "#eee";
            context.fillRect(530, 340, WINDOW_WIDTH, WINDOW_HEIGHT);
            const { movementSpeed, movementCost, name, traversable, occupied, range, attack } = currentSelection;
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

        // draw debug info
        if (debug) {
            context.font = "10px Arial";
            context.fillStyle = "red";
            screen_buffer.forEach(tile => {
                context.fillStyle = tile.traversable ? "green" : "red";
                context.fillText("T", tile.x, tile.y + 10);
                context.fillStyle = tile.occupied ? "green" : "red";
                context.fillText("O", tile.x + 10, tile.y + 10);
                context.fillText("E", tile.x, tile.y + 20);
                context.fillStyle = tile.occupied ? "green" : "red";
                context.fillText("X", tile.x + 10, tile.y + 20);

            });
            context.font = "30px Arial";
            context.fillStyle = "white";
            context.fillText("" + "x: " + currentMousePosition.x + " y: " + currentMousePosition.y + " tx: " + toTileSize(currentMousePosition.x) + " ty: " + toTileSize(currentMousePosition.y) + ", fps: " + fps, 0, 30);
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
        if (!lightning && rand(200) === 1) lightning = (rand(4) + 1) * 5; 
        if (lightning || lightning === 0) {
            if (lightning % 6 === 5) context.fillStyle = "#fff";
            if (lightning % 6 === 4) context.fillStyle = "#eee";
            if (lightning % 6 === 3) context.fillStyle = "#ddd";
            if (lightning % 6 === 2) context.fillStyle = "#aaa";
            if (lightning % 6 === 1) context.fillStyle = "#000";
            if (lightning % 6 === 0) context.fillStyle = "#555";
            screen_buffer.forEach(tile => context.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE))
            lightning = lightning < 1 ? false : lightning - 1;
        }

        // des braucht a weatherParticles array
        for (let i = 0; i < weatherParticles.length; i++) {
            if (weatherParticles[i].y > WINDOW_HEIGHT) {
                weatherParticles[i].y = 0;
            }
            if (weatherParticles[i].x > WINDOW_WIDTH) {
                weatherParticles[i].x = 0;
            }
            context.fillStyle = "#19a";
            context.fillRect(weatherParticles[i].x += 1, weatherParticles[i].y += 10, 1, 30);
        }

        window.requestAnimationFrame(update);
    }

    /**
     * Takes any game object (entity, tile, etc) and draws the corresponding sprite to its position.
     * @param {*} gameObject - any tile or entity
     * @param {*} ctx - context to draw to (multiple canvases)
     * @param {*} overrideX - override target x coordinate
     * @param {*} overrideY - override target y coordinate
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
        // window.requestAnimationFrame(update);

        // preview.push({
        //     x: toTileSize(x) * TILE_SIZE,
        //     y: toTileSize(y) * TILE_SIZE,
        // })
    }
    function handleKeyDown(event) {
        function animateWalk(duration, steps, animFunction) {
            for (let i = 0; i < duration; i += (duration / steps)) {
                setTimeout(() => {
                    animFunction();
                    // window.requestAnimationFrame(update);
                }, i);
            }
        }
        console.log(event.code);
        // if (!currentSelection || !currentSelection.movementSpeed) return;

        if (event.code !== "Digit1") {
            while (overlays.length > 0)
                overlays.pop();
            mode = STANDARD_MODE;
        }

        function wouldCollide(code) {
            if (!currentSelection || !currentSelection.movementSpeed) return true;
            const x = toTileSize(currentSelection.x);
            const y = toTileSize(currentSelection.y);
            let toX = 0;
            let toY = 0;

            if (code === "KeyW") toY = -1;
            if (code === "KeyS") toY = 1;
            if (code === "KeyA") toX = -1;
            if (code === "KeyD") toX = 1;

            const i = convert2dto1d(x + toX, y + toY, TM_WIDTH); // index of next tile
            console.log("x:", x, "y:", y, " => i:", i);

            // needs to check entities aswell; either look into entities or screen buffer.occupied
            if (!screen_buffer[i].traversable || screen_buffer[i].occupied) {
                console.log("collision detected");
                console.log(screen_buffer[i]);
                console.log("currentSelection:", currentSelection);
                // drawSprite(screen_buffer[i], bgcontext);
                return true;
            }
            const j = convert2dto1d(x, y, TM_WIDTH); // index of current tile
            console.log(i, j)
            screen_buffer[j].occupied = false;
            screen_buffer[i].occupied = true;
            console.log(screen_buffer[i]);
            return false;
        }

        switch (event.code) {
            case "KeyW":
                if (!wouldCollide(event.code)) animateWalk(200, 20, () => currentSelection.y += -TILE_SIZE / 20);
                break;
            case "KeyD":
                if (!wouldCollide(event.code)) animateWalk(200, 20, () => currentSelection.x += TILE_SIZE / 20);
                break;
            case "KeyS":
                if (!wouldCollide(event.code)) animateWalk(200, 20, () => currentSelection.y += TILE_SIZE / 20);
                break;
            case "KeyA":
                if (!wouldCollide(event.code)) animateWalk(200, 20, () => currentSelection.x += -TILE_SIZE / 20);
                break;
            case "Digit1": // attack mode
                // preview range
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
                            // easy pythagoras to determine range 
                            if (Math.pow(x + i * TILE_SIZE - x, 2) + Math.pow(y + j * TILE_SIZE - y, 2) < Math.pow(range * TILE_SIZE, 2))
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
                debug = !debug;
                break;
            case "Digit0":
                lightning = 10;
                break;
        }
        // window.requestAnimationFrame(update);
    }
    function handleMouseClick(event) {
        leftMousePressed = !leftMousePressed;
        const xx = toTileSize(event.x);
        const yy = toTileSize(event.y);
        console.log("clicked:", "<" + xx, yy + "> =>", convert2dto1d(xx, yy, TM_WIDTH));
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
                    console.log(currentSelection);
                    console.log(Math.pow(e.x - x, 2) + Math.pow(e.y - y, 2), Math.pow(range * TILE_SIZE, 2))
                    const distanceSquared = Math.pow(e.x - x, 2) + Math.pow(e.y - y, 2);
                    if (distanceSquared < Math.pow(range * TILE_SIZE, 2)) {
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
                                        if (!screen_buffer[convert2dto1d(toTileSize(bullet.x), toTileSize(bullet.y), TM_WIDTH)].traversable) {
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


                            },
                            __animate: (duration, steps) => {
                                console.log("bullet animate")
                                let collided = false;
                                const dx = e.x - x;
                                const dy = e.y - y;
                                for (let i = 0; i < duration; i += (duration / steps)) {
                                    setTimeout(() => {
                                        console.log("XX:", x);
                                        if (!screen_buffer[convert2dto1d(toTileSize(bullet.x), toTileSize(bullet.y), TM_WIDTH)].traversable) {
                                            console.log("bullet stopped");
                                            collided = true;
                                            return;
                                        }
                                        bullet.x += dx / steps;
                                        bullet.y += dy / steps;
                                        // entities.push(bullet);
                                        // window.requestAnimationFrame(update);
                                    }, i);
                                }
                                setTimeout(() => !collided && entities.splice(i, 1), duration - (duration / steps), duration);
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
            for (let i = 0; i < screen_buffer.length; i++) {
                const tile = screen_buffer[i];
                if (toTileSize(tile.x) === toTileSize(event.x) && toTileSize(tile.y) === toTileSize(event.y)) {
                    currentSelection = tile;
                }
            }
        }
        console.log(currentSelection);

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
        // window.requestAnimationFrame(update);
    }

    function handleMouseDown(event) {
        leftMousePressed = true;
    }

    function handleMouseUp(event) {

    }
}

// util
function convert2dto1d_ALT(x, y) {
    return x + (TM_WIDTH) * y;
}

// util
function convert2dto1d(x, y, dim) {
    return x + dim * y;
}

function convert1dto2d(i, dimX) {
    // console.log("x:", i % dimX, "y:", Math.floor(i / dimX))

    return {
        x: i % dimX,
        y: Math.floor(i / dimX)
    };
}

function toTileSize(n) {
    return Math.floor(n / TILE_SIZE);
}

/**
 * Returns a random integer between 0 and n-1
 * @param {int} n 
 */
function rand(n) {
    return Math.floor(Math.random() * n);
}

function pythagorasDistanceTiles(x, y) {
    return Math.sqrt(toTileSize(x) * toTileSize(x) + toTileSize(y) * toTileSize(y));
}
/**
 * Calculate distance between two points in tile units.
 * @param {Float} x1 
 * @param {Float} y1 
 * @param {Float} x2 
 * @param {Float} y2 
 */
function getTileDistance(x1, y1, x2, y2) {
    // pythagoras
    const dx = toTileSize(x2) - toTileSize(x1);
    const dy = toTileSize(y2) - toTileSize(y1);
    return Math.sqrt(dx * dx + dy * dy);
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
    return a * a + b * b
}