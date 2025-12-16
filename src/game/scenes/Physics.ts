import RAPIER from "@dimforge/rapier2d-compat";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Physics extends Scene {
    charcter: string;
    constructor() {
        super("Physics");
    }
    init(data: { character: string }) {
        this.charcter = data.character;
    }
    async preload() {
        await this.init_physics();
    }
    create() {}
    async init_physics() {
        await RAPIER.init().then(() => {
            this.scene.start("Game", { character: this.charcter });
            EventBus.emit("current-scene-ready", this);
        });
    }
}

