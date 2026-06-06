import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiChevronLeft, BiDiamond } from "react-icons/bi";
import { usePokemon } from "../hooks/usePokemon";
import PokemonImage from "../components/PokemonImage";
import PokemonTypeBadge from "../components/PokemonTypeBadge";
import PokemonClassBadge from "../components/PokemonClassBadge";
import PokemonStats from "../components/PokemonStats";
import PokemonWeaknesses from "../components/PokemonWeaknesses";
import PokemonAbilities from "../components/PokemonAbilities";
import PokemonMoves from "../components/PokemonMoves";
import PokemonEvolutions from "../components/PokemonEvolutions";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./PokemonPage.module.css";

export default function PokemonPage() {
    const { name } = useParams();
    const navigate = useNavigate();
    const { data: pokemon, isLoading, isError } = usePokemon(name);
    const [shiny, setShiny] = useState(false);
    const [animated, setAnimated] = useState(true);

    useEffect(() => {
        if (!pokemon?.cries?.latest) return;
        const audio = new Audio(pokemon.cries.latest);
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }, [pokemon]);

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message="Error cargando Pokémon" />;

    const hasShiny = !!pokemon.sprites.other["official-artwork"]?.front_shiny;

    // Sprite animado (Gen 5 sprites .gif)
    const animatedNormal = pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default;
    const animatedShiny = pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny;

    const artwork = animated && animatedNormal
        ? (shiny && animatedShiny ? animatedShiny : animatedNormal)
        : (shiny
            ? pokemon.sprites.other["official-artwork"].front_shiny
            : pokemon.sprites.other["official-artwork"].front_default);

    return (
        <div className={styles.wrapper}>
            <div className={styles.topBar}>
                <button className={styles.closeBtn} onClick={() => navigate("/")}>
                    <BiChevronLeft size={20} /> Volver
                </button>
            </div>

            <div className={styles.header}>
                <PokemonImage
                    className={styles.headerSprite}
                    src={artwork}
                    alt={pokemon.name}
                />

                <h1 className={styles.name}>
                    #{String(pokemon.id).padStart(3, "0")} {pokemon.nameEs}
                </h1>

                <div className={styles.toggleGroup}>
                    {hasShiny && (
                        <button
                            className={`${styles.toggleBtn} ${shiny ? styles.toggleActive : ""}`}
                            onClick={() => setShiny((s) => !s)}
                        >
                            <BiDiamond size={14} /> {shiny ? "Normal" : "Shiny"}
                        </button>
                    )}

                    {animatedNormal && (
                        <button
                            className={`${styles.toggleBtn} ${animated ? styles.toggleActive : ""}`}
                            onClick={() => setAnimated((a) => !a)}
                        >
                            {animated ? "Fijo" : "Animado"}
                        </button>
                    )}
                </div>

                <div className={styles.types}>
                    {pokemon.types.map((t) => (
                        <PokemonTypeBadge key={t.type.name} type={t.type.name} />
                    ))}
                </div>

                <div className={styles.classBadges}>
                    <PokemonClassBadge
                        classification={pokemon.classification}
                        generationName={pokemon.generationName}
                    />
                </div>

                {pokemon.descriptionEs && (
                    <p className={styles.description}>{pokemon.descriptionEs}</p>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.section}>
                    <PokemonEvolutions
                        evolutionChainUrl={pokemon.evolutionChainUrl}
                        currentId={pokemon.id}
                        varieties={pokemon.varieties}
                    />
                </div>

                <div className={styles.section}>
                    <h2>Estadísticas base</h2>
                    <PokemonStats stats={pokemon.stats} />
                </div>

                <div className={styles.section}>
                    <h2>Debilidades y resistencias</h2>
                    <PokemonWeaknesses types={pokemon.types} />
                </div>

                <div className={styles.section}>
                    <PokemonAbilities abilities={pokemon.abilities} />
                </div>

                <div className={styles.section}>
                    <PokemonMoves moves={pokemon.moves} />
                </div>

                <div className={styles.section}>
                    <h2>Información</h2>
                    <p><strong>Peso:</strong> {pokemon.weight / 10} kg</p>
                    <p><strong>Altura:</strong> {pokemon.height / 10} m</p>
                </div>
            </div>
        </div>
    );
}
