import { useReadContract } from "wagmi";

import { useAppKitAccount } from "@reown/appkit/react";

import { abi, contract_address } from "../network/network";

import { useEffect, useState } from "react";

export function Get_Score() {
    const { address, isConnected, status, allAccounts } = useAppKitAccount();

    const [score, setScore] = useState<string>("0");

    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const {
        data: leaderBoardArray,
        isError,
        isLoading,
        refetch,
    } = useReadContract({
        address: contract_address,

        abi,

        functionName: "get_high_scores",
    });

    useEffect(() => {
        if (!address) return;

        console.log(address);

        if (leaderBoardArray) {
            const data: any = leaderBoardArray;
            const mappedData = data[0].map((d: any, i: any) => ({
                addres: d,

                score: data[1][i],
            }));
            const myScore = mappedData.find((d: any) => d.addres === address);
            setScore(myScore?.score.toString() || "0");

            const sortedData = mappedData.sort(
                (a: any, b: any) => b.score - a.score
            );

            setLeaderboard(sortedData);

            console.log(sortedData);
        }
    }, [leaderBoardArray, address]);

    if (isLoading) return <>Loading...</>;

    if (isError) return <>Error reading score</>;

    return { score, leaderboard, get_score: refetch };
}

