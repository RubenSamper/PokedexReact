import { useState, useEffect, useRef } from "react";
import { moveSmogonToApi, getMoveApiUrl } from "../utils/nameConverter";

/**
 * useMoveTranslations
 *
 * Obtiene los nombres en español de una lista de movimientos (en formato
 * Smogon) desde PokeAPI. Los resultados se cachean globalmente para evitar
 * llamadas repetidas.
 *
 * @param {string[]} smogonMoveNames - Array de nombres Smogon (ej. ["earthquake", "swordsdance"])
 * @returns {{ translations: Record<string,string>, isLoading: boolean }}
 *
 * @example
 * const { translations, isLoading } = useMoveTranslations(["earthquake", "swordsdance"]);
 * // translations => { earthquake: "Terremoto", swordsdance: "Danza Espada" }
 */

const globalCache = {};

export function useMoveTranslations(smogonMoveNames) {
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const abortRef = useRef(false);

    useEffect(() => {
        if (!smogonMoveNames || smogonMoveNames.length === 0) return;

        const names = [...new Set(smogonMoveNames)]; // deduplicar
        const toFetch = names.filter((n) => !globalCache[n]);

        // Si todo está cacheado, devolver inmediato
        if (toFetch.length === 0) {
            const all = {};
            names.forEach((n) => {
                all[n] = globalCache[n];
            });
            setTranslations(all);
            setIsLoading(false);
            return;
        }

        // Cargar los que ya tenemos en caché
        const initial = {};
        names.forEach((n) => {
            if (globalCache[n]) initial[n] = globalCache[n];
        });
        setTranslations(initial);
        setIsLoading(true);
        abortRef.current = false;

        async function fetchAll() {
            for (let i = 0; i < toFetch.length; i++) {
                if (abortRef.current) break;

                const smogonName = toFetch[i];
                const apiName = moveSmogonToApi(smogonName);

                try {
                    const res = await fetch(getMoveApiUrl(apiName));
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const data = await res.json();
                    const nameEs =
                        data.names?.find((n) => n.language.name === "es")?.name
                        || apiName
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ");

                    globalCache[smogonName] = nameEs;

                    setTranslations((prev) => ({
                        ...prev,
                        [smogonName]: nameEs,
                    }));
                } catch {
                    // Fallback: formatear el nombre PokeAPI como título
                    const fallback = apiName
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");
                    globalCache[smogonName] = fallback;
                    setTranslations((prev) => ({
                        ...prev,
                        [smogonName]: fallback,
                    }));
                }
            }

            setIsLoading(false);
        }

        fetchAll();

        return () => {
            abortRef.current = true;
        };
    }, [smogonMoveNames]);

    return { translations, isLoading };
}
