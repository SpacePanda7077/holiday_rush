import { Scene } from "phaser";

export class Decoration {
    scene: Scene;
    decoration: Phaser.GameObjects.Sprite;
    constructor(
        scene: Phaser.Scene,
        position: { x: number; y: number },
        texture: string
    ) {
        this.scene = scene;
        this.create_decorations(position, texture);
    }
    create_decorations(position: { x: number; y: number }, texture: string) {
        this.decoration = this.scene.add
            .sprite(position.x, position.y, texture)
            .setOrigin(0.5, 1)
            .setDepth(-290)
            .setScale(3);
    }
    destroy() {
        this.decoration.destroy();
    }
}

