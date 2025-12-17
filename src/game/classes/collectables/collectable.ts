import {
    ActiveCollisionTypes,
    ActiveEvents,
    ColliderDesc,
    RigidBodyDesc,
    World,
} from "@dimforge/rapier2d-compat";

export class Collectable {
    scene: Phaser.Scene;
    world: World;
    decoration: Phaser.GameObjects.Sprite;
    rigid_body: any;
    collider: any;
    constructor(
        scene: Phaser.Scene,
        world: World,
        position: { x: number; y: number }
    ) {
        this.scene = scene;
        this.world = world;
        this.create_body(position);
    }
    create_body(position: { x: number; y: number }) {
        this.decoration = this.scene.add
            .sprite(
                position.x,
                position.y - 50,
                "present",
                Math.floor(Math.random() * 3)
            )
            .setDepth(4000)
            .setScale(1.5);
        const rigid_body_desc = RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y)
            .setUserData({ type: "collectable" })
            .lockTranslations();

        this.rigid_body = this.world.createRigidBody(rigid_body_desc);
        const collider_desc = ColliderDesc.cuboid(25, 25)
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
