import RAPIER from "@dimforge/rapier2d-compat";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Physics extends Scene {
    constructor() {
        super("Physics");
    }
    async preload() {
        await this.init_physics();
    }
    create() {
        
    }
    async init_physics() {
        await RAPIER.init().then(() => {
          this.scene.start("Game");
            EventBus.emit("current-scene-ready", this)  
        });
    }
}

