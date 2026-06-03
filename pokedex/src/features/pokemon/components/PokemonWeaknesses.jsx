import { useTypeRelations } from "../hooks/useTypeRelations";
import PokemonTypeBadge from "./PokemonTypeBadge";
import styles from "./PokemonWeaknesses.module.css";

export default function PokemonWeaknesses({ types }) {
    const { weaknesses, resistances, immunities, isLoading, isError } = useTypeRelations(types);

    if (isLoading) return <p className={styles.loading}>Cargando tipos…</p>;
    if (isError) return <p className={styles.loading}>Error al cargar tipos</p>;

    return (
        <div className={styles.wrapper}>
            {weaknesses.length > 0 && (
                <div className={styles.group}>
                    <h3 className={styles.groupTitle}>Débil contra</h3>
                    <div className={styles.chips}>
                        {weaknesses.map((w) => (
                            <span key={w.type} className={styles.chip}>
                                <PokemonTypeBadge type={w.type} />
                                <span className={styles.multiplier}>x{w.multiplier}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {resistances.length > 0 && (
                <div className={styles.group}>
                    <h3 className={styles.groupTitle}>Resiste contra</h3>
                    <div className={styles.chips}>
                        {resistances.map((r) => (
                            <span key={r.type} className={styles.chip}>
                                <PokemonTypeBadge type={r.type} />
                                <span className={styles.multiplier}>x{r.multiplier}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {immunities.length > 0 && (
                <div className={styles.group}>
                    <h3 className={styles.groupTitle}>Inmune a</h3>
                    <div className={styles.chips}>
                        {immunities.map((type) => (
                            <PokemonTypeBadge key={type} type={type} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
