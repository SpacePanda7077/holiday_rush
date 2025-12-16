import { useGetScore } from "./hooks/useGetScore";
import { useAppKitAccount } from "@reown/appkit/react";
import { useReadContract } from "wagmi";
import { abi, contract_address } from "../network/network";
import { useEffect, useState } from "react";
import Add_Player from "./AddPlayer";
import MarketPlace from "./MarketPlace";
import My_Characters from "./My_Characters";
interface NavbarProp {
    equip: (character: string) => void;
}
function NavBar({ equip }: NavbarProp) {
    const { address } = useAppKitAccount();
    const [owner, setOwner] = useState<string>("");
    const [open_add_player, setOpenAddPlayer] = useState(false);
    const [open_marketPlace, setOpenMarketplace] = useState(false);
    const [open_inventory, setOpenInventory] = useState(false);
    const { data: owner_address, isSuccess } = useReadContract({
        address: contract_address,

        abi,

        functionName: "owner",
    });
    useEffect(() => {
        if (!address) return;
        if (isSuccess) {
            setOwner(owner_address as string);
        }
    }, [isSuccess, address]);
    const { score, mycoins, get_score } = useGetScore();
    return (
        <>
            <div className="navbar-container">
                <h3>HighScore: {score}</h3>
                <h3>Coins : {mycoins}</h3>
                <button
                    onClick={() => {
                        setOpenMarketplace(true);
                    }}
                >
                    Market Place
                </button>
                <button
                    onClick={() => {
                        setOpenInventory(true);
                    }}
                >
                    My Characters
                </button>
                {address === owner_address && (
                    <button
                        onClick={() => {
                            setOpenAddPlayer(true);
                        }}
                    >
                        Add Player
                    </button>
                )}
            </div>
            <Add_Player
                open_modal={open_add_player}
                setOpenModal={() => {
                    setOpenAddPlayer(false);
                }}
            />
            <MarketPlace
                open_modal={open_marketPlace}
                setOpenModal={() => {
                    setOpenMarketplace(false);
                }}
            />
            <My_Characters
                open_modal={open_inventory}
                setOpenModal={() => {
                    setOpenInventory(false);
                }}
                equip={equip}
            />
        </>
    );
}
export default NavBar;

