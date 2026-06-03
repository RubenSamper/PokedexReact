import { useState } from "react";
import { useMoveInfo } from "../hooks/useMoveInfo";
import { useMoveNames } from "../hooks/useMoveNames";
import PokemonTypeBadge from "./PokemonTypeBadge";
import styles from "./PokemonMoves.module.css";

const CAT_ES = {
    physical: "Físico",
    special: "Especial",
    status: "Estado",
};

export default function PokemonMoves({ moves }) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState({});
    const [moveDetails, setMoveDetails] = useState({});
    const { fetchMove } = useMoveInfo();

    // Precarga en background desde que se monta el componente
    const { nameMap, isLoading: namesLoading, done } = useMoveNames(moves);

    const sortedMoves = [...moves].sort((a, b) =>
        a.move.name.localeCompare(b.move.name)
    );

    const handleToggleMove = async (url, name) => {
        if (expanded[name]) {
            setExpanded((prev) => ({ ...prev, [name]: false }));
            return;
        }

        setExpanded((prev) => ({ ...prev, [name]: true }));

        if (!moveDetails[name]) {
            setLoading((prev) => ({ ...prev, [name]: true }));
            try {
                const info = await fetchMove(url);
                setMoveDetails((prev) => ({ ...prev, [name]: info }));
            } catch {
                setMoveDetails((prev) => ({ ...prev, [name]: null }));
            } finally {
                setLoading((prev) => ({ ...prev, [name]: false }));
            }
        }
    };

    // Solo devuelve nombre en español
    const getDisplayName = (name) => {
        // Nombre del detalle expandido (ya traducido)
        const detail = moveDetails[name];
        if (detail?.name && detail.name !== name) return detail.name;
        // Nombre precargado en español
        const es = nameMap[name];
        if (es) return es;
        // Fallback: inglés formateado (solo si PokeAPI no tiene nombre ES)
        return name
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");
    };

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.toggle}
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
                <span>Movimientos ({moves.length})</span>
                <span
                    className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
                >
                    ▼
                </span>
            </button>

            {open && (
                <div className={styles.content}>
                    {!done ? (
                        <p className={styles.loadingNames}>
                            Cargando traducciones…
                        </p>
                    ) : (
                        sortedMoves.map((m) => {
                            const name = m.move.name;
                            const detail = moveDetails[name];
                            const isExpanded = expanded[name];
                            const isLoading = loading[name];

                            return (
                                <div key={name} className={styles.moveRow}>
                                    <button
                                        className={styles.moveToggle}
                                        onClick={() =>
                                            handleToggleMove(m.move.url, name)
                                        }
                                        type="button"
                                    >
                                        <span className={styles.moveName}>
                                            {getDisplayName(name)}
                                        </span>
                                        <span
                                            className={`${styles.arrow} ${
                                                isExpanded
                                                    ? styles.arrowOpen
                                                    : ""
                                            }`}
                                        >
                                            ▶
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div className={styles.moveDetail}>
                                            {isLoading ? (
                                                <p className={styles.loadingText}>
                                                    Cargando…
                                                </p>
                                            ) : detail ? (
                                                <>
                                                    <div
                                                        className={
                                                            styles.detailRow
                                                        }
                                                    >
                                                        <PokemonTypeBadge
                                                            type={detail.type}
                                                        />
                                                        <span
                                                            className={
                                                                styles.meta
                                                            }
                                                        >
                                                            Cat:{" "}
                                                            {CAT_ES[
                                                                detail.category
                                                            ] || detail.category}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.meta
                                                            }
                                                        >
                                                            Pot: {detail.power}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.meta
                                                            }
                                                        >
                                                            PP: {detail.pp}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.meta
                                                            }
                                                        >
                                                            Prec:{" "}
                                                            {detail.accuracy}%
                                                        </span>
                                                    </div>
                                                    <p
                                                        className={
                                                            styles.description
                                                        }
                                                    >
                                                        {detail.description}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className={styles.loadingText}>
                                                    Error al cargar
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
