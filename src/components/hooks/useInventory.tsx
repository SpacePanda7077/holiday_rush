import { useReadContract } from "wagmi";

import { useAppKitAccount } from "@reown/appkit/react";

import { abi, contract_address } from "../../network/network";
import { useEffect, useState } from "react";
type useInventoryReturn = {
    my_characters: any[];
    get_characters: () => void;
};
function useInventory(): useInventoryReturn {
    const { address } = useAppKitAccount();
    const [my_characters, setMyCharacters] = useState<any[]>([]);
    const { data, refetch } = useReadContract({
        address: contract_address,
        abi: abi,
        functionName: "get_my_characters",
        args: [address],
    });

    useEffect(() => {
        if (address && data) {
            const all_characters: any = data;
            setMyCharacters(all_characters);
        }
    }, [data, address]);
    return { my_characters, get_characters: refetch };
}
export default useInventory;

