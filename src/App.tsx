import { useEffect, useRef } from "react";



import { IRefPhaserGame, PhaserGame } from "./PhaserGame";



import { Get_Score } from "./components/Get_Score";



import { EventBus } from "./game/EventBus";
import { useAccount } from "wagmi";

import axios from "axios";



function App() {

    //  References to the PhaserGame component (game and scene are exposed)
const { address, isConnecting, isDisconnected } = useAccount()


    const phaserRef = useRef<IRefPhaserGame | null>(null);



    const { score, get_score } = Get_Score();

    useEffect(() => {

        EventBus.on("store", async (data: { score: number }) => {

            const res: any = await axios.get(
                "https://ff22a21e-c63a-4f66-9a05-3df6ed68ffbf-00-3ir3km59yofqq.janeway.replit.dev/");
            console.log(res)

        });

    }, []);



    return (

        <div id="app">

            <PhaserGame ref={phaserRef} />



            <div>{score}</div>

        </div>

    );

}



export default App;

