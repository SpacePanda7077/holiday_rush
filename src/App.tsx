import { useEffect, useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { Get_Score } from "./components/Get_Score";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const { score, get_score } = Get_Score();

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <div>{score}</div>
        </div>
    );
}

export default App;

