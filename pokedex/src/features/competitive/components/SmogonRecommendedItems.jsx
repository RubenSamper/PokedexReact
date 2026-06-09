import { memo, useState, useCallback } from "react";
import { useCompetitiveData } from "../hooks/useCompetitiveData";
import {
    itemSmogonToApi,
    itemSmogonToEs,
    getItemSpriteUrl,
} from "../utils/nameConverter";
import styles from "./SmogonRecommendedItems.module.css";

/**
 * SmogonRecommendedItems
 *
 * Muestra los objetos más usados en OU para el Pokémon indicado,
 * según las estadísticas de Smogon, con sprite y nombre en español.
 *
 * @param {{ pokemonName: string }} props
 */
const SmogonRecommendedItems = memo(function SmogonRecommendedItems({
    pokemonName,
}) {
    const { data: pokemon, isLoading, isError } =
        useCompetitiveData(pokemonName);

    const [brokenItems, setBrokenItems] = useState({});
    const [open, setOpen] = useState(false);

    const handleBroken = useCallback((name) => {
        setBrokenItems((prev) => ({ ...prev, [name]: true }));
    }, []);

    const topItems = pokemon?.topItems || [];

    if (isLoading || isError || topItems.length === 0) return null;

    // Calcular el total de usos para los porcentajes
    const totalCount = topItems.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.toggle}
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
                <span>
                    Objetos más usados{" "}
                    <span className={styles.badge}>{topItems.length}</span>
                </span>
                <span
                    className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
                >
                    ▼
                </span>
            </button>

            {open && (
                <div className={styles.content}>
                    <p className={styles.hint}>
                        Objetos más equipados en OU según estadísticas de Smogon
                        (mayo 2024).
                    </p>
                    {topItems.map((item, i) => {
                        const apiName = itemSmogonToApi(item.name);
                        const esName = itemSmogonToEs(item.name);
                        const spriteUrl = getItemSpriteUrl(apiName);
                        const pct =
                            totalCount > 0
                                ? ((item.count / totalCount) * 100).toFixed(1)
                                : 0;

                        return (
                            <div key={item.name} className={styles.itemRow}>
                                <span className={styles.position}>
                                    #{i + 1}
                                </span>

                                {brokenItems[item.name] ? (
                                    <span className={styles.itemFallback}>
                                        {esName?.charAt(0) ||
                                            apiName.charAt(0).toUpperCase()}
                                    </span>
                                ) : (
                                    <img
                                        className={styles.itemSprite}
                                        src={spriteUrl}
                                        alt={esName || apiName}
                                        loading="lazy"
                                        decoding="async"
                                        onError={() =>
                                            handleBroken(item.name)
                                        }
                                    />
                                )}

                                <span className={styles.itemName}>
                                    {esName || apiName}
                                </span>

                                <span className={styles.count}>
                                    {item.count.toLocaleString()} usos
                                </span>

                                <span className={styles.barWrapper}>
                                    <span
                                        className={styles.bar}
                                        style={{ width: `${pct}%` }}
                                    />
                                </span>
                            </div>
                        );
                    })}
                    <p className={styles.source}>
                        Basado en datos de uso real de OU (OverUsed) — Mayo 2024 ·{" "}
                        <a
                            href="https://www.smogon.com/dex/sv/pokemon/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Smogon Dex
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
});

export default SmogonRecommendedItems;
