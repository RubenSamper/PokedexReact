import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiChevronLeft, BiDiamond } from "react-icons/bi";
import { usePokemon } from "../hooks/usePokemon";
import { usePokemonFormData } from "../hooks/usePokemonFormData";
import PokemonImage from "../components/PokemonImage";
import PokemonTypeBadge from "../components/PokemonTypeBadge";
import PokemonClassBadge from "../components/PokemonClassBadge";
import PokemonStats from "../components/PokemonStats";
import PokemonWeaknesses from "../components/PokemonWeaknesses";
import PokemonAbilities from "../components/PokemonAbilities";
import PokemonMoves from "../components/PokemonMoves";
import PokemonEvolutions from "../components/PokemonEvolutions";
import PokemonFormSwitcher from "../components/PokemonFormSwitcher";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./PokemonPage.module.css";

export default function PokemonPage() {
    const { name } = useParams();
    const navigate = useNavigate();
    const { data: pokemon, isLoading, isError } = usePokemon(name);
    const [shiny, setShiny] = useState(false);
    const [animated, setAnimated] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null);

    // Precargar datos de todas las formas alternativas
    const { formMap, isLoading: formsLoading } = usePokemonFormData(
        pokemon?.varieties || [],
        !!pokemon
    );

    // Resetear selectedForm al cambiar de Pokémon
    useEffect(() => {
        setSelectedForm(null);
        setShiny(false);
        setAnimated(true);
    }, [name]);

    useEffect(() => {
        if (!pokemon?.cries?.latest) return;
        const audio = new Audio(pokemon.cries.latest);
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }, [pokemon]);

    // NOTA: Todos los hooks deben ir ANTES de los early returns.
    // Este useMemo fusiona datos de la forma activa con los del Pokémon base.
    const isFormActive = selectedForm && selectedForm !== name;
    const formData = isFormActive && formMap ? formMap[selectedForm] : null;

    const displayPokemon = useMemo(() => {
        if (!pokemon) return null;
        if (!formData) return pokemon;

        return {
            ...pokemon,
            id: formData.id,
            name: formData.name,
            nameEs: formData.nameEs,
            sprites: formData.sprites,
            types: formData.types,
            stats: formData.stats,
            abilities: formData.abilities,
            weight: formData.weight,
            height: formData.height,
            moves: formData.moves?.slice(0, pokemon.moves?.length) || formData.moves,
            // Datos de la especie se mantienen del base
            descriptionEs: pokemon.descriptionEs,
            evolutionChainUrl: pokemon.evolutionChainUrl,
            varieties: pokemon.varieties,
            classification: pokemon.classification,
            generationName: pokemon.generationName,
        };
    }, [pokemon, formData]);

    if (isLoading || !displayPokemon) return <Loader />;
    if (isError) return <ErrorMessage message="Error cargando Pokémon" />;

    const hasShiny = !!displayPokemon.sprites.other["official-artwork"]?.front_shiny;

    // Sprite animado (Gen 5 sprites .gif)
    const animatedNormal = displayPokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default;
    const animatedShiny = displayPokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny;

    const artwork = animated && animatedNormal
        ? (shiny && animatedShiny ? animatedShiny : animatedNormal)
        : (shiny
            ? displayPokemon.sprites.other["official-artwork"].front_shiny
            : displayPokemon.sprites.other["official-artwork"].front_default);

    // Manejar selección de forma
    const handleFormSelect = (formName) => {
        if (formName === name) {
            // Seleccionó la forma base
            setSelectedForm(null);
        } else {
            setSelectedForm(formName);
        }
        setShiny(false);
        setAnimated(true);
    };

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
                    alt={displayPokemon.name}
                />

                <h1 className={styles.name}>
                    #{String(displayPokemon.id).padStart(3, "0")} {displayPokemon.nameEs}
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

                {/* Selector de formas alternativas */}
                <PokemonFormSwitcher
                    forms={Object.values(formMap)}
                    currentForm={selectedForm || name}
                    baseName={name}
                    baseSprite={displayPokemon.sprites.other["official-artwork"]?.front_default || displayPokemon.sprites.front_default}
                    onFormSelect={handleFormSelect}
                    loading={formsLoading}
                    totalVarieties={pokemon.varieties.length}
                />

                <div className={styles.types}>
                    {displayPokemon.types.map((t) => (
                        <PokemonTypeBadge key={t.type.name} type={t.type.name} />
                    ))}
                </div>

                <div className={styles.classBadges}>
                    <PokemonClassBadge
                        classification={displayPokemon.classification}
                        generationName={displayPokemon.generationName}
                    />
                </div>

                {displayPokemon.descriptionEs && (
                    <p className={styles.description}>{displayPokemon.descriptionEs}</p>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.section}>
                    <PokemonEvolutions
                        evolutionChainUrl={displayPokemon.evolutionChainUrl}
                        currentId={displayPokemon.id}
                    />
                </div>

                <div className={styles.section}>
                    <h2>Estadísticas base</h2>
                    <PokemonStats stats={displayPokemon.stats} />
                </div>

                <div className={styles.section}>
                    <h2>Debilidades y resistencias</h2>
                    <PokemonWeaknesses types={displayPokemon.types} />
                </div>

                <div className={styles.section}>
                    <PokemonAbilities abilities={displayPokemon.abilities} />
                </div>

                <div className={styles.section}>
                    <PokemonMoves moves={displayPokemon.moves} />
                </div>

                <div className={styles.section}>
                    <h2>Información</h2>
                    <p><strong>Peso:</strong> {displayPokemon.weight / 10} kg</p>
                    <p><strong>Altura:</strong> {displayPokemon.height / 10} m</p>
                </div>
            </div>
        </div>
    );
}
