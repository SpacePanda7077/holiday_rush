import { AUTO, Game, Types, Scale } from "phaser";
import { Physics as Init_Physics_Scene } from "./scenes/Physics";
import { UI } from "./scenes/UI";
import { Menu } from "./scenes/Menu";
import { Game as MainGame } from "./scenes/Game";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [Menu, Init_Physics_Scene, MainGame, UI],
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

