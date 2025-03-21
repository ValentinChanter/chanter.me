export const CONFIG = {
    date: "20250317",
    linecount: 4453597,
    wordBlacklist: [
        /^liste_/i, // Liste de quelque chose
        /_\(homonymie\)$/i, // Homonymie
        /_par_ordre_alphabétique/i, // Liste par ordre alphabétique
        /^classement/i, // Classement

        // Événements des années 1XXX/2XXX car en trop grand nombre
        /(?:1|2)\d{3}$/, // Se termine par 1XXX ou 2XXX
        /^(?:1|2)\d{3}_/, // Commence par 1XXX ou 2XXX suivi d'un espace
        /saison_(?:1|2)\d{3}/i, // Saison 1XXX ou 2XXX
        /(?:1|2)\d{3}_en_/, // 1XXX ou 2XXX en
        /^tournoi/i, // Tournois en général
        /_de_(?:1|2)\d{3}_/, // Les coups d'état et autres événements " de 1XXX/2XXX "
    ],
    colors: [
        {
            name: "Rouge",
            hex: "#ba2f2f"
        },
        {
            name: "Orange",
            hex: "#cc7121"
        },
        {
            name: "Jaune",
            hex: "#d9cf1c"
        },
        {
            name: "Lime",
            hex: "#add91c"
        },
        {
            name: "Vert",
            hex: "#63c21f"
        },
        {
            name: "Cyan",
            hex: "#1fc2ba"
        },
        {
            name: "Bleu",
            hex: "#1f8cc2"
        },
        {
            name: "Indigo",
            hex: "#5d1fc2"
        },
        {
            name: "Violet",
            hex: "#7f1ea8"
        },
        {
            name: "Rose",
            hex: "#a11a78"
        }
    ]
};