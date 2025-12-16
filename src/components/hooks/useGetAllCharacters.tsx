import { useReadContract } from "wagmi";

import { useAppKitAccount } from "@reown/appkit/react";

import { abi, contract_address } from "../../network/network";
import { useEffect, useState } from "react";

type useGetAllCharactersReturn = {
    all_characters: any[];
    get_characters: () => void;
};
function useGetAllCharacters(): useGetAllCharactersReturn {
    const { address } = useAppKitAccount();
    const [all_characters, setAllCharacters] = useState<any[]>([]);
    const { data, refetch } = useReadContract({
        address: contract_address,
        abi: abi,
        functionName: "get_all_characters",
    });

    useEffect(() => {
        if (address && data) {
            const all_characters: any = data;
            setAllCharacters(all_characters);
        }
    }, [data, address]);
    return { all_characters, get_characters: refetch };
}
export default useGetAllCharacters;

