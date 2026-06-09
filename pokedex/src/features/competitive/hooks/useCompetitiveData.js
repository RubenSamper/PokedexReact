import { useQuery } from "@tanstack/react-query";
import { getTierData } from "../utils/competitiveData";

/**
 * Tiers a consultar en orden de preferencia.
 * @type {Array<{id: string, label: string}>}
 */
const TIERS = [
    { id: "ou", label: "OU (OverUsed)" },
    { id: "uu", label: "UU (UnderUsed)" },
    { id: "ru", label: "RU (RarelyUsed)" },
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
 * Busca un Pokémon en los datos de un tier.
 * @param {Object} tierData - Datos del tier (clave → entry)
 * @param {string} normalizedInput - Nombre normalizado a buscar
 * @param {string} tierLabel - Etiqueta del tier
 * @returns {Object|null} Datos del Pokémon con _tier, o null
 */
function findInTier(tierData, normalizedInput, tierLabel, tierId) {
    if (!tierData) return null;
    const key = Object.keys(tierData).find(
        (k) => normalize(k) === normalizedInput
    );
    if (key) {
        return { ...tierData[key], _tier: tierLabel, _tierId: tierId };
    }
    return null;
}

/**
 * useCompetitiveData
 *
 * Obtiene los datos competitivos de un Pokémon buscando en varios tiers
 * de Smogon (OU → UU → RU) y devuelve la información del primero donde
 * aparezca, junto con la etiqueta del tier en _tier.
 *
 * @param {string} pokemonName - Nombre del Pokémon (ej. "Garchomp", "Nidoking").
 * @returns {{ data: object|null, isLoading: boolean, isError: boolean, error: Error|null }}
 */
export function useCompetitiveData(pokemonName) {
    const normalizedInput = normalize(pokemonName || "");

    // ─── OU ───────────────────────────────────────────────────────────
    const ouQuery = useQuery({
        queryKey: ["competitiveTier", "2024-05", "ou"],
        queryFn: () => getTierData("ou"),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: !!pokemonName,
    });

    const foundInOU = ouQuery.data
        ? findInTier(ouQuery.data, normalizedInput, TIERS[0].label, TIERS[0].id)
        : null;

    // ─── UU (solo si OU no encontró) ─────────────────────────────────
    const uuEnabled = !!pokemonName && !!ouQuery.data && !foundInOU;
    const uuQuery = useQuery({
        queryKey: ["competitiveTier", "2024-05", "uu"],
        queryFn: () => getTierData("uu"),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: uuEnabled,
    });

    const foundInUU = uuQuery.data
        ? findInTier(uuQuery.data, normalizedInput, TIERS[1].label, TIERS[1].id)
        : null;

    // ─── RU (solo si UU no encontró) ──────────────────────────────────
    const ruEnabled = uuEnabled && !!uuQuery.data && !foundInUU;
    const ruQuery = useQuery({
        queryKey: ["competitiveTier", "2024-05", "ru"],
        queryFn: () => getTierData("ru"),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: ruEnabled,
    });

    // ─── Combinar resultado ──────────────────────────────────────────
    const data = foundInOU || foundInUU || null;

    const isLoading =
        ouQuery.isLoading ||
        (ouQuery.isSuccess && !foundInOU && uuQuery.isLoading) ||
        (uuQuery.isSuccess && !foundInOU && !foundInUU && ruQuery.isLoading);

    const isError = ouQuery.isError;

    return { data, isLoading, isError, error: ouQuery.error };
}
