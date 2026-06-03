import { useState, useEffect, useRef } from "react";
import { getSpanishName, translateCache } from "../utils/cobblemon";

/**
 * Hook que traduce al español habilidades, objetos y movimientos
 * de todo el equipo usando PokeAPI con caché global y lotes.
 */
export function useTeamTranslations(party) {
    const [, forceUpdate] = useState(0);
    const requestedRef = useRef({});

    useEffect(() => {
        if (!party || party.length === 0) return;

        const toRequest = [];

        for (const pk of party) {
            if (!pk) continue;

            // Habilidad
            const abilityName = pk.Ability?.AbilityName;
            if (abilityName && !requestedRef.current[`ability:${abilityName.toLowerCase()}`]) {
                requestedRef.current[`ability:${abilityName.toLowerCase()}`] = true;
                toRequest.push({ name: abilityName, category: "ability" });
            }

            // Objeto
            const itemId = pk.HeldItem?.id || "";
            const itemName = itemId.includes(":") ? itemId.split(":")[1] : itemId;
            if (itemName && !requestedRef.current[`item:${itemName.toLowerCase()}`]) {
                requestedRef.current[`item:${itemName.toLowerCase()}`] = true;
                toRequest.push({ name: itemName, category: "item" });
            }

            // Movimientos
            const moves = pk.MoveSet ? Object.values(pk.MoveSet) : [];
            for (const m of moves) {
                if (m.MoveName && !requestedRef.current[`move:${m.MoveName.toLowerCase()}`]) {
                    requestedRef.current[`move:${m.MoveName.toLowerCase()}`] = true;
                    toRequest.push({ name: m.MoveName, category: "move" });
                }
            }
        }

        // Solicitar traducciones
        let hasPending = false;
        for (const t of toRequest) {
            const result = getSpanishName(t.name, t.category);
            if (result === null) hasPending = true;
        }

        // Esperar a que las traducciones lleguen
        if (hasPending || toRequest.length > 0) {
            const checkInterval = setInterval(() => {
                // Verificar si ya tenemos todas las traducciones solicitadas
                let allTranslated = true;
                for (const t of toRequest) {
                    const key = `${t.category}:${t.name.toLowerCase()}`;
                    if (!translateCache[key]) {
                        allTranslated = false;
                        break;
                    }
                }
                if (allTranslated) {
                    clearInterval(checkInterval);
                    forceUpdate((n) => n + 1);
                }
            }, 100);

            // Timeout de seguridad (5 segundos)
            setTimeout(() => {
                clearInterval(checkInterval);
                forceUpdate((n) => n + 1);
            }, 5000);

            return () => clearInterval(checkInterval);
        }
    }, [party]);

    // También forzar actualización cuando translateCache cambie externamente
    useEffect(() => {
        const handler = () => forceUpdate((n) => n + 1);
        // Pequeño delay para permitir que se acumulen lotes
        const timer = setInterval(handler, 300);
        return () => clearInterval(timer);
    }, []);

    return translateCache;
}
