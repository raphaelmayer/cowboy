export default class GameState {
    constructor() {
        this.screen_buffer = []; // holds tiles objects
        this.entities = []; // holds entities
        this.overlays = []; // holds overlays
        this.weatherParticles = [];
        this.lightning = 5;
        this.fogOfWar = [];

        this.mode = "STANDARD_MODE";
        this.currentSelection;
        this.mousePos = { x: 0, y: 0 };
        this.mapInitialized = false; // as to only load static tiles once
        this.debug = 5;

        this.preview = [];
        this.pressedKeys = {};
        this.leftMousePressed = false;
        this.leftMouseDownStart = null;
        this.timePreviousFrame;
        this.fps = 0;
    }
    get(key, subkey) {
        if (subkey || subkey === 0)
            return this[key][subkey];
        return this[key];
    }
    set(key, subkey, value) {
        if (value || value === 0) // subkey is optional and could be missing
            this[key][subkey] = value;
        else
            this[key] = subkey;
    }
    // fill method für arrays ?
}

// const gs = new GameState();

// gs.set("debug", 13);
// gs.set("preview", 0, 13);
// console.log(gs.get("debug"));
// console.log(gs.get("preview"));
// gs.get("preview").push(1,2,3);
// console.log(gs.get("preview"));
