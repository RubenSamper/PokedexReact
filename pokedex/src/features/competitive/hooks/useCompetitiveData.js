import { useQuery } from "@tanstack/react-query";
import { getTierData } from "../utils/competitiveData";

/**
 * Tiers a consultar en orden de preferencia.
 * @type {Array<{id: string, label: string}>}
 */
const TIERS = [
    { id: "ou",           label: "OU (OverUsed)" },
    { id: "uu",           label: "UU (UnderUsed)" },
    { id: "ru",           label: "RU (RarelyUsed)" },
    { id: "nu",           label: "NU (NeverUsed)" },
    { id: "pu",           label: "PU" },
    { id: "zu",           label: "ZU (ZeroUsed)" },
    { id: "ubers",        label: "Ubers" },
    { id: "doublesou",    label: "Doubles OU" },
    { id: "lc",           label: "LC (Little Cup)" },
];

/**
 * Normaliza un nombre de Pokémon para comparación:
 * quita caracteres no alfanuméricos y pasa a minúsculas.
 * Ej: "Mr. Mime" → "mrmime", "mr-mime" → "mrmime"
 * @param {string} s
 * @returns {string}
 */
function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * useCompetitiveData
 *
 * Obtiene los datos competitivos de un Pokémon buscando en todos los tiers
 * de Smogon (OU → UU → RU → NU → PU → ZU → Ubers → Doubles OU → LC)
 * y devuelve la información del primero donde aparezca, junto con la
 * etiqueta del tier en _tier.
 *
 * @param {string} pokemonName - Nombre del Pokémon (ej. "Garchomp", "Nidoking").
 * @returns {{ data: object|null, isLoading: boolean, isError: boolean, error: Error|null }}
 */
export function useCompetitiveData(pokemonName) {
    const normalizedInput = normalize(pokemonName || "");

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["competitiveData", "2024-05", pokemonName?.toLowerCase()],
        queryFn: async () => {
            for (const tier of TIERS) {
                try {
                    const tierData = await getTierData(tier.id);
                    const key = Object.keys(tierData).find(
                        (k) => normalize(k) === normalizedInput
                    );
                    if (key) {
                        return {
                            ...tierData[key],
                            _tier: tier.label,
                            _tierId: tier.id,
                        };
                    }
                } catch {
                    // Si un tier falla (error de red, etc.), continuar con el siguiente
                    continue;
                }
            }
            return null; // no encontrado en ningún tier
        },
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: !!pokemonName,
    });

    return { data, isLoading, isError, error };
}
