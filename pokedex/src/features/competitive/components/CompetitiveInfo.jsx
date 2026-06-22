import { memo, useState, useCallback } from "react";
import { useCompetitiveData } from "../hooks/useCompetitiveData";
import { useMoveTranslations } from "../hooks/useMoveTranslations";
import {
    itemSmogonToApi,
    itemSmogonToEs,
    getItemSpriteUrl,
    natureToEs,
} from "../utils/nameConverter";
import styles from "./CompetitiveInfo.module.css";

/**
 * CompetitiveInfo
 *
 * Muestra los datos competitivos del Pokémon indicado:
 * habilidad, objeto (con icono), naturaleza y movimientos (traducidos al español).
 *
 * @param {{ pokemonName: string }} props
 */
const CompetitiveInfo = memo(function CompetitiveInfo({ pokemonName }) {
    const { data: pokemon, isLoading, isError, error } =
        useCompetitiveData(pokemonName);

    // Traducción de movimientos
    const topMoves = pokemon?.topMoves || [];
    const { translations: moveTranslations, isLoading: movesLoading } =
        useMoveTranslations(topMoves);

    // Manejo de sprites rotos
    const [brokenItems, setBrokenItems] = useState({});
    const handleBrokenItem = useCallback((name) => {
        setBrokenItems((prev) => ({ ...prev, [name]: true }));
    }, []);

    // --- Estado: cargando ---
    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.loading}>
                    Cargando datos competitivos...
                </div>
            </div>
        );
    }

    // --- Estado: error de red/API ---
    if (isError) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.error}>
                    Error al cargar datos:{" "}
                    {error?.message ?? "Error desconocido"}
                </div>
            </div>
        );
    }

    // --- Estado: Pokémon no encontrado en ningún tier ---
    if (!pokemon) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.notFound}>
                    No se encontraron datos competitivos para{" "}
                    <strong>{pokemonName}</strong> en ningún tier disponible
                    (OU, UU, RU, NU, PU, ZU, Ubers, Doubles OU, LC,
                    National Dex — 2024-05).
                    <br />
                    <span className={styles.notFoundHint}>
                        Este Pokémon no tuvo suficiente uso en ninguno de estos
                        tiers ese mes.
                    </span>
                </div>
            </div>
        );
    }

    // --- Renderizar datos ---

    const itemApiName = pokemon.bestItem
        ? itemSmogonToApi(pokemon.bestItem)
        : null;
    const itemEsName = pokemon.bestItem
        ? itemSmogonToEs(pokemon.bestItem)
        : null;
    const itemSpriteUrl = itemApiName
        ? getItemSpriteUrl(itemApiName)
        : null;

    // Para la habilidad, intentar formatear el nombre
    const abilityDisplay = pokemon.bestAbility
        ? pokemon.bestAbility
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : null;

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>
                Datos competitivos — {pokemonName}
            </h3>
            <table className={styles.table}>
                <tbody>
                    {/* Habilidad */}
                    <tr className={styles.row}>
                        <th className={styles.label}>Habilidad</th>
                        <td className={styles.value}>
                            {abilityDisplay ?? "\u2014"}
                        </td>
                    </tr>

                    {/* Objeto con icono */}
                    <tr className={styles.row}>
                        <th className={styles.label}>Objeto</th>
                        <td className={styles.value}>
                            {itemSpriteUrl ? (
                                <span className={styles.itemDisplay}>
                                    {brokenItems[pokemon.bestItem] ? (
                                        <span className={styles.itemFallback}>
                                            {itemEsName?.charAt(0) || "?"}
                                        </span>
                                    ) : (
                                        <img
                                            className={styles.itemSprite}
                                            src={itemSpriteUrl}
                                            alt={itemEsName || itemApiName}
                                            loading="lazy"
                                            decoding="async"
                                            onError={() =>
                                                handleBrokenItem(
                                                    pokemon.bestItem
                                                )
                                            }
                                        />
                                    )}
                                    <span className={styles.itemName}>
                                        {itemEsName ?? itemApiName ?? "\u2014"}
                                    </span>
                                </span>
                            ) : (
                                itemEsName ??
                                (pokemon.bestItem
                                    ? pokemon.bestItem
                                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                                        .replace(/\b\w/g, (c) => c.toUpperCase())
                                    : "\u2014")
                            )}
                        </td>
                    </tr>

                    {/* Naturaleza */}
                    <tr className={styles.row}>
                        <th className={styles.label}>Naturaleza</th>
                        <td className={styles.value}>
                            {pokemon.bestNature
                                ? natureToEs(pokemon.bestNature)
                                : "\u2014"}
                        </td>
                    </tr>

                    {/* Movimientos */}
                    <tr className={styles.row}>
                        <th className={styles.label}>Movimientos</th>
                        <td className={styles.value}>
                            {topMoves.length > 0 ? (
                                <ul className={styles.moveList}>
                                    {topMoves.map((move) => {
                                        const esName =
                                            moveTranslations[move] || null;
                                        const displayName =
                                            esName ||
                                            move
                                                .replace(
                                                    /([a-z])([A-Z])/g,
                                                    "$1 $2"
                                                )
                                                .replace(/\b\w/g, (c) =>
                                                    c.toUpperCase()
                                                );
                                        return (
                                            <li
                                                key={move}
                                                className={styles.moveItem}
                                            >
                                                {movesLoading && !esName ? (
                                                    <span className={styles.moveLoading}>
                        {displayName}
                                                </span>
                                                ) : (
                                                    <>
                                                        <span className={styles.moveEs}>
                                                            {esName}
                                                        </span>
                                                        <span className={styles.moveEn}>
                                                            {move}
                                                        </span>
                                                    </>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                "\u2014"
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
            <p className={styles.source}>
                Basado en datos de uso real de{" "}
                <strong>{pokemon._tier || "OU (OverUsed)"} — Mayo 2024</strong>
                .&nbsp;
                {pokemon._tier && pokemon._tierId !== "ou" && (
                    <span className={styles.sourceHint}>
                        (no se encontraron datos en OU para este Pokémon)
                    </span>
                )}
                · Fuente:{" "}
                <a
                    href="https://www.smogon.com/dex/sv/pokemon/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Smogon Stats
                </a>
            </p>
        </div>
    );
});

export default CompetitiveInfo;
