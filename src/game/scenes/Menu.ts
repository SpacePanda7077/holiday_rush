import {
    ActiveEvents,
    ColliderDesc,
    EventQueue,
    RigidBody,
    RigidBodyDesc,
    TempContactForceEvent,
    World,
} from "@dimforge/rapier2d-compat";
import { Scene } from "phaser";
import { Player } from "../classes/player/Player";
import { EventBus } from "../EventBus";
import uniqid from "uniqid";
import { Point, pointsOnBezierCurves } from "points-on-curve";
import { Decoration } from "../classes/decorations/decorations";
import { Obstacles } from "../classes/obstacles/obstacles";
import { Santa_Slegh } from "../classes/power_ups/Santa_slegh";
import { weightedRandom } from "../helper/random";
import { Grinch } from "../classes/power_ups/grinch";

export class Menu extends Scene {
    graphics: Phaser.GameObjects.Graphics;
    world: World;
    game_width: number;
    game_height: number;
    player: Player;
    slopePoints: Point[][];
    bezierSlopePoints: Point[][];

    groundchunks: {
        [key: string]: {
            index: number;
            lastpoint: { x: number; y: number };
            body: RigidBody;
        };
    };
    bodyTobeRemoved: Set<string>;
    screenEdge: number;
    last_Deroration_add_time: number;
    decorations: Decoration[];
    obstacles: Obstacles[];
    power_ups: Santa_Slegh[];
    bg_gen_time: number;
    avalanche: Phaser.GameObjects.Rectangle;
    eventQueue: EventQueue;
    paralax_bg: Phaser.GameObjects.TileSprite[];
    time_now: number;
    last_obs_add_time: number;
    obs_gen_time: number;
    game_started: boolean;
    logo: Phaser.GameObjects.Image;
    score_board: Phaser.GameObjects.Rectangle;
    present: Phaser.GameObjects.Text;
    score: Phaser.GameObjects.Text;
    highscore: Phaser.GameObjects.Text;
    scoreContainer: Phaser.GameObjects.Container;
    fall_text: Phaser.GameObjects.Text;
    main_menu: Phaser.GameObjects.Text;
    try_again: Phaser.GameObjects.Text;
    constructor() {
        super("Menu");
    }
    preload() {
        this.load.setBaseURL("assets");
        this.load.image("logo", "logo.png");
        this.load.audio("bg_sound", "sound/bg_sound.mp3");
        this.load_paralax_bg();
    }
    create() {
        this.game_started = false;
        
        this.sound.play("bg_sound", { loop: true });
        this.game_width = Number(this.game.config.width);
        this.game_height = Number(this.game.config.height);
        this.logo = this.add
            .image(this.game_width / 2, this.game_height / 2, "logo")
            .setScrollFactor(0)
            .setDepth(5000)
            .setScale(2.5)
            .setAlpha(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.sound.stopAll();
                this.scene.start("Physics");
            });

        this.last_Deroration_add_time = 0;
        this.last_obs_add_time = 0;
        this.cameras.main.setZoom(0.6);

        this.bg_gen_time = 1000;
        this.obs_gen_time = 2000;
        this.paralax_bg = [];
        this.add_paralax_image();
        this.graphics = this.add.graphics();

        this.bodyTobeRemoved = new Set();
        this.decorations = [];
        this.obstacles = [];
        this.power_ups = [];
        EventBus.emit("current-scene-ready", this)  
    }
    update(time: number, delta: number): void {
        this.move_bg();
    }

    load_paralax_bg() {
        for (let i = 1; i < 7; i++) {
            this.load.image(i.toString(), `backgrounds/${i}.png`);
        }
    }
    add_paralax_image() {
        for (let i = 1; i < 7; i++) {
            const img = this.add
                .tileSprite(
                    
  this.game_width / 2,                  this.game_height / 2,
                    
                    500,
                    500,
                    i.toString()
                )

                .setScrollFactor(0)
                .setDepth(-1000)
                
            const scaleX = this.game_width / img.width / 0.6;

            const scaleY = this.game_height / img.height / 0.6;

            console.log(this.game_width, img.width, scaleX, scaleY);

            img.setScale(scaleX, scaleY);this.paralax_bg.push(img);
        }
    }
    move_bg() {
        this.paralax_bg.forEach((bg, index) => {
            bg.tilePositionX += index * 0.2;
        });
    }
}

