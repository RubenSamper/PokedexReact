import { useState, useEffect, useRef } from "react";

const CHUNK_SIZE = 25;

/**
 * Obtiene los nombres en español de los movimientos en background.
 * Arranca en cuanto se monta el componente de movimientos.
 * Cachea globalmente para no refetchear entre especies.
 * done=true solo cuando TODOS los movimientos se han procesado.
 */
const globalCache = {};

export function useMoveNames(moves) {
    const [state, setState] = useState(() => {
        const key = getCacheKey(moves);
        const cached = globalCache[key];
        if (cached && cached.done) {
            return {
                nameMap: cached.map,
                isLoading: false,
                done: true,
            };
        }
        return {
            nameMap: cached?.map || {},
            isLoading: moves.length > 0,
            done: false,
        };
    });
    const abortRef = useRef(false);

    useEffect(() => {
        if (!moves || moves.length === 0) return;

        const cacheKey = getCacheKey(moves);

        // Ya completo en caché
        if (globalCache[cacheKey]?.done) {
            setState({
                nameMap: globalCache[cacheKey].map,
                isLoading: false,
                done: true,
            });
            return;
        }

        const existing = globalCache[cacheKey]?.map || {};
        const movesToFetch = moves.filter(
            (m) => !existing[m.move.name]
        );

        if (movesToFetch.length === 0) {
            globalCache[cacheKey] = { map: existing, done: true };
            setState({ nameMap: existing, isLoading: false, done: true });
            return;
        }

        abortRef.current = false;

        let processedCount = 0;
        const totalToProcess = movesToFetch.length;
        const allEntries = { ...existing };

        async function fetchAll() {
            for (let i = 0; i < movesToFetch.length; i += CHUNK_SIZE) {
                if (abortRef.current) return;

                const chunk = movesToFetch.slice(i, i + CHUNK_SIZE);
                const results = await Promise.allSettled(
                    chunk.map(async (m) => {
                        const res = await fetch(m.move.url);
                        if (!res.ok)
                            throw new Error(
                                `Error fetching move ${m.move.name}`
                            );
                        const data = await res.json();
                        const nameEs =
                            data.names?.find(
                                (n) => n.language.name === "es"
                            )?.name || null;
                        return { key: m.move.name, nameEs };
                    })
                );

                if (abortRef.current) return;

                results.forEach((r) => {
                    processedCount++;
                    if (
                        r.status === "fulfilled" &&
                        r.value.nameEs
                    ) {
                        allEntries[r.value.key] = r.value.nameEs;
                    }
                });

                const processedAll =
                    processedCount >= totalToProcess;

                globalCache[cacheKey] = {
                    map: { ...allEntries },
                    done: processedAll,
                };

                setState({
                    nameMap: { ...allEntries },
                    isLoading: !processedAll,
                    done: processedAll,
                });

                if (processedAll) break;
            }
        }

        setState((prev) => ({
            ...prev,
            isLoading: true,
            done: false,
        }));
        fetchAll();

        return () => {
            abortRef.current = true;
        };
    }, [moves]);

    return state;
}

function getCacheKey(moves) {
    return moves
        .map((m) => m.move.name)
        .sort()
        .join(",");
}
