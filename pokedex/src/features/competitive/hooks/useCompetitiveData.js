import { useQuery } from "@tanstack/react-query";
import { getBestCompetitiveData } from "../utils/competitiveData";

/**
 * useCompetitiveData
 *
 * Obtiene los datos competitivos de todos los Pokémon desde Smogon y devuelve
 * solo la información del Pokémon solicitado.
 *
 * @param {string} pokemonName - Nombre del Pokémon (ej. "Garchomp", "Pikachu").
 * @returns {{ data: object|null, isLoading: boolean, isError: boolean, error: Error|null }}
 *
 * @example
 * const { data, isLoading, isError } = useCompetitiveData("Garchomp");
 * // data => { bestAbility: "roughskin", bestItem: "rockyhelmet", ... }
 */
export function useCompetitiveData(pokemonName) {
    const {
        data: fullData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["competitiveData", "2024-05-ou"],
        queryFn: getBestCompetitiveData,
        staleTime: 1000 * 60 * 60, // 1 hora - los datos cambian una vez al mes
        gcTime: 1000 * 60 * 60 * 24, // mantener en caché 24h
        enabled: !!pokemonName,
    });

    // Filtrado fuera de select para evitar problemas de clausura con React Query
    let data = null;
    if (fullData && pokemonName) {
        const key = Object.keys(fullData).find(
            (k) => k.toLowerCase() === pokemonName.toLowerCase()
        );
        if (key) {
            data = fullData[key];
        }
    }

    return { data, isLoading, isError, error };
}
