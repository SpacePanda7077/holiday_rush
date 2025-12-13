import { Scene } from "phaser";

export class UI extends Scene {
    scoreContainer: any;
    score_board: any;
    fall_text: any;
    present: any;
    score: any;
    highscore: any;
    main_menu: any;
    try_again: any;
    game_width: number;
    game_height: number;
    constructor() {
        super("Ui");
    }
    create() {
        this.game_width = Number(this.game.config.width);
        this.game_height = Number(this.game.config.height);
        this.create_end_screen();
        this.events.on("open_end_screen", () => {
            this.scoreContainer.setActive(true).setVisible(true);
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
            .text(0, 300, "Try_Again", {
                fontSize: "50px",
                color: "green",
                align: "center",
                fontStyle: "bold",
                wordWrap: {
                    width: 1000,
                    useAdvancedWrap: true,
                },
            })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                console.log("kkk");
                this.scene.stop();
                this.scene.get("Game").events.emit("restart");
            });
        this.scoreContainer
            .add([
                this.score_board,
                this.fall_text,
                this.present,
                this.score,
                this.highscore,

                this.try_again,
            ])
            .setActive(false)
            .setVisible(false);
    }
}

