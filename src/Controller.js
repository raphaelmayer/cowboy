
import { STANDARD_MODE, ATTACK_MODE } from "./constants.js";
import { toTileSize, getIndex, getTileIndex, getTileDistance } from "./util.js";

import { projectile } from "./classes.js"; // der import ghört auf jeden fall weg


export function handleMouseDown(event, gs) {
    // leftMousePressed = true;
}

export function handleMouseUp(event, gs) {

}

export function handleMouseMove(event, gs) {

    gs.set("mousePos", "x", event.x);
    gs.set("mousePos", "y", event.y);
}

export function handleLeftClick(event, gs) {
    if (event.button === 2) return; // prevent right click from firing this

    console.log("left", event);
    console.log(gs.get("currentSelection"));

    // leftMousePressed = !leftMousePressed;

    // handle tile selection
    // check entities first
    let entityFound = false; // hack to prevent tile selection loop from running
    for (let i = 0; i < gs.get("entities").length; i++) {
        const e = gs.get("entities", i);

        // only if tile has entity
        if (toTileSize(e.x) === toTileSize(event.x) && toTileSize(e.y) === toTileSize(event.y)) {
            if (gs.get("mode") === ATTACK_MODE) {
                console.log("target");

                // check if within range
                const { x, y, range, weapon } = gs.get("currentSelection");
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
                                    if (!gs.get("screen_buffer")[getTileIndex(bullet.x, bullet.y)].traversable) {
                                        console.log("bullet stopped");
                                        collided = true;
                                        return;
                                    }
                                    // console.log("dx " + dx + ", dy " + dy)
                                    bullet.x += dx / steps;
                                    bullet.y += dy / steps;
                                }, j * (duration / steps) * 1000);
                            }

                            setTimeout(() => !collided && gs.get("entities").splice(i, 1), duration * 1000);


                        }
                    });
                    gs.get("entities").push(bullet); // spawn bullet
                    // bullet.animate(500, 10);
                    bullet.animate(weapon.velocity);

                    // entities.splice(i, 1); // remove entity
                    console.log(gs.get("entities"));
                }
            } else {
                console.log("select entity");
                gs.set("mode", STANDARD_MODE);
                gs.set("currentSelection", e);
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
    if (!entityFound && gs.get("mode") !== ATTACK_MODE) {
        const i = getTileIndex(event.x, event.y);
        gs.set("currentSelection", gs.get("screen_buffer")[i]);
    }

    // highlght selection (machma später)
    // if (leftMousePressed) {
    //     leftMouseDownStart = { x: event.x, y: event.y };
    //     preview.push({
    //         x: toTileSize(event.x) * TILE_SIZE,
    //         y: toTileSize(event.y) * TILE_SIZE,
    //         data: [],
    //         color: "#" + rand(100).toFixed(0) + rand(100).toFixed(0) + rand(100).toFixed(0)
    //     });
    // } else {
    //     leftMouseDownStart = null;
    //     // currentSelection = null; // geht nied, wiel click down und up is

    //     // while (preview.length > 0) {
    //     //     screen_buffer.push(preview.pop());
    //     // }
    // }
}

export function handleRightClick(event, gs) {
    event.preventDefault();
    console.log("right", event);
    const { x, y, moveTo, friendly } = gs.get("currentSelection");

    if (friendly === 1) {
        // currentSelection.x = toTileSize(event.x) * TILE_SIZE;
        // currentSelection.y = toTileSize(event.y) * TILE_SIZE;

        moveTo && moveTo(x, y, toTileSize(event.x) * TILE_SIZE, toTileSize(event.y) * TILE_SIZE, 5);
    }
}

export function handleKeyDown(event, gs) {
    // const { overlays, screen_buffer, currentSelection } = gs;
    // let { debug } = gs;

    console.log(event.code);
    // if (!currentSelection || !currentSelection.movementSpeed) return;

    if (event.code !== "Digit1") {
        while (gs.get("overlays").length > 0)
            gs.set("overlays", []);
        gs.set("mode", STANDARD_MODE);
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
                // if (i > duration - 2 * (duration / steps))
                //     console.log("tile:", tile);
                // tile.occupied = true;
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
        const tile = gs.get("screen_buffer")[i];
        if (!tile.traversable || tile.occupied) {
            console.log("collision detected:", tile);
            console.log("entity:", entity);
            // drawSprite(screen_buffer[i], bgcontext);
            return true;
        }
        // getIndex weil x, y oben scho toTileSize() 
        const j = getIndex(x, y, TM_WIDTH); // index of current tile
        console.log(i, j)
        gs.get("screen_buffer")[j].occupied = false;
        // screen_buffer[i].occupied = true;
        return false;
    }

    switch (event.code) {
        case "KeyW":
            if (!wouldCollide(gs.get("currentSelection"), event.code))
                animateWalk(
                    gs.get("screen_buffer")[getTileIndex(gs.get("currentSelection").x, gs.get("currentSelection").y - TILE_SIZE)],
                    200, TILE_SIZE, () => gs.set("currentSelection", "y", gs.get("currentSelection").y - 1));
            // animateWalk(200, 20, () => gs.get("currentSelection").y += -TILE_SIZE / 20);
            break;
        case "KeyD":
            if (!wouldCollide(gs.get("currentSelection"), event.code))
                animateWalk(
                    gs.get("screen_buffer")[getTileIndex(gs.get("currentSelection").x + TILE_SIZE, gs.get("currentSelection").y)],
                    200, TILE_SIZE, () => gs.set("currentSelection", "x", gs.get("currentSelection").x + 1));
            // animateWalk(200, 20, () => gs.get("currentSelection").x += TILE_SIZE / 20);
            break;
        case "KeyS":
            if (!wouldCollide(gs.get("currentSelection"), event.code))
                animateWalk(
                    gs.get("screen_buffer")[getTileIndex(gs.get("currentSelection").x, gs.get("currentSelection").y + TILE_SIZE)],
                    200, TILE_SIZE, () => gs.set("currentSelection", "y", gs.get("currentSelection").y + 1));
            // animateWalk(200, 20, () => gs.get("currentSelection").y += TILE_SIZE / 20);
            break;
        case "KeyA":
            if (!wouldCollide(gs.get("currentSelection"), event.code))
                animateWalk(
                    gs.get("screen_buffer")[getTileIndex(gs.get("currentSelection").x - TILE_SIZE, gs.get("currentSelection").y)],
                    200, TILE_SIZE, () => gs.set("currentSelection", "x", gs.get("currentSelection").x - 1));
            // animateWalk(200, 20, () => gs.get("currentSelection").x += -TILE_SIZE / 20);
            break;
        case "Digit1": // attack mode
            console.log("attack mode");

            while (gs.get("overlays").length > 0)
                gs.set("overlays", []);

            if (!gs.get("currentSelection") || gs.get("mode") === ATTACK_MODE) {
                gs.set("mode", STANDARD_MODE);
            } else {
                gs.set("mode", ATTACK_MODE);
                const { x, y, range } = gs.get("currentSelection");
                for (let i = -range; i < range; i++) {
                    for (let j = -range; j < range; j++)
                        if (getTileDistance(x, y, x + i * TILE_SIZE, y + j * TILE_SIZE) < range)
                            gs.get("overlays").push({ x: x + i * TILE_SIZE, y: y + j * TILE_SIZE });
                }
            }
            break;
        case "Digit2":
            break;
        case "Digit3":
            break;
        case "Digit4":
            gs.set("currentSelection", "x", gs.get("currentSelection", "x") + 20);
            break;
        case "Digit0":
            console.log(gs);
            gs.get("debug") === 0 ? gs.set("debug", 5) : gs.set("debug", gs.get("debug") - 1);
            break;
    }
}