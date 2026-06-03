import { useQuery } from "@tanstack/react-query";
import { fetchPlayers } from "../utils/cobblemon";

export function usePlayers() {
    return useQuery({
        queryKey: ["cobblemonPlayers"],
        queryFn: fetchPlayers,
        staleTime: 1000 * 60 * 2, // 2 min, los datos del servidor cambian
        retry: 2,
    });
}
