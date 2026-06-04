import { useQuery } from "@tanstack/react-query";

// ── Helper: fetch con timeout ──────────────────────────────────────────────

/**
 * Wrapper sobre fetch que añade un timeout mediante AbortController.
 * Si la petición supera los `ms` milisegundos, se aborta y la promesa
 * rechaza con un error DOMException (nombre "AbortError").
 *
 * @param {string} url
 * @param {number} [ms=15000]  Tiempo máximo de espera en ms.
 * @param {RequestInit} [options]  Opciones adicionales para fetch.
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, ms = 15000, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(timer);
    }
}

// ── Especies ───────────────────────────────────────────────────────────────

/** Obtener lista completa de especies (id + nombre) */
async function fetchAllSpecies() {
    const res = await fetchWithTimeout(
        "https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0",
        15000
    );
    if (!res.ok) throw new Error("Error al obtener especies");
    const data = await res.json();
    return data.results.map((r, i) => ({
        id: i + 1,
        name: r.name,
        nameEs: r.name.charAt(0).toUpperCase() + r.name.slice(1),
    }));
}

export function useAllSpecies() {
    return useQuery({
        queryKey: ["allSpecies"],
        queryFn: fetchAllSpecies,
        staleTime: 1000 * 60 * 60,
        retry: 2,
        retryDelay: 1000,
    });
}

// ── Detalles de Pokémon ────────────────────────────────────────────────────

/** Obtener detalles de un Pokémon: tipos, habilidades, movimientos */
async function fetchPokemonDetails(name) {
    const res = await fetchWithTimeout(
        `https://pokeapi.co/api/v2/pokemon/${name}`,
        10000
    );
    if (!res.ok) throw new Error(`Error al obtener ${name}`);
    const data = await res.json();

    // Tipos
    const types = data.types.map((t) => t.type.name);

    // Habilidades — obtener nombre español (máximo 2-3, se lanzan en paralelo)
    const abilityPromises = data.abilities.map(async (a) => {
        const abRes = await fetchWithTimeout(a.ability.url, 10000);
        if (!abRes.ok) throw new Error(`Error al obtener habilidad ${a.ability.name}`);
        const abData = await abRes.json();
        const nameEs =
            abData.names?.find((n) => n.language.name === "es")?.name ||
            a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1);
        return {
            name: a.ability.name,
            nameEs,
            isHidden: a.is_hidden || false,
            slot: a.slot,
        };
    });

    const fetchedAbilities = (await Promise.all(abilityPromises))
        .sort((a, b) => a.slot - b.slot);

    // Movimientos
    const allMoves = data.moves.map((m) => m.move.name);

    // Sprite
    const sprite =
        data.sprites?.front_default ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`;

    return {
        id: data.id,
        name: data.name,
        types,
        abilities: fetchedAbilities,
        moves: allMoves,
        stats: data.stats.map((s) => ({
            name: s.stat.name,
            base: s.base_stat,
        })),
        sprite,
    };
}

export function usePokemonDetails(name) {
    return useQuery({
        queryKey: ["pokemonDetails", name],
        queryFn: () => fetchPokemonDetails(name),
        enabled: !!name,
        staleTime: 1000 * 60 * 30,
        retry: 2,
        retryDelay: 1000,
    });
}

// ── Movimientos ────────────────────────────────────────────────────────────

/** Obtener detalles de un movimiento (tipo, poder, etc.) en español */
async function fetchMoveDetails(name) {
    const res = await fetchWithTimeout(`https://pokeapi.co/api/v2/move/${name}`, 10000);
    if (!res.ok) throw new Error(`Error al obtener move ${name}`);
    const data = await res.json();

    const nameEs =
        data.names?.find((n) => n.language.name === "es")?.name ||
        name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

    return {
        name: data.name,
        nameEs,
        type: data.type?.name || "normal",
        power: data.power,
        accuracy: data.accuracy,
        pp: data.pp,
        category: data.damage_class?.name || "status",
    };
}

export function useMoveDetails(name) {
    return useQuery({
        queryKey: ["moveDetails", name],
        queryFn: () => fetchMoveDetails(name),
        enabled: !!name,
        staleTime: 1000 * 60 * 30,
        retry: 2,
        retryDelay: 1000,
    });
}
