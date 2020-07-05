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

function tile({ x, y, name, color, sprite, traversable, penetrable, seeable, occupied, movementCost }) {
    return {
        ...gameObject({ x, y, name, color, sprite }),
        traversable: traversable, // can creatures move through
        penetrable: penetrable, // can projectiles move through
        seeable: seeable, // can projectiles move through
        occupied: occupied === true ? true : false, // is a unit on the tile (eig woll ma de static objects ja nied ändern)
        // hasBuilding: occupied === true ? true : false, // does tile already have building
        movementCost: movementCost || 1
    }
}

function floor({ x, y, name, sprite, movementCost }) {
    return {
        ...tile({
            x, y, name, color: "white",
            traversable: true, penetrable: true, seeable: true,
            movementCost: movementCost || 1,
            sprite
        }),
    }
}
function wall({ x, y, name, sprite, movementCost }) {
    return {
        ...tile({
            x, y, name, color: "grey",
            traversable: false, penetrable: false, seeable: false,
            movementCost: movementCost || 1,
            sprite
        }),
    }
}
function halfwall({ x, y, name, sprite }) {
    return {
        ...tile({
            x, y, name, color: "lightgrey",
            traversable: true, penetrable: false, seeable: true,
            movementCost: 2,
            sprite
        })
    }
}
function highgrass({ x, y, name, sprite }) {
    return {
        ...tile({
            x, y, name, color: "darkgreen",
            traversable: true, penetrable: true, seeable: false,
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
        friendly: friendly ? friendly : 0, // enemy: -1, neutral: 0, friendly: 1
        vision: vision || 10,

        moveTo: function moveTo(sx, sy, ex, ey, velocity) {
            // velocity in tile / second
            console.log("bullet animate")
            const steps = 100;
            const distance = getTileDistance(sx, sy, ex, ey);
            const duration = distance / velocity;
            console.log("distance:", distance, "tiles, duration:", duration, "s");

            let collided = false;
            const dx = ex - sx;
            const dy = ey - sy;
            for (let i = 0, j = 1; i < duration; i += (duration / steps), j++) {
                setTimeout(() => {
                    // console.log("dx " + dx + ", dy " + dy)
                    this.x += dx / steps;
                    this.y += dy / steps;
                }, j * (duration / steps) * 1000);
            }

            // setTimeout(() => !collided && entities.splice(i, 1), duration * 1000);
        }
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
