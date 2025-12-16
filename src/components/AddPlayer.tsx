import { useEffect, useState } from "react";
import { contract_address, abi } from "../network/network";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";

interface AddPlayerProp {
    open_modal: boolean;
    setOpenModal: () => void;
}

function Add_Player({ open_modal, setOpenModal }: AddPlayerProp) {
    const [name, setName] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [isFree, setIsFree] = useState<boolean>(false);
    const { data, isError, error, mutate } = useWriteContract();

    const create_character = () => {
        if (!name) {
            alert("name cant be empty");
            return;
        }
        if (!image) {
            alert("image cant be empty");
            return;
        }
        mutate({
            address: contract_address,
            abi,
            functionName: "add_character",
            args: [name, image, parseEther(price.toString()), isFree],
        });
    };

    return (
        <>
            {open_modal && (
                <div className="addplayer-container">
                    <input
                        id="input"
                        type="text"
                        placeholder="Name"
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                    <input
                        id="input"
                        type="text"
                        placeholder="ipfs image"
                        onChange={(e) => {
                            setImage(e.target.value);
                        }}
                    />
                    <input
                        id="input"
                        type="text"
                        placeholder="Price"
                        onChange={(e) => {
                            setPrice(Number(e.target.value));
                        }}
                    />

                    <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                    />
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <button onClick={create_character}>
                            Add Character
                        </button>
                        <button onClick={setOpenModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
}
export default Add_Player;

