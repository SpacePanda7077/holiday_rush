import { formatEther } from "viem";
import useInventory from "./hooks/useInventory";
import { useEffect, useState } from "react";
interface My_CharacterProp {
    open_modal: boolean;
    setOpenModal: () => void;
    equip: (character: string) => void;
}

function My_Characters({ open_modal, setOpenModal, equip }: My_CharacterProp) {
    const { my_characters, get_characters } = useInventory();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    useEffect(() => {
        if (my_characters.length > 0) {
            equip(my_characters[0].character);
            setSelectedIndex(0);
        }
    }, [my_characters]);

    return (
        <>
            {open_modal && (
                <div className="marketplace-container">
                    <div className="marketplace-main-container">
                        {my_characters?.map((character, index) => (
                            <div key={index} className="inner-container">
                                <img src={character.character} alt="" />
                                <div className="button">
                                    <p>
                                        {index === selectedIndex
                                            ? "Eqiuped"
                                            : "Equip"}
                                    </p>
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
export default My_Characters;

