import { useState, useMemo } from "react";
import { BiCircle } from "react-icons/bi";
import { usePlayers } from "../hooks/usePlayers";
import { useTeamTranslations } from "../hooks/useTeamTranslations";
import TeamPokemonCard from "../components/TeamPokemonCard";
import TeamAnalysis from "../components/TeamAnalysis";
import Loader from "../../pokemon/components/Loader";
import ErrorMessage from "../../pokemon/components/ErrorMessage";
import styles from "./TeamsPage.module.css";

export default function TeamsPage() {
    const { data: players = [], isLoading, isError } = usePlayers();
    const [selectedPlayer, setSelectedPlayer] = useState(0);

    // Activar traducciones al español del equipo visible
    const currentPlayer = players[selectedPlayer];
    const party = useMemo(
        () => currentPlayer?.party || currentPlayer?.Party || [],
        [currentPlayer]
    );
    useTeamTranslations(party);

    if (isLoading) return <Loader />;
    if (isError)
        return (
            <ErrorMessage message="Error al conectar con el servidor de Cobblemon" />
        );

    if (players.length === 0) {
        return (
            <div className={styles.wrapper}>
                <h2 className={styles.pageTitle}>Equipos de Cobblemon</h2>
                <p className={styles.empty}>
                    No hay jugadores conectados en este momento.
                </p>
            </div>
        );
    }

    const activeParty = party.filter((pk) => pk != null);

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.pageTitle}>Equipos de Cobblemon</h2>

            {/* Pestañas de jugadores */}
            <div className={styles.playerTabs}>
                {players.map((p, i) => {
                    const playerName =
                        p.DisplayName ||
                        p.display_name ||
                        p.name ||
                        `Jugador ${i + 1}`;
                    const pParty = p.party || p.Party || [];
                    const activeCount = pParty.filter((pk) => pk != null).length;
                    return (
                        <button
                            key={p.uuid || i}
                            className={`${styles.playerTab} ${
                                selectedPlayer === i
                                    ? styles.playerTabActive
                                    : ""
                            }`}
                            onClick={() => setSelectedPlayer(i)}
                        >
                            <span className={styles.playerName}>
                                {playerName}
                            </span>
                            <span className={styles.playerCount}>
                                {activeCount}/6
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Equipo del jugador seleccionado */}
            {currentPlayer && (
                <div className={styles.teamContent}>
                    <div className={styles.teamGrid}>
                        {party.length === 0 ? (
                            <p className={styles.empty}>
                                Este jugador no tiene Pokémon en su equipo.
                            </p>
                        ) : (
                            party.map((pk, i) =>
                                pk ? (
                                    <TeamPokemonCard key={i} pokemon={pk} />
                                ) : (
                                    <div
                                        key={i}
                                        className={styles.emptySlot}
                                    >
                                        <span className={styles.emptySlotIcon}>
                                            <BiCircle size={20} />
                                        </span>
                                        <span className={styles.emptySlotLabel}>
                                            Vacío
                                        </span>
                                    </div>
                                )
                            )
                        )}
                    </div>

                    {activeParty.length > 0 && (
                        <TeamAnalysis party={party} />
                    )}
                </div>
            )}
        </div>
    );
}
