import { useQuery } from "@tanstack/react-query";

const STANDARD_LIMIT = 1025;
const EXTENDED_LIMIT = 1500;

/**
 * Obtiene solo la lista de nombres e IDs de Pokémon (1 llamada API).
 * Por defecto devuelve los 1025 Pokémon estándar (National Dex).
 * Si includeForms=true, extiende el límite para incluir formas alternativas
 * (megas, gigamax, regionales, etc.).
 *
 * Ya NO obtiene detalles (sprites, types) — eso se hace bajo demanda en usePokemonBatch.
 */
async function fetchPokemonList(includeForms = false) {
    const limit = includeForms ? EXTENDED_LIMIT : STANDARD_LIMIT;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    if (!res.ok) throw new Error("Error fetching Pokémon list");
    const data = await res.json();

    return data.results.map((p) => {
        const id = parseInt(p.url.split("/").filter(Boolean).pop(), 10);
        // Marcar como forma alternativa si el ID está fuera del rango estándar
        // o si el nombre contiene un guion (ej: "charizard-mega-x")
        const isForm = id > STANDARD_LIMIT || (
            p.name.includes("-") &&
            !["ho-oh", "porygon-z", "jangmo-o", "hakamo-o", "kommo-o",
              "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini",
              "sirfetchd", "mr-rime", "mr-mime", "wo-chien",
              "chien-pao", "ting-lu", "chi-yu",
            ].includes(p.name)
        );
        return { id, name: p.name, isForm };
    });
}

export function usePokemonList(includeForms = false) {
    return useQuery({
        queryKey: ["pokemonList", includeForms ? "extended" : "standard"],
        queryFn: () => fetchPokemonList(includeForms),
        staleTime: 1000 * 60 * 5,
    });
}
