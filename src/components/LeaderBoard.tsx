import { useReadContract } from "wagmi";
import { abi, contract_address } from "../network/network";
import { useEffect, useState } from "react";
export function LeaderBoard() {
    const [leaderBoard, setLeaderBoard] = useState<any>([]);
    const { data, isError, isSuccess } = useReadContract({
        address: contract_address,
        abi: abi,
        functionName: "get_high_scores",
    });

    useEffect(() => {
        if (isSuccess) {
            setLeaderBoard(data);
        }
    }, [isSuccess]);

    return { leaderBoard };
}

