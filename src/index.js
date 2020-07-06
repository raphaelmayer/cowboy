import main from "./cowboy.js";

// globals used pretty much everywhere
window.WINDOW_WIDTH = 640; // 2048 | 640; // 640 / 20 = 32
window.WINDOW_HEIGHT = 480 // 1536 | 480; // 480 / 20 = 24
window.PIXEL_SIZE = 1;
window.TILE_SIZE = 20 ; // in my pixel
window.TM_WIDTH = WINDOW_WIDTH / TILE_SIZE; // TILEMAP WIDTH
window.TM_HEIGHT = WINDOW_HEIGHT / TILE_SIZE; // TILEMAP HEIGHT


window.onload = () => {
    main();
}