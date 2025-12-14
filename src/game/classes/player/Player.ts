import {
    ActiveCollisionTypes,
    ActiveEvents,
    Ball,
    ColliderDesc,
    KinematicCharacterController,
    QueryFilterFlags,
    RigidBody,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";

import { polygonAmoy } from "viem/chains";
import { Obstacles } from "../obstacles/obstacles";
import { Santa_Slegh } from "../power_ups/Santa_slegh";
import { Collectable } from "../collectables/collectable";

export class Player {
    scene: Phaser.Scene;
    world: World;
    body: Phaser.GameObjects.Sprite;
    rigid_body: RigidBody;
    collider: any;
    dg: Phaser.GameObjects.Graphics;
    character_controller: KinematicCharacterController;
    velocity: Phaser.Math.Vector2;
    isGrounded: boolean;
    JUMP_HEIGHT: number;
    JUMP_TIME: number;
    ACCELERATION: number;
    GRAVITY: number;
    JUMP_FORCE: number;
    MAX_GROUND_ACCELERATION: number;
    PREV_ROTATION_NORMAL: { x: number; y: number };
    particle: Phaser.GameObjects.Particles.ParticleEmitter;
    can_jump: boolean;
    MAX_AIR_ACCELERATION: number;
    is_jumping: boolean;
    jumpButtonDownDuration: number;
    tirckMultiplier: number;
    speedMultiplier: number;
    TRICK_ACCELERATION_TIME: number;
    ACCELERATION_START_TIME: number;
    ski_sound:
        | Phaser.Sound.NoAudioSound
        | Phaser.Sound.HTML5AudioSound
        | Phaser.Sound.WebAudioSound;
    head_rigid_body: RigidBody;
    just_landed: boolean;
    is_landing: Set<string>;
    hit_something: boolean;
    lastHitSomethingTime: number;
    is_flipping: boolean;
    position: { x: number; y: number };
    collectedPresent: number

    constructor(
        scene: Phaser.Scene,
        world: World,
        position: { x: number; y: number }
    ) {
        this.scene = scene;
        this.world = world;
        this.position = position;

        // gravity, acceleration and jump force
        this.JUMP_HEIGHT = 3;
        this.JUMP_TIME = 0.6;
        this.ACCELERATION = 8;
        this.MAX_GROUND_ACCELERATION = 20;
        this.MAX_AIR_ACCELERATION = 25;
        this.GRAVITY =
            (2 * this.JUMP_HEIGHT) / (this.JUMP_TIME * this.JUMP_TIME);
        this.JUMP_FORCE = (2 * this.JUMP_HEIGHT) / this.JUMP_TIME;

        this.PREV_ROTATION_NORMAL = { x: 0, y: 0 };
        this.TRICK_ACCELERATION_TIME = 2000;
        this.ACCELERATION_START_TIME = 0;

        // bollean checks
        this.isGrounded = false;
        this.can_jump = false;
        this.is_jumping = false;
        this.is_landing = new Set();
        this.just_landed = false;
        this.hit_something = false;
        this.is_flipping = false;
        this.jumpButtonDownDuration = 0;
        this.lastHitSomethingTime = 0;

        this.tirckMultiplier = 0;
        this.speedMultiplier = 1;
        this.collectedPresent = 0

        // ...........
        this.velocity = new Phaser.Math.Vector2(0, 0);
        this.create_player(position);
        this.create_particle();
        this.ski_sound = scene.sound.add("ski_sound");
        this.ski_sound.play();
    }
    create_player(position: { x: number; y: number }) {
        this.body = this.scene.add
            .sprite(position.x, position.y, "player")
            .setDepth(2000);
        this.scene.cameras.main.startFollow(
            this.body,
            true,
            0.3,
            0.3,
            -300,
            100
        );
        const rigid_body_desc = RigidBodyDesc.kinematicPositionBased()
            .setTranslation(position.x, position.y)
            .lockRotations()
            .setUserData({ type: "player" });
        const rigid_body_desc2 = RigidBodyDesc.kinematicPositionBased()
            .setTranslation(position.x, position.y)
            .lockRotations()
            .setUserData({ type: "hit_box" });

        this.rigid_body = this.world.createRigidBody(rigid_body_desc);
        this.head_rigid_body = this.world.createRigidBody(rigid_body_desc2);

        const collider_desc = ColliderDesc.capsule(10, 30)
            .setFriction(0)
            .setRestitution(0)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(ActiveCollisionTypes.ALL)
            .setSensor(true);
        const hit_collider_desc = ColliderDesc.cuboid(42, 20)
            .setTranslation(0, -20)
            .setFriction(0)
            .setRestitution(0)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(ActiveCollisionTypes.KINEMATIC_FIXED)
            .setSensor(true);
        this.collider = this.world.createCollider(
            collider_desc,
            this.rigid_body
        );
        this.world.createCollider(hit_collider_desc, this.head_rigid_body);

        this.character_controller = this.world.createCharacterController(0.01);
        this.character_controller.setUp({ x: 0, y: -1 });
        this.character_controller.enableSnapToGround(200);
        // this.character_controller.setMaxSlopeClimbAngle((90 * Math.PI) / 180);
        // this.character_controller.setMinSlopeSlideAngle((30 * Math.PI) / 180);

        // debug collision view (to be removed)
        this.dg = this.scene.add.graphics();
        this.dg.lineStyle(1, 0xff0000);
        const debugRender = this.world.debugRender();
        this.dg.clear();
        this.dg.lineStyle(3, 0xff0000);
        for (let i = 0; i < debugRender.vertices.length; i += 4) {
            this.dg.beginPath();
            this.dg.moveTo(
                debugRender.vertices[i],
                debugRender.vertices[i + 1]
            );
            this.dg.lineTo(
                debugRender.vertices[i + 2],
                debugRender.vertices[i + 3]
            );
            this.dg.strokePath();
        }
    }
    handle_inputs() {
        const pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            const duration = pointer.getDuration();
            this.jumpButtonDownDuration = duration;

            if (duration < 100) {
                this.can_jump = true;
                this.is_jumping = true;
            }
            this.is_flipping = true;
        } else {
            this.can_jump = false;
            this.is_flipping = false;
        }
    }
    move_player(time: number, delta: number) {
        const check_grounded = this.checkGrounded();

        this.isGrounded = this.character_controller.computedGrounded();

        let rotation_angle;
        if (this.isGrounded) {
            rotation_angle = Math.atan2(this.velocity.y, this.velocity.x);
        } else {
            rotation_angle = Math.atan2(this.velocity.y, this.velocity.x);
        }

        if (!this.isGrounded) {
            if (this.is_landing.has("landed")) {
                this.is_landing.delete("landed");
                this.just_landed = false;
            }
            this.velocity.y += this.GRAVITY * (delta / 1000);
            if (!this.is_flipping) {
                this.body.rotation = Phaser.Math.Linear(
                    this.body.rotation,
                    rotation_angle,
                    0.3
                );
            } else {
                this.body.rotation -= 0.05;
                this.tirckMultiplier += 0.035;
            }

            this.ski_sound.pause();
            this.particle.stop();
        } else {
            if (!this.is_landing.has("landed")) {
                console.log(
                    "land angle",
                    Phaser.Math.RadToDeg(this.body.rotation) % 360
                );
                this.just_landed = true;
                this.is_landing.add("landed");
            }
            this.velocity.y = Math.abs(check_grounded.normal.y) * 2;
            this.body.rotation = rotation_angle;
            this.particle.start();
            this.is_jumping = false;

            this.ski_sound.resume();
            this.just_landed = false;
        }

        // handle forward movement
        if (!this.hit_something) {
            if (this.velocity.x < this.MAX_GROUND_ACCELERATION) {
                this.velocity.x +=
                    this.ACCELERATION * this.speedMultiplier * (delta / 1000);
            } else if (this.velocity.x > this.MAX_GROUND_ACCELERATION) {
                if (
                    time <
                    this.ACCELERATION_START_TIME + this.TRICK_ACCELERATION_TIME
                ) {
                    this.velocity.x = this.velocity.x;
                } else {
                    this.velocity.x *= 0.98;
                    this.speedMultiplier *= 0.98;
                    this.speedMultiplier = Phaser.Math.Clamp(
                        this.speedMultiplier,
                        1,
                        100
                    );
                }
            }
            if (this.isGrounded) {
                if (this.tirckMultiplier >= Math.PI) {
                    this.velocity.x += this.tirckMultiplier * 2;
                    this.ACCELERATION_START_TIME = time;
                }
                this.tirckMultiplier = 0;
            }
        } else {
            this.velocity.x *= 0.97;

            this.cancel_hit_somwthing(time);
        }

        // handle jump
        if (
            this.can_jump &&
            this.isGrounded &&
            this.jumpButtonDownDuration < 100
        ) {
            this.velocity.y = -this.JUMP_FORCE;
        }

        this.character_controller.computeColliderMovement(
            this.collider,
            this.velocity,
            QueryFilterFlags.EXCLUDE_SENSORS
        );
        const computed_movement = this.character_controller.computedMovement();
        const position = this.rigid_body.translation();
        const next_position = {
            x: position.x + computed_movement.x,
            y: position.y + computed_movement.y,
        };
        this.rigid_body.setNextKinematicTranslation(next_position);
        this.head_rigid_body.setNextKinematicTranslation(next_position);
        this.head_rigid_body.setNextKinematicRotation(this.body.rotation);
    }
    sync_body() {
        this.handle_inputs();
        const position = this.rigid_body.translation();

        this.body.setPosition(position.x, position.y);
        const debugRender = this.world.debugRender();
        this.dg.clear();
        this.dg.lineStyle(3, 0xff0000);
        for (let i = 0; i < debugRender.vertices.length; i += 4) {
            this.dg.beginPath();
            this.dg.moveTo(
                debugRender.vertices[i],
                debugRender.vertices[i + 1]
            );
            this.dg.lineTo(
                debugRender.vertices[i + 2],
                debugRender.vertices[i + 3]
            );
            this.dg.strokePath();
        }
    }
    create_particle() {
        if (!this.scene.textures.exists("snow_particle")) {
            const g = this.scene.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 50, 50);
            g.generateTexture("snow_particle", 50, 50);
            g.destroy();
        }
        this.particle = this.scene.add.particles(0, 0, "snow_particle", {
            lifespan: 400,
            angle: this.body.rotation,
            quantity: 0.5,
            speed: { min: 200, max: 500 },
            scale: { start: 0.2, end: 0.8 },
            alpha: { start: 1, end: 0.6 },
        });
        this.particle.startFollow(this.body, 0, this.body.width / 2);
    }
    checkGrounded() {
        let shape = new Ball(this.body.width / 2);
        const pos = { x: this.body.x, y: this.body.y };
        let shapeVel = { x: 0, y: 1 };
        const hit = this.world.castShape(
            pos,
            0,
            shapeVel,
            shape,
            0,
            4,
            true,
            QueryFilterFlags.ONLY_FIXED
        );
        if (hit) {
            return {
                grounded: true,
                normal: { x: hit.normal1.x, y: hit.normal1.y },
            };
        }
        return { grounded: false, normal: { x: 0, y: 0 } };
    }
    checkHits(
        body1: RigidBody,
        body2: RigidBody,
        time: number,
        obstacles: Obstacles[],
        power_ups: Santa_Slegh[],
        collectables: Collectable[]
    ) {
        const udata1 = body1.userData as any;
        const udata2 = body2.userData as any;

        if (udata1.type === "player" && udata2.type === "obstacle") {
            let obsta = obstacles.find((obs) => obs.rigid_body === body2);
            if (obsta) {
                const index = obstacles.indexOf(obsta);
                obsta.destroy();
                obstacles.splice(index, 1);
                if (this.velocity.x <= this.MAX_GROUND_ACCELERATION + 5) {
                    this.lastHitSomethingTime = time;
                    this.hit_something = true;
                }
                this.scene.cameras.main.shake(100, 0.02);
            }
        } else if (
            (udata1.type === "player" && udata2.type === "santa") ||
            (udata1.type === "player" && udata2.type === "grinch")
        ) {
            let obsta = power_ups.find((obs) => obs.rigid_body === body2);
            if (obsta) {
                const index = power_ups.indexOf(obsta);
                obsta.destroy();
                power_ups.splice(index, 1);
                this.ACCELERATION_START_TIME = time;
                this.velocity.x += 2;
                this.scene.cameras.main.shake(100, 0.02);
            }
        } else if (
            (udata1.type === "player" && udata2.type === "collectable")
        ) {
            let obsta = collectables.find((obs) => obs.rigid_body === body2);
            if (obsta) {
                const index = collectables.indexOf(obsta);
                obsta.destroy();
                collectables.splice(index, 1)
                this.collectedPresent++
            }
        }

        else if (
            (udata1.type === "hit_box" && udata2.type === "ground") ||
            (udata1.type === "ground" && udata2.type === "hit_box")
        ) {
            console.log("hey hitbox");
            this.lastHitSomethingTime = time;
            this.hit_something = true;
        }
    }
    cancel_hit_somwthing(time: number) {
        if (time > this.lastHitSomethingTime + 1000) {
            this.hit_something = false;
            //this.lastHitSomethingTime = time;
        }
    }
    restart() {
        this.rigid_body.setTranslation(this.position, true);
    }
}
