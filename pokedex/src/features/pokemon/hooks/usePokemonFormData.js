import { useQueries } from "@tanstack/react-query";

/**
 * Obtiene los datos completos de una forma alternativa desde PokeAPI.
 * Devuelve sprites, tipos, stats, habilidades, peso, altura y nombre.
 */
async function fetchFormData(formName) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formName}`);
    if (!res.ok) throw new Error(`Error fetching form ${formName}`);
    const data = await res.json();

    // Detectar el tipo de forma por el nombre
    const formType = detectFormType(formName);

    // Obtener nombre en español de la especie base (no de la forma)
    let nameEs = null;
    try {
        const speciesRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${data.species?.name || formName}/`
        );
        if (speciesRes.ok) {
            const species = await speciesRes.json();
            const spanish = species.names?.find((n) => n.language.name === "es");
            if (spanish) nameEs = spanish.name;
        }
    } catch {
        // Si falla, usamos el nombre en inglés
    }

    return {
        id: data.id,
        name: data.name,
        nameEs: nameEs || data.name.charAt(0).toUpperCase() + data.name.slice(1),
        sprites: data.sprites,
        types: data.types,
        stats: data.stats,
        abilities: data.abilities,
        weight: data.weight,
        height: data.height,
        cries: data.cries,
        moves: data.moves,
        formType,
        formLabel: getFormLabel(formName),
    };
}

/**
 * Detecta el tipo de forma alternativa basado en el nombre.
 */
function detectFormType(name) {
    if (name.includes("-mega")) return "mega";
    if (name.includes("-gmax")) return "gmax";
    const regionals = ["-alola", "-galar", "-hisui", "-paldea"];
    if (regionals.some((r) => name.endsWith(r))) return "regional";
    if (name.includes("-eternamax")) return "eternamax";
    if (name.includes("-primal")) return "primal";
    if (name.includes("-origin")) return "origin";
    if (name.includes("-therian")) return "therian";
    // Si no tiene sufijo, es la forma original (caso: ver Alola → mostrar Kantonio)
    if (!name.includes("-")) return "original";
    return "other";
}

/**
 * Genera una etiqueta legible para la forma.
 */
function getFormLabel(name) {
    const match = name.match(/-(.+)$/);
    if (!match) return "Original";
    const suffix = match[1];

    if (suffix === "gmax") return "Gigamax";
    if (suffix.startsWith("mega-")) {
        const variant = suffix.replace("mega-", "").toUpperCase();
        return `Mega ${variant}`;
    }
    if (suffix === "mega") return "Mega";
    if (suffix === "alola") return "Alola";
    if (suffix === "galar") return "Galar";
    if (suffix === "hisui") return "Hisui";
    if (suffix === "paldea") return "Paldea";
    if (suffix === "eternamax") return "Eternamax";
    if (suffix === "primal") return "Primal";
    if (suffix === "origin") return "Origen";
    if (suffix === "therian") return "Therian";

    return suffix
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

/**
 * Hook que precarga los datos de todas las formas alternativas de un Pokémon.
 * Usa useQueries para lanzar todas las peticiones en paralelo.
 *
 * @param {Array<{name: string}>} varieties - Lista de variedades (solo nombres)
 * @param {boolean} enabled - Si el hook debe ejecutarse
 * @returns {{ data: Array, isLoading: boolean, isError: boolean, formMap: Object }}
 */
export function usePokemonFormData(varieties, enabled = true) {
    // Filtramos variedades que no sean la default
    const formNames = (varieties || []).map((v) => v.name).filter(Boolean);

    const results = useQueries({
        queries: formNames.map((name) => ({
            queryKey: ["pokemonForm", name],
            queryFn: () => fetchFormData(name),
            staleTime: 1000 * 60 * 30, // 30 min de caché
            enabled: enabled && formNames.length > 0,
            retry: 1,
        })),
    });

    const data = results
        .filter((r) => r.data)
        .map((r) => r.data);

    const isLoading = results.some((r) => r.isLoading);
    const isError = results.some((r) => r.isError);

    // Mapa nombre -> datos para acceso rápido
    const formMap = {};
    data.forEach((form) => {
        formMap[form.name] = form;
    });

    return { data, isLoading, isError, formMap };
}
