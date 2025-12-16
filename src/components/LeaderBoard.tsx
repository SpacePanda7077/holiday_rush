import { useGetScore } from "./hooks/useGetScore.tsx";
interface LeaderboardProp {
    open_modal: boolean;
    setOpenModal: () => void;
}
import "./css/components.css";
import { useEffect } from "react";
import { EventBus } from "../game/EventBus.ts";

function LeaderBoard({ open_modal, setOpenModal }: LeaderboardProp) {
    const { leaderboard, get_score } = useGetScore();
    useEffect(() => {
        EventBus.on("current-scene-ready", () => {
            get_score();
        });
    }, []);

    return (
        <>
            {open_modal && (
                <div className="leaderboard-container">
                    <button
                        onClick={() => {
                            setOpenModal();
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
        </>
    );
}
export default LeaderBoard;

