import {
    ActiveCollisionTypes,
    ActiveEvents,
    ColliderDesc,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";

class Collectable {
    scene: Phaser.Scene;
    world: World;
    body: Phaser.GameObjects.Sprite;
    rigid_body: any;
    collider: any;
    constructor(
        scene: Phaser.Scene,
        world: World,
        position: { x: number; y: number }
    ) {
        this.scene = scene;
        this.world = world;
    }
    create_body(position: { x: number; y: number }) {
        this.body = this.scene.add
            .sprite(position.x, position.y - 100, "collectable")
            .setScale(2);
        const rigid_body_desc = RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y - 100)
            .setUserData({ type: "collectable" })
            .lockTranslations();

        this.rigid_body = this.world.createRigidBody(rigid_body_desc);
        const collider_desc = ColliderDesc.ball(40)
            .setFriction(0)
            .setRestitution(0)
            .setActiveEvents(ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(ActiveCollisionTypes.ALL);
        this.collider = this.world.createCollider(
            collider_desc,
            this.rigid_body
        );
    }
}

