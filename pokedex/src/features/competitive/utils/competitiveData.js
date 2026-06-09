/**
 * getTierData
 *
 * Descarga y procesa el JSON de estadísticas competitivas de Smogon para el
 * tier indicado (ej. "ou", "uu", "ru") del mes 2024-05 y extrae, para cada
 * Pokémon, la habilidad más usada, el objeto más usado, la naturaleza más
 * usada y los 10 movimientos más usados.
 *
 * @param {string} tier - Código del tier ("ou", "uu", "ru", etc.)
 * @returns {Promise<Object.<string, {bestAbility: string, bestItem: string, topItems: Array<{name: string, count: number}>, bestNature: string, topMoves: string[]}>>}
 * @throws {Error} Si la descarga falla o la respuesta no es válida.
 */
const WORKER_URL = "https://gentle-sea-9ea3.rubensampercruz123.workers.dev";

const TIER_MAP = {
    ou:              { file: "gen9ou-0.json",              label: "OU (OverUsed)" },
    uu:              { file: "gen9uu-0.json",              label: "UU (UnderUsed)" },
    ru:              { file: "gen9ru-0.json",              label: "RU (RarelyUsed)" },
    nu:              { file: "gen9nu-0.json",              label: "NU (NeverUsed)" },
    pu:              { file: "gen9pu-0.json",              label: "PU" },
    zu:              { file: "gen9zu-0.json",              label: "ZU (ZeroUsed)" },
    ubers:           { file: "gen9ubers-0.json",           label: "Ubers" },
    doublesou:       { file: "gen9doublesou-0.json",       label: "Doubles OU" },
    lc:              { file: "gen9lc-0.json",              label: "LC (Little Cup)" },
    nationaldex:     { file: "gen9nationaldex-0.json",     label: "National Dex OU" },
    nationaldexuu:   { file: "gen9nationaldexuu-0.json",   label: "National Dex UU" },
    nationaldexubers:{ file: "gen9nationaldexubers-0.json",label: "National Dex Ubers" },
};

export async function getTierData(tier = "ou") {
    const tierInfo = TIER_MAP[tier];
    if (!tierInfo) {
        throw new Error(`Tier desconocido: "${tier}"`);
    }

    const SMOGON_URL = `https://www.smogon.com/stats/2024-05/chaos/${tierInfo.file}`;
    const url = import.meta.env.DEV
        ? `/smogon-stats/2024-05/chaos/${tierInfo.file}`
        : `${WORKER_URL}/api/smogon-stats?url=${encodeURIComponent(SMOGON_URL)}`;

    let response;
    try {
        response = await fetch(url);
    } catch (networkError) {
        throw new Error(
            `Error de red al descargar los datos: ${networkError.message}`,
            { cause: networkError }
        );
    }

    if (!response.ok) {
        throw new Error(
            `Error al descargar datos: ${response.status} ${response.statusText}`
        );
    }

    /** @type {Object.<string, SmogonPokemonData>} */
    let rawData;
    try {
        rawData = await response.json();
    } catch (parseError) {
        throw new Error(
            `El JSON recibido no es válido: ${parseError.message}`,
            { cause: parseError }
        );
    }

    const result = {};

    const pokemonData = rawData.data;
    if (!pokemonData || typeof pokemonData !== "object") {
        throw new Error("El JSON no contiene la clave 'data' con los Pokémon.");
    }

    for (const [pokemon, data] of Object.entries(pokemonData)) {
        const entry = {};

        // --- Habilidad más usada ---
        if (data.Abilities && typeof data.Abilities === "object") {
            const entries = Object.entries(data.Abilities);
            if (entries.length > 0) {
                entries.sort(([, a], [, b]) => b - a);
                entry.bestAbility = entries[0][0];
            }
        }

        // --- Objeto más usado + top 6 ---
        if (data.Items && typeof data.Items === "object") {
            const entries = Object.entries(data.Items);
            if (entries.length > 0) {
                entries.sort(([, a], [, b]) => b - a);
                entry.bestItem = entries[0][0];
                entry.topItems = entries
                    .slice(0, 6)
                    .map(([name, count]) => ({ name, count }));
            }
        }

        // --- Naturaleza más usada ---
        // Las spreads vienen en formato "Nature:EVs" (ej. "Jolly:0/252/0/0/4/252")
        if (data.Spreads && typeof data.Spreads === "object") {
            const entries = Object.entries(data.Spreads);
            if (entries.length > 0) {
                entries.sort(([, a], [, b]) => b - a);
                const topSpreadKey = entries[0][0];
                entry.bestNature = topSpreadKey.split(":")[0];
            }
        }

        // --- 10 movimientos más usados ---
        if (data.Moves && typeof data.Moves === "object") {
            const entries = Object.entries(data.Moves);
            if (entries.length > 0) {
                entries.sort(([, a], [, b]) => b - a);
                entry.topMoves = entries.slice(0, 10).map(([move]) => move);
            }
        }

        result[pokemon] = entry;
    }

    return result;
}
