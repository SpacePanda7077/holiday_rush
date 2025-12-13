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
import uniqid from "uniqid";
import { Point, pointsOnBezierCurves } from "points-on-curve";
import { Decoration } from "../classes/decorations/decorations";
import { Obstacles } from "../classes/obstacles/obstacles";
import { Santa_Slegh } from "../classes/power_ups/Santa_slegh";
import { weightedRandom } from "../helper/random";
import { Grinch } from "../classes/power_ups/grinch";

export class Game extends Scene {
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
    game_ended: boolean;
    logo: Phaser.GameObjects.Image;
    score_board: Phaser.GameObjects.Rectangle;
    present: Phaser.GameObjects.Text;
    score: Phaser.GameObjects.Text;
    highscore: Phaser.GameObjects.Text;
    scoreContainer: Phaser.GameObjects.Container;
    fall_text: Phaser.GameObjects.Text;
    main_menu: Phaser.GameObjects.Text;
    try_again: Phaser.GameObjects.Text;
    distance_text: Phaser.GameObjects.Text;
    constructor() {
        super("Game");
    }
    preload() {
        this.load.setBaseURL("assets");
        this.load.image("logo", "logo.png");
        this.load.image("pine", "decorations/pine.png");
        this.load.image("rock", "obstacles/rock.png");
        this.load.image("player", "player/penguin.png");
        this.load.image("santa", "power_up/santa.png");
        this.load.image("grinch", "power_up/grinch.png");
        this.load.audio("ski_sound", "sound/ski_sound.mp3");
        this.load.audio("bg_sound", "sound/bg_sound.mp3");
        this.load_paralax_bg();
    }
    create() {
        this.game_ended = false;

        this.sound.play("bg_sound", { loop: true });
        this.game_width = Number(this.game.config.width);
        this.game_height = Number(this.game.config.height);

        this.last_Deroration_add_time = 0;
        this.last_obs_add_time = 0;
        this.cameras.main.setZoom(0.6);
        this.create_end_screen();
        this.world = new World({ x: 0, y: 200 });
        this.eventQueue = new EventQueue(true);
        this.bg_gen_time = 1000;
        this.obs_gen_time = 2000;
        this.paralax_bg = [];
        this.add_paralax_image();
        this.graphics = this.add.graphics();

        this.distance_text = this.add
            .text(this.game_width, 0, "0", {
                fontSize: "50px",
                align: "center",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(6000)
            .setScrollFactor(0);

        this.initialGround();
        this.create_avalanche();
        this.bodyTobeRemoved = new Set();
        this.decorations = [];
        this.obstacles = [];
        this.power_ups = [];
        this.player = new Player(this, this.world, { x: 2000, y: 400 });
        this.events.on("restart", () => {
            this.sound.stopAll();
            this.scene.restart();
        });
    }
    update(time: number, delta: number): void {
        const lastPoint = this.slopePoints[this.slopePoints.length - 1];
        if (lastPoint) {
            // <-- safety check

            this.generate_ground();
        }
        this.move_bg();
        if (this.game_ended) return;
        this.time_now = time;
        this.world.step(this.eventQueue);
        this.checkCollision();
        const distance = Phaser.Math.Distance.Between(
            this.player.position.x,
            this.player.position.y,
            this.player.body.x,
            this.player.body.y
        );
        this.distance_text.text = Math.floor(distance / 1000).toString();

        this.player.move_player(time, delta);

        this.player.sync_body();
        if (time > 10000) {
            this.move_avalanche();
        }

        this.remove_ground();
        if (time > this.last_Deroration_add_time + this.bg_gen_time) {
            this.add_background_decorations();

            this.bg_gen_time = Phaser.Math.Between(1000, 3000);
            this.last_Deroration_add_time = time;
        }
        if (time > this.last_obs_add_time + this.obs_gen_time) {
            this.add_items();
            this.obs_gen_time -= 2;
            this.obs_gen_time = Phaser.Math.Clamp(this.obs_gen_time, 300, 2000);

            this.last_obs_add_time = time;
        }
        this.power_ups.forEach((p) => {
            p.move_body(
                time,
                delta,
                Math.atan2(this.player.velocity.y, this.player.velocity.x)
            );
            p.sync_body();
        });
        this.remove_Decorations();
        this.remove_Obstacles();
        this.remove_Power_up();
        if (this.avalanche.x > this.player.body.x + 100) {
            this.game_ended = true;
            this.scoreContainer.setActive(true).setVisible(true);
            this.try_again.setActive(true).setVisible(true);
        }
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
                    this.game_height / 2,
                    this.game_width / 2,
                    this.game_width,
                    this.game_height,
                    i.toString()
                )

                .setScrollFactor(0)
                .setDepth(-1000)
                .setScale(2.5);
            this.paralax_bg.push(img);
        }
    }
    move_bg() {
        this.paralax_bg.forEach((bg, index) => {
            bg.tilePositionX += index * 0.2;
        });
    }

    initialGround() {
        this.slopePoints = [
            [
                [0, 0],
                [200, 60],
                [400, 500],
                [1200, 600],
            ],
        ];
        this.bezierSlopePoints = [];
        this.groundchunks = {};
        this.graphics.lineStyle(
            30,
            Phaser.Display.Color.GetColor(235, 230, 230),
            1
        );

        const points = pointsOnBezierCurves(this.slopePoints[0]);
        this.bezierSlopePoints.push(points);
        const flatened_bezier_slope = this.bezierSlopePoints.flat();
        const linepoints = flatened_bezier_slope.map((p) => ({
            x: p[0],
            y: p[1],
        }));
        this.graphics.beginPath();
        this.graphics.moveTo(linepoints[0].x, linepoints[0].y);
        for (let p of linepoints) {
            this.graphics.lineTo(p.x, p.y);
        }
        this.graphics.strokePath();
        const bottomY = this.game_height;
        const fillPoints = [
            ...linepoints,
            { x: linepoints[this.slopePoints.length - 1].x, y: bottomY },
            { x: linepoints[0].x, y: bottomY },
        ];
        this.graphics.fillStyle(0xffffff); // snow color
        this.graphics.beginPath();
        this.graphics.moveTo(fillPoints[0].x, fillPoints[0].y);

        for (let i = 1; i < fillPoints.length; i++) {
            this.graphics.lineTo(fillPoints[i].x, fillPoints[i].y);
        }

        this.graphics.closePath();
        this.graphics.fillPath();

        // Flatten for Rapier
        const flatPoints = new Float32Array(points.flat());
        //console.log(flatPoints);

        const rbDesc = RigidBodyDesc.fixed().setUserData({ type: "ground" });
        const rb = this.world.createRigidBody(rbDesc);

        // Create a collider from polygon (closed shape)
        let colliderDesc = ColliderDesc.polyline(flatPoints);

        this.world.createCollider(colliderDesc, rb);
        this.groundchunks["first"] = {
            index: 0,
            lastpoint: {
                x: this.slopePoints[0][this.slopePoints[0].length - 1][0],
                y: this.slopePoints[0][this.slopePoints[0].length - 1][1],
            },
            body: rb,
        };
        // const debugGraphics = this.add.graphics();
        // debugGraphics.lineStyle(1, 0xff0000);
        // const debugRender = this.world.debugRender();
        // debugGraphics.clear();
        // debugGraphics.lineStyle(3, 0xff0000);
        // for (let i = 0; i < debugRender.vertices.length; i += 4) {
        //     debugGraphics.beginPath();
        //     debugGraphics.moveTo(
        //         debugRender.vertices[i],
        //         debugRender.vertices[i + 1]
        //     );
        //     debugGraphics.lineTo(
        //         debugRender.vertices[i + 2],
        //         debugRender.vertices[i + 3]
        //     );
        //     debugGraphics.strokePath();
        // }
    }
    create_avalanche() {
        this.avalanche = this.add
            .rectangle(200, 0, 5000, 10000, 0xffffff)
            .setOrigin(1, 0.5)
            .setDepth(3000);
    }
    move_avalanche() {
        this.avalanche.x += 18;
        this.avalanche.y = this.player.body.y;
        this.avalanche.x = Phaser.Math.Clamp(
            this.avalanche.x,
            this.player.body.x - 1500,
            this.player.body.x + 200
        );
    }
    generateNextPoint(lastPoint: { x: number; y: number }) {
        let deltaX = Phaser.Math.Between(500, 700); // left/right variation
        let deltaY = Phaser.Math.Between(-200, 500); // downhill
        const p: Point = [lastPoint.x + deltaX, lastPoint.y + deltaY];
        return p;
    }
    drawNextPoint() {
        this.graphics.clear();
        this.graphics.lineStyle(30, 0xffffff, 1);
        this.graphics.beginPath();
        const flatened_bezier_slope = this.bezierSlopePoints.flat();

        const linepoints = flatened_bezier_slope.map((p) => ({
            x: p[0],
            y: p[1],
        }));
        this.graphics.beginPath();
        this.graphics.moveTo(linepoints[0].x, linepoints[0].y);
        for (let p of linepoints) {
            this.graphics.lineTo(p.x, p.y);
        }
        this.graphics.strokePath();
        const bottomY =
            this.cameras.main.worldView.x + this.cameras.main.worldView.height;
        const fillPoints = [
            ...linepoints,
            { x: linepoints[this.slopePoints.length - 1].x, y: bottomY },
            { x: linepoints[0].x, y: bottomY },
        ];
        this.graphics.fillStyle(Phaser.Display.Color.GetColor(235, 230, 230)); // snow color
        this.graphics.beginPath();
        this.graphics.moveTo(fillPoints[0].x, fillPoints[0].y);

        for (let i = 1; i < fillPoints.length; i++) {
            this.graphics.lineTo(fillPoints[i].x, fillPoints[i].y);
        }

        this.graphics.closePath();
        this.graphics.fillPath();
    }
    createNextCollider(next_points: Point[], next_bezier_point: Point[]) {
        // Flatten for Rapier

        //console.log(flatPoints);

        const rbDesc = RigidBodyDesc.fixed().setUserData({ type: "ground" });
        const rb = this.world.createRigidBody(rbDesc);

        // Create a collider from polygon (closed shape)

        const index = this.slopePoints.indexOf(next_points);
        const flatPoints = new Float32Array(next_bezier_point.flat());
        let colliderDesc = ColliderDesc.polyline(flatPoints).setActiveEvents(
            ActiveEvents.CONTACT_FORCE_EVENTS
        );
        this.world.createCollider(colliderDesc, rb);
        const id = uniqid();
        this.groundchunks[id] = {
            index,
            lastpoint: {
                x: next_points[next_points.length - 1][0],
                y: next_points[next_points.length - 1][1],
            },
            body: rb,
        };
    }
    generate_ground() {
        const last_Point = this.slopePoints[this.slopePoints.length - 1];
        const innerPoint = last_Point[last_Point.length - 1];
        const lastPoint = { x: innerPoint[0], y: innerPoint[1] };
        if (!lastPoint) return;
        const distance = lastPoint.x - this.player.body.x;
        const lp = [lastPoint.x, lastPoint.y] as Point;
        let l = lastPoint;
        const next_points: Point[] = [];
        if (
            distance < 2500
            // this.cameras.main.worldView.x + this.cameras.main.worldView.width
        ) {
            for (let i = 0; i < 3; i++) {
                const point = this.generateNextPoint(l);
                l = { x: point[0], y: point[1] };
                next_points.push(point);
            }
            next_points.unshift(lp);
            const points = pointsOnBezierCurves(next_points);
            this.slopePoints.push(next_points);
            this.bezierSlopePoints.push(points);
            this.drawNextPoint();

            this.createNextCollider(next_points, points);

            //this.remove_ground();
        }
    }

    remove_ground() {
        //console.log(this.player.body.x, this.cameras.main.worldView.x);
        for (const id in this.groundchunks) {
            if (!this.groundchunks[id]) return;

            const lastpoint = this.groundchunks[id].lastpoint;
            //console.log(lastpoint);

            if (lastpoint.x - this.player.body.x < -1000) {
                console.log("");
                if (!this.bodyTobeRemoved.has(id)) {
                    this.bodyTobeRemoved.add(id);
                }
            }
        }
        //console.log(this.bodyTobeRemoved);
        this.remove();
    }
    remove() {
        if (this.bodyTobeRemoved.size > 0) {
            this.bodyTobeRemoved.forEach((value) => {
                this.world.removeRigidBody(this.groundchunks[value].body);

                delete this.groundchunks[value];
                this.bodyTobeRemoved.delete(value);
            });
        }
        if (this.slopePoints.length > 4) {
            this.slopePoints.shift();
            this.bezierSlopePoints.shift();
        }
    }

    checkCollision() {
        this.eventQueue.drainCollisionEvents((h1, h2, started) => {
            const body1 = this.world.getRigidBody(h1);
            const body2 = this.world.getRigidBody(h2);
            const userData1 = body1.userData as any;
            const userData2 = body2.userData as any;
            let b1;
            let b2;
            if (userData1.type === "player") {
                b1 = body1;
                b2 = body2;
            } else if (userData2.type === "player") {
                b1 = body2;
                b2 = body1;
            } else {
                b1 = body1;
                b2 = body2;
            }

            const udata1 = b1.userData as any;
            const udata2 = b2.userData as any;

            if (started) {
                this.player.checkHits(
                    body1,
                    body2,
                    this.time_now,
                    this.obstacles,
                    this.power_ups
                );
            }
        });
        this.eventQueue.drainContactForceEvents(
            (eve: TempContactForceEvent) => {
                console.log("evrek ss", eve);
            }
        );
    }

    add_background_decorations() {
        const flat_point = this.bezierSlopePoints[3];
        if (!flat_point) return;
        const rand_point_index = Math.floor(Math.random() * flat_point.length);
        const point = this.bezierSlopePoints[3][rand_point_index];
        const dc = new Decoration(this, { x: point[0], y: point[1] }, "pine");
        this.decorations.push(dc);
    }
    add_items() {
        const items = [
            { item: this.add_obstacles.bind(this), weight: 40 },
            { item: this.add_collectables.bind(this), weight: 50 },
            { item: this.add_power_up.bind(this), weight: 20 },
        ];
        const item = weightedRandom(items);
        if (item) {
            item();
        }
    }
    add_obstacles() {
        const flat_point = this.bezierSlopePoints[3];
        if (!flat_point) return;
        const rand_point_index = Math.floor(
            Math.random() * Math.floor(flat_point.length / 2) +
                Math.floor(flat_point.length / 2)
        );
        const point = this.bezierSlopePoints[3][rand_point_index];

        const dc = new Obstacles(this, this.world, {
            x: point[0],
            y: point[1],
        });

        this.obstacles.push(dc);
    }
    add_power_up() {
        const forword = Math.random() * 700 + 300;
        const x = this.player.body.x + forword;

        const power_up = weightedRandom([
            { item: Santa_Slegh, weight: 1 },
            { item: Grinch, weight: 50 },
        ]);

        const dc = new power_up(this, this.world, {
            x: x,
            y: this.player.body.y,
        });

        this.power_ups.push(dc);
    }
    add_collectables() {
        const flat_point =
            this.bezierSlopePoints[this.bezierSlopePoints.length - 1];
        if (!flat_point) return;
        const rand_point_index = Math.floor(
            Math.random() * Math.floor(flat_point.length / 2) +
                Math.floor(flat_point.length / 2)
        );
        const point =
            this.bezierSlopePoints[this.bezierSlopePoints.length - 1][
                rand_point_index
            ];
        for (let i = 0; i < 5; i++) {
            let pointx =
                this.bezierSlopePoints[this.bezierSlopePoints.length - 1][
                    rand_point_index + i * 2
                ]?.[0];
            let pointy =
                this.bezierSlopePoints[this.bezierSlopePoints.length - 1][
                    rand_point_index + i * 2
                ]?.[1];
            if (!pointx || !pointy) {
                console.log(pointx, pointy);
                return;
            }
            this.add.rectangle(pointx, pointy, 50, 50, 0xfff000);
        }

        // const dc = new Obstacles(this, this.world, {
        //     x: point[0],
        //     y: point[1],
        // });

        // this.obstacles.push(dc);
    }
    remove_Decorations() {
        this.decorations.forEach((deco) => {
            if (
                deco.decoration &&
                deco.decoration.x <
                    this.cameras.main.worldView.x -
                        this.cameras.main.worldView.width / 2
            ) {
                const index = this.decorations.indexOf(deco);
                deco.destroy();
                this.decorations.splice(index, 1);
                console.log("removed");
            }
        });
    }
    remove_Obstacles() {
        this.obstacles.forEach((obs) => {
            if (
                obs.decoration.x <
                this.cameras.main.worldView.x -
                    this.cameras.main.worldView.width / 2
            ) {
                const index = this.obstacles.indexOf(obs);
                obs.destroy();
                this.obstacles.splice(index, 1);
                console.log("obs removed");
            }
        });
    }
    remove_Power_up() {
        this.power_ups.forEach((obs) => {
            if (
                obs.body.x <
                this.cameras.main.worldView.x -
                    this.cameras.main.worldView.width / 2
            ) {
                const index = this.power_ups.indexOf(obs);
                obs.destroy();
                this.power_ups.splice(index, 1);
                console.log("pows removed");
            }
        });
    }
    create_end_screen() {
        this.scoreContainer = this.add
            .container(this.game_width / 2, this.game_height / 2)
            .setScrollFactor(0)
            .setDepth(5001);
        this.score_board = this.add
            .rectangle(0, 0, this.game_width, this.game_height, 0x000000)
            .setAlpha(0.8)
            .setStrokeStyle(15, 0xffffff);

        this.fall_text = this.add
            .text(
                0,
                -200,
                "you fell, its not too late to stand, 2026, is another year to try again",
                {
                    fontSize: "50px",
                    align: "center",
                    fontStyle: "bold",
                    wordWrap: {
                        width: 1000,
                        useAdvancedWrap: true,
                    },
                }
            )
            .setOrigin(0.5);

        this.present = this.add
            .text(-200, 0, "0", {
                fontSize: "50px",
                align: "center",
                fontStyle: "bold",
                wordWrap: {
                    width: 1000,
                    useAdvancedWrap: true,
                },
            })
            .setOrigin(0.5);
        this.score = this.add
            .text(200, 0, "0", {
                fontSize: "50px",
                align: "center",
                fontStyle: "bold",
                wordWrap: {
                    width: 1000,
                    useAdvancedWrap: true,
                },
            })
            .setOrigin(0.5);
        this.highscore = this.add
            .text(0, 200, "0", {
                fontSize: "50px",
                align: "center",
                fontStyle: "bold",
                wordWrap: {
                    width: 1000,
                    useAdvancedWrap: true,
                },
            })
            .setOrigin(0.5);

        this.try_again = this.add
            .text(
                this.game_width / 2,
                this.game_height / 2 + 300,
                "Try_Again",
                {
                    fontSize: "50px",
                    color: "green",
                    align: "center",
                    fontStyle: "bold",
                    wordWrap: {
                        width: 1000,
                        useAdvancedWrap: true,
                    },
                }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive()
            .setDepth(5002)
            .on("pointerdown", () => {
                console.log("kkk");
                this.sound.stopAll();
                this.scene.start("Menu");
            });
        this.scoreContainer.add([
            this.score_board,
            this.fall_text,
            this.present,
            this.score,
            this.highscore,

            //this.try_again,
        ]);
        this.scoreContainer.setActive(false).setVisible(false);
        this.try_again.setActive(false).setVisible(false);
    }
}

