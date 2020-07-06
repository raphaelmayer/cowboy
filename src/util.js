// util
export function convert1dto2d(i, width) {
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
export function getIndex(x, y, width = WINDOW_WIDTH) {
    return x + width * y;
}

/**
 * Takes any 2d pixel coordinates and returns the 1d tile index.
 * @param {Number} x 
 * @param {Number} y 
 */
export function getTileIndex(x, y) {
    return getIndex(toTileSize(x), toTileSize(y), TM_WIDTH);
}

export function toTileSize(n) {
    return Math.floor(n / TILE_SIZE);
}

/**
 * Returns a random integer between 0 and n-1.
 * @param {Number} n 
 */
export function rand(n) {
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
export function getTileDistance(x1, y1, x2, y2) {
    const dx = toTileSize(x2) - toTileSize(x1);
    const dy = toTileSize(y2) - toTileSize(y1);
    return Math.sqrt(pythagoras(dx, dy));
}

/**
 * In actual pixels, not tiles!
 * @param {*} x 
 * @param {*} y 
 */
export function isInBounds(x, y) {
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
export function pythagoras(a, b) {
    return a * a + b * b;
}

/**
 * returns array of tiles within given range
 * @param {Number} x  - in pixel units
 * @param {Number} y - in pixel units
 * @param {Number} range - in tile units
 */
export function getTilesWithinDistance(x, y, range) {
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
export function convertTileMapToPolyMap(tilemap, key, sx, sy, w, h, fBlockWidth, pitch) {
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
export function calculateVisibilityPolygon(edges, ox, oy, radius) {
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


export function getShortestPath(tilemap, sx, sy, ex, ey) {
    const path = [];

    // tilemap

    return path;
}

export function drawLine(sx, sy, ex, ey, context, color) {
    if (color) context.strokeStyle = color;
    context.beginPath();
    context.moveTo(sx, sy);
    context.lineTo(ex, ey);
    context.stroke();

}
