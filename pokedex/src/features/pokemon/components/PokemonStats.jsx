import styles from "./PokemonStats.module.css";

const STAT_COLORS = {
    hp: "#FF5959",
    attack: "#F5AC78",
    defense: "#FAE078",
    "special-attack": "#9DB7F5",
    "special-defense": "#A7DB8D",
    speed: "#FA92B2",
};

const STAT_ES = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At. Esp",
    "special-defense": "Def. Esp",
    speed: "Velocidad",
};

export default function PokemonStats({ stats }) {
    const total = stats.reduce((sum, s) => sum + s.base_stat, 0);

    return (
        <div className={styles.wrapper}>
            {stats.map((s) => {
                const color = STAT_COLORS[s.stat.name] || "#6390f0";
                const percent = Math.min((s.base_stat / 255) * 100, 100);
                return (
                    <div key={s.stat.name} className={styles.row}>
                        <span className={styles.label}>
                            {STAT_ES[s.stat.name] || s.stat.name}
                        </span>

                        <span className={styles.value}>{s.base_stat}</span>

                        <div className={styles.barWrapper}>
                            <div
                                className={styles.bar}
                                style={{ width: `${percent}%`, background: color }}
                            />
                        </div>
                    </div>
                );
            })}
            <div className={styles.totalRow}>
                <span className={styles.label}>Total</span>
                <span className={styles.value}>{total}</span>
                <div className={styles.barWrapper} />
            </div>
        </div>
    );
}
