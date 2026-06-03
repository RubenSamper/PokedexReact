import { usePlayers } from "../hooks/usePlayers";
import ShinyChart from "../components/ShinyChart";
import Loader from "../../pokemon/components/Loader";
import ErrorMessage from "../../pokemon/components/ErrorMessage";
import styles from "./TeamsPage.module.css";

export default function ShinyPage() {
    const { data: players = [], isLoading, isError } = usePlayers();

    if (isLoading) return <Loader />;
    if (isError)
        return (
            <ErrorMessage message="Error al conectar con el servidor de Cobblemon" />
        );

    const hasPlayers = players.length > 0;

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.pageTitle}>Pokémon shiny del servidor</h2>

            {!hasPlayers ? (
                <p className={styles.empty}>
                    No hay jugadores conectados en este momento.
                </p>
            ) : (
                <div className={styles.chartSection}>
                    <ShinyChart players={players} />
                </div>
            )}
        </div>
    );
}
