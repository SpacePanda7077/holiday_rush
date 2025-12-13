import { useReadContract } from "wagmi";
import { abi, contract_address } from "../network/network";
import { useEffect, useState } from "react";
export function Get_Score() {
    const [score, setScore] = useState(0);
    const { data, isError, isSuccess } = useReadContract({
        address: contract_address,
        abi: abi,
        functionName: "get_player_score",
    });
    const get_score = () => {
        const { data: hash, isSuccess: success } = useReadContract({
            address: contract_address,
            abi: abi,
            functionName: "get_player_score",
        });
        setScore(Number(hash));
    };
    useEffect(() => {
        if (isSuccess) {
            setScore(Number(data));
        }
    }, [isSuccess]);
    return { score, get_score };
}

