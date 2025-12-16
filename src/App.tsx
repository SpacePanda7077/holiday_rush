import { useEffect, useRef, useState } from "react";

import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

import { EventBus } from "./game/EventBus";

import { useAppKitAccount } from "@reown/appkit/react";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { contract_address, abi } from "./network/network.ts";
import useInventory from "./components/hooks/useInventory.tsx";

import axios from "axios";
import LeaderBoard from "./components/LeaderBoard.tsx";
import NavBar from "./components/NavBar.tsx";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)

    const [scene, setScene] = useState<any>("Menu");
    const [currentscene, setCurrentScene] = useState<Phaser.Scene | null>(null);
    const [character, setCharacter] = useState("");

    const setplayerCharacter = (pcharacter: string) => {
        setCharacter(pcharacter);
    };

    const [open_leaderboard, setOpenLeaderboard] = useState<boolean>(false);
    const closeLeaderBoard = () => {
        setOpenLeaderboard(false);
    };
    const { my_characters, get_characters } = useInventory();

    const { address } = useAppKitAccount();

    const { data: buydata, mutate: write } = useWriteContract();
    const { data: buyReceipt } = useWaitForTransactionReceipt({
        hash: buydata,
    });

    const first_mint = () => {
        write({
            address: contract_address,
            abi,
            functionName: "buy_character",
            args: [0],
        });
    };

    const { data, isError, error, mutate } = useWriteContract();

    const phaserRef = useRef<IRefPhaserGame | null>(null);

    useEffect(() => {
        if (!address) return;

        EventBus.on("store", async (data: { score: number; coins: number }) => {
            console.log(address, data.score, data.coins);
            const res: any = await axios.post(
                "http://localhost:3000/verify_score",

                { address, score: data.score }
            );

            console.log(res.data);

            mutate({
                address: contract_address,

                abi: abi,

                functionName: "store_highscore",

                args: [
                    address,
                    data.coins,
                    data.score,
                    res.data.nonce,
                    res.data.signature,
                ],
            });

            //EventBus.off("store");
        });
    }, [address]);

    useEffect(() => {
        EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
            setScene(scene_instance.scene.key);
            setCurrentScene(scene_instance);
        });
    }, []);
    useEffect(() => {
        if (buyReceipt) {
            get_characters();
        }
    }, [buyReceipt]);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />

            <div className="leaderboard-btn-container">
                <button
                    onClick={() => {
                        setOpenLeaderboard(true);
                    }}
                >
                    Leaderboard
                </button>
            </div>

            {scene === "Menu" && (
                <>
                    <div className="start-btn">
                        <button
                            onClick={() => {
                                if (my_characters.length <= 0) {
                                    first_mint();
                                } else {
                                    if (currentscene) {
                                        currentscene.sound.stopAll();
                                        currentscene.scene.start("Physics", {
                                            character,
                                        });
                                    }
                                }
                            }}
                        >
                            {my_characters.length <= 0
                                ? "MInt First Character"
                                : "Play"}
                        </button>
                    </div>

                    <NavBar equip={setplayerCharacter} />
                    <LeaderBoard
                        open_modal={open_leaderboard}
                        setOpenModal={closeLeaderBoard}
                    />
                </>
            )}
        </div>
    );
}

export default App;

