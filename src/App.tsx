import { useEffect, useRef, useState } from "react";

import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

import { Get_Score } from "./components/Get_Score";

import { EventBus } from "./game/EventBus";

import { useAppKitAccount } from "@reown/appkit/react";

import { useWriteContract } from "wagmi";

import { contract_address, abi } from "./network/network.ts";

import axios from "axios";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)

    const [scene, setScene] = useState<any>("Menu");

    const [open_leaderboard, setOpenLeaderboard] = useState<boolean>(false);

    const { address, isConnected, status, allAccounts } = useAppKitAccount();

    const { data, isSuccess, writeContract } = useWriteContract();

    const scoreData = Get_Score();
    const score =
        typeof scoreData === "object" && "score" in scoreData
            ? scoreData.score
            : "0";
    const leaderboard =
        typeof scoreData === "object" && "leaderboard" in scoreData
            ? scoreData.leaderboard
            : [];
    const get_score =
        typeof scoreData === "object" && "get_score" in scoreData
            ? scoreData.get_score
            : undefined;

    const phaserRef = useRef<IRefPhaserGame | null>(null);

    useEffect(() => {
        if (!address) return;

        EventBus.on("store", async (data: { score: number }) => {
            console.log(address, data.score);

            if (data.score < Number(score)) return;
            const res: any = await axios.post(
                "https://hr-backend-mauve.vercel.app/verify_score",

                { address, score: data.score }
            );

            console.log(res.data);

            writeContract({
                address: contract_address,

                abi: abi,

                functionName: "store_highscore",

                args: [address, data.score, res.data.nonce, res.data.signature],
            });

            //EventBus.off("store");
        });
    }, [address]);

    useEffect(() => {
        EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
            setScene(scene_instance.scene.key);
            if (get_score) {
                get_score();
            }
        });
    }, []);

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

            {scene === "Menu" && open_leaderboard && (
                <div className="leaderboard-container">
                    <button
                        onClick={() => {
                            setOpenLeaderboard(false);
                        }}
                    >
                        Close
                    </button>

                    {leaderboard?.map((p: any, i) => (
                        <div key={i} className="leaderboard">
                            <p>
                                {p.addres.slice(0, 5)}...{p.addres.slice(-5)}
                            </p>

                            <p>{p.score}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;

