/**
 * getBestCompetitiveData
 *
 * Descarga y procesa el JSON de estadísticas competitivas de Smogon (OU,
 * 2024-05) y extrae, para cada Pokémon, la habilidad más usada, el objeto
 * más usado, la naturaleza más usada y los 4 movimientos más usados.
 *
 * @returns {Promise<Object.<string, {bestAbility: string, bestItem: string, topItems: Array<{name: string, count: number}>, bestNature: string, topMoves: string[]}>>}
 * @throws {Error} Si la descarga falla o la respuesta no es válida.
 */
export async function getBestCompetitiveData() {
    // En desarrollo, Vite proxy redirige /smogon-stats/* a https://www.smogon.com/stats/*
    // para evitar problemas de CORS. En producción se puede cambiar por un proxy CORS si es necesario.
    const url = "/smogon-stats/2024-05/chaos/gen9ou-0.json";

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
