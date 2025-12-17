import { useReadContract } from "wagmi";

import { useAppKitAccount } from "@reown/appkit/react";

import { abi, contract_address } from "../../network/network";

import { useEffect, useState } from "react";

type GetScoreReturn = {
    score: number;
    mycoins: number;
    leaderboard: any[];
    get_score: () => void;
};

export function useGetScore(): GetScoreReturn {
    const { address } = useAppKitAccount();

    const [score, setScore] = useState<number>(0);
    const [mycoins, setMyCoins] = useState<number>(0);

    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const { data: leaderBoardArray, refetch } = useReadContract({
        address: contract_address,

        abi,

        functionName: "get_high_scores",
    });
    const {
        data: high_score,

        refetch: get_highscore,
    } = useReadContract({
        address: contract_address,

        abi,

        functionName: "get_player_score",
        args: [address],
    });
    const { data: coins, refetch: get_coins } = useReadContract({
        address: contract_address,

        abi,

        functionName: "get_player_coins",
        args: [address],
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

            const sortedData = mappedData.sort(
                (a: any, b: any) => Number(b.score) - Number(a.score)
            );

            setLeaderboard(sortedData);
            setMyCoins(Number(coins));
            setScore(Number(high_score));

            console.log(sortedData);
        }
    }, [leaderBoardArray, coins, high_score, address]);

    const get_score = () => {
        refetch();
        get_highscore();
        get_coins();
    };
    return { score, mycoins, leaderboard, get_score };
}

