import {
    ActiveCollisionTypes,
    ActiveEvents,
    Ball,
    ColliderDesc,
    KinematicCharacterController,
    QueryFilterFlags,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";
import { Scene } from "phaser";
import { Obstacles } from "../obstacles/obstacles";

export class Santa_Slegh {
    scene: Scene;
    world: World;
    body: Phaser.GameObjects.Sprite;
    rigid_body: any;
    collider: any;
    character_controller: KinematicCharacterController;
    velocity: Phaser.Math.Vector2;
    isGrounded: boolean;
    GRAVITY: number;
    JUMP_HEIGHT: number;
    JUMP_TIME: number;
    collected: boolean;
    constructor(
        scene: Phaser.Scene,
        world: World,
        position: { x: number; y: number }
    ) {
        this.scene = scene;
        this.world = world;
        this.JUMP_HEIGHT = 3;
        this.JUMP_TIME = 0.6;
        this.GRAVITY =
            (2 * this.JUMP_HEIGHT) / (this.JUMP_TIME * this.JUMP_TIME);
        this.velocity = new Phaser.Math.Vector2(0, 0);
        this.collected = false;
        this.create_body(position);
    }
    create_body(position: { x: number; y: number }) {
        this.body = this.scene.add
            .sprite(position.x, position.y - 100, "santa")
            .setScale(2);
        const rigid_body_desc = RigidBodyDesc.kinematicPositionBased()
            .setTranslation(position.x, position.y - 100)
            .setUserData({ type: "santa" });

        this.rigid_body = this.world.createRigidBody(rigid_body_desc);
        const collider_desc = ColliderDesc.ball(40)
            .setFriction(0)
            .setRestitution(0)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(ActiveCollisionTypes.ALL)
            .setSensor(true);
        this.collider = this.world.createCollider(
            collider_desc,
            this.rigid_body
        );

        this.character_controller = this.world.createCharacterController(0.01);
        this.character_controller.setUp({ x: 0, y: -1 });
        this.character_controller.enableSnapToGround(200);
    }
    move_body(time: number, delta: number, angle: number) {
        if (this.collected) {
            return;
        }
        const check_grounded = this.checkGrounded();

        this.isGrounded = this.character_controller.computedGrounded();

        let rotation_angle = angle;

        if (!this.isGrounded) {
            this.velocity.y += this.GRAVITY * (delta / 1000);
            this.body.rotation = Math.atan2(this.velocity.y, this.velocity.x);
        } else {
            this.velocity.y = Math.abs(check_grounded.normal.y) * 2;

            const nangle = Math.atan2(
                check_grounded.normal.y,
                check_grounded.normal.x
            );
            this.body.rotation = Math.atan2(this.velocity.y, this.velocity.x);
        }

        // handle forward movement

        if (!this.collected) {
            this.velocity.x = 18;
        }

        this.character_controller.computeColliderMovement(
            this.collider,
            this.velocity,
            QueryFilterFlags.ONLY_FIXED
        );
        const computed_movement = this.character_controller.computedMovement();
        const position = this.rigid_body.translation();
        const next_position = {
            x: position.x + computed_movement.x,
            y: position.y + computed_movement.y,
        };
        this.rigid_body.setNextKinematicTranslation(next_position);
    }

    sync_body() {
        const position = this.rigid_body.translation();
        this.body.setPosition(position.x, position.y);
    }

    checkGrounded() {
        let shape = new Ball(40);
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
                normal: { x: hit.normal2.x, y: hit.normal2.y },
            };
        }
        return { grounded: false, normal: { x: 0, y: 0 } };
    }
    destroy() {
        this.world.removeRigidBody(this.rigid_body);
        this.world.removeCharacterController(this.character_controller);
        this.scene.tweens.add({
            targets: this.body,
            y: this.body.y - 100,
            duration: 500,
            onComplete: () => {
                this.body.destroy();
            },
        });
    }
}

