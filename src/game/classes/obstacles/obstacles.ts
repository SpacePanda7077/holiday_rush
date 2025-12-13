import {
    ActiveCollisionTypes,
    ActiveEvents,
    ColliderDesc,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";
import { Scene } from "phaser";

export class Obstacles {
    scene: Scene;
    decoration: Phaser.GameObjects.Sprite;
    world: World;
    rigid_body: any;
    collider: any;
    constructor(
        scene: Phaser.Scene,
        world: World,
        position: { x: number; y: number }
    ) {
        this.scene = scene;
        this.world = world;
        this.create_decorations(position);
    }
    create_decorations(position: { x: number; y: number }) {
        const width = Phaser.Math.Between(50, 100);
        const height = Phaser.Math.Between(50, 80);
        this.decoration = this.scene.add
            .sprite(position.x, position.y, "rock")
            .setOrigin(0.5, 1)
            .setDepth(1)
            .setScale(0.5);

        const rigid_body_desc = RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y - width / 2)
            .setUserData({ type: "obstacle" })
            .lockTranslations();

        this.rigid_body = this.world.createRigidBody(rigid_body_desc);
        const collider_desc = ColliderDesc.cuboid(
            this.decoration.displayWidth / 2,
            this.decoration.displayHeight / 2
        )
            .setFriction(0)
            .setRestitution(0)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(ActiveCollisionTypes.ALL)
            .setSensor(true);
        this.collider = this.world.createCollider(
            collider_desc,
            this.rigid_body
        );
    }
    destroy() {
        this.world.removeRigidBody(this.rigid_body);
        this.decoration.destroy();
    }
}

