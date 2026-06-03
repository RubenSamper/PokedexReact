import { useState } from "react";
import { useAbilityInfo } from "../hooks/useAbilityInfo";
import styles from "./PokemonAbilities.module.css";

export default function PokemonAbilities({ abilities }) {
    const [open, setOpen] = useState(false);
    const abilityData = useAbilityInfo(abilities);

    const isHidden = (a) => a.is_hidden;

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.toggle}
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
                <span>Habilidad</span>
                <span className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}>
                    ▼
                </span>
            </button>

            {open && (
                <div className={styles.content}>
                    {abilityData.map((item, i) => {
                        const ab = abilities[i];
                        if (!ab) return null;
                        return (
                            <div key={ab.ability.name} className={styles.abilityRow}>
                                <div className={styles.abilityHeader}>
                                    <strong>
                                        {item.data?.name ?? "Cargando..."}
                                    </strong>
                                    {ab.is_hidden && (
                                        <span className={styles.hiddenBadge}>Oculta</span>
                                    )}
                                </div>
                                <p className={styles.description}>
                                    {item.isLoading
                                        ? "Cargando descripción…"
                                        : item.isError
                                            ? "Error al cargar"
                                            : item.data?.description ?? ""}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
