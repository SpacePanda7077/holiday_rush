import { formatEther } from "viem";
import { contract_address, abi } from "../network/network";
import { useWriteContract } from "wagmi";
import useGetAllCharacters from "./hooks/useGetAllCharacters";
import { useState } from "react";
interface MarketPlaceProp {
    open_modal: boolean;
    setOpenModal: () => void;
}

function MarketPlace({ open_modal, setOpenModal }: MarketPlaceProp) {
    const { all_characters, get_characters } = useGetAllCharacters();
    const { data, isError, error, mutate } = useWriteContract();

    const handle_buy = (index: number) => {
        mutate({
            address: contract_address,
            abi,
            functionName: "buy_character",
            args: [index],
        });
    };

    return (
        <>
            {open_modal && (
                <div className="marketplace-container">
                    <div className="marketplace-main-container">
                        {all_characters?.map((character, index) => (
                            <div key={index} className="inner-container">
                                <img src={character.character} alt="" />
                                <div
                                    onClick={() => {
                                        handle_buy(index);
                                    }}
                                    className="button"
                                >
                                    <p>Buy</p>
                                    <p>{formatEther(character.price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: "50%" }}>
                        <button
                            style={{
                                width: "100%",
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "10px",
                                height: "30px",
                            }}
                            onClick={setOpenModal}
                        >
                            close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
export default MarketPlace;

