import { useQuery } from "@tanstack/react-query";

/**
 * Nombres especiales de Mega Piedras (cuando no siguen el patrón "{base}ite")
 */
const SPECIAL_MEGA_STONES = {
    alakazam: "alakazite",
    ampharos: "ampharosite",
    banette: "banettite",
    blastoise: "blastoisinite",
    charizard: "charizardite",
    gengar: "gengarite",
    glalie: "glalitite",
    gyarados: "gyaradosite",
    heracross: "heracronite",
    houndoom: "houndoominite",
    kangaskhan: "kangaskhanite",
    latias: "latiasite",
    latios: "latiosite",
    manectric: "manectite",
    mawile: "mawilite",
    medicham: "medichamite",
    metagross: "metagrossite",
    mewtwo: "mewtwonite",
    pinsir: "pinsirite",
    sableye: "sablenite",
    salamence: "salamencite",
    steelix: "steelixite",
};

/**
 * Deriva el nombre de la Mega Piedra a partir del nombre de la forma.
 * Ej: "charizard-mega-x" → "charizardite-x"
 */
function deriveMegaStoneName(formName) {
    const match = formName.match(/^(.+?)-mega(?:-(.+))?$/);
    if (!match) return null;

    const base = match[1];
    const variant = match[2];

    const stoneBase = SPECIAL_MEGA_STONES[base] || `${base}ite`;
    return variant ? `${stoneBase}-${variant}` : stoneBase;
}

/**
 * Traduce un nombre de objeto a español desde PokeAPI.
 */
async function fetchItemSpanishName(itemName) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/item/${itemName}`);
        if (!res.ok) return null;
        const data = await res.json();
        const spanish = data.names?.find((n) => n.language.name === "es");
        return spanish?.name || null;
    } catch {
        return null;
    }
}

/**
 * Determina el método de evolución/obtención para una forma alternativa.
 */
async function getEvolutionMethod(formName) {
    // --- Mega Evolución ---
    if (formName.includes("-mega")) {
        const stoneName = deriveMegaStoneName(formName);
        if (stoneName) {
            const stoneEs = await fetchItemSpanishName(stoneName);
            if (stoneEs) {
                return { type: "mega", label: stoneEs };
            }
        }
        return { type: "mega", label: "Mega Piedra" };
    }

    // --- Gigantamax ---
    if (formName.includes("-gmax")) {
        return { type: "gmax", label: "Factor Gigamax" };
    }

    // --- Formas regionales ---
    const regions = {
        alola: "Alola",
        galar: "Galar",
        hisui: "Hisui",
        paldea: "Paldea",
    };
    for (const [suffix, region] of Object.entries(regions)) {
        if (formName.endsWith(`-${suffix}`)) {
            return { type: "regional", label: `Atrapado en ${region}` };
        }
    }

    return null;
}

/**
 * Obtiene sprites y método de evolución para formas alternativas (megas, gmax, etc.)
 * fetcheando /pokemon/{name} para cada variedad y /item/{stone} para megas.
 */
async function fetchVarietiesSprites(varieties) {
    const results = await Promise.allSettled(
        varieties.map(async (v) => {
            const pokemonRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${v.name}`
            );
            if (!pokemonRes.ok)
                throw new Error(`Error fetching form ${v.name}`);
            const data = await pokemonRes.json();

            return {
                name: v.name,
                sprite:
                    data.sprites?.other?.["official-artwork"]
                        ?.front_default || null,
                evolutionMethod: await getEvolutionMethod(v.name),
            };
        })
    );

    return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((v) => v.sprite);
}

export function usePokemonVarieties(varieties) {
    const key = varieties
        .map((v) => v.name)
        .sort()
        .join(",");

    return useQuery({
        queryKey: ["pokemonVarieties", key],
        queryFn: () => fetchVarietiesSprites(varieties),
        enabled: varieties.length > 0,
        staleTime: 1000 * 60 * 10,
    });
}
