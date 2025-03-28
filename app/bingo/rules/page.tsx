"use client";

import Header from "../header";

import Image from 'next/image'

function BingoRules() {
    return (
        <div className='flex flex-col h-screen'>
            <Header title="Accueil du Wikirace Bingo" link="/bingo" />
            <div className="flex flex-col py-12 px-36 gap-4 text-justify">
                <span className="text-3xl">But du jeu</span>
                <span>Le but du jeu du Wikirace Bingo est de partir d&apos;une page Wikipedia aléatoire (générée par le salon) et de récupérer le plus de cases possibles de la grille de Bingo.</span>
                <Image src="/bingoGame.png" width={1920} height={1080} alt="Capture d'écran d'un salon" className="rounded-lg outline-white/20 outline-1"></Image>

                <span className="text-3xl mt-10">Déroulement d&apos;une partie</span>
                <span>Le respect de ces règles n&apos;est pas forcé sur le joueur mais il est préférable de rester honnête et de les respecter pour que la partie soit plus juste pour tout le monde.</span>
                <span>Pour pouvoir récupérer une case de la grille, le joueur doit atteindre la page Wikipédia qui a pour titre celui affiché dans la case. Le joueur commence à la page Wikipédia affichée comme &quot;celle de départ&quot;. Une fois qu&apos;une page est atteinte et que la case est cochée, le joueur continue depuis cette même page pour essayer d&apos;atteindre une autre page.</span>
                <span>Un joueur ne peut pas récupérer une case si elle a déjà été récupérée par quelqu&apos;un d&apos;autre.</span>

                <span className="text-2xl mt-4">Navigation d&apos;une page Wikipédia</span>
                <span className="text-xl mt-2">Liens interdits</span>
                <span>Pour passer d&apos;une page à une autre, un joueur peut cliquer sur les liens hypertextes contenus dans le corps de la page sur laquelle il se trouve. C&apos;est-à-dire que la navigation est interdite au travers des liens contenus hors du corps, par exemple dans ces sections :</span>
                <ul className="ml-8 list-disc">
                    <li className="mb-4">
                        <span>L&apos;en-tête au-dessus de la page contenant généralement les pages &quot;(homonymie)&quot;. Ici, &quot;France (homonymie)&quot; par exemple</span>
                        <Image src="/forbidden1.png" width={800} height={179} alt="Exemple de page interdite 1" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>L&apos;infobox (encadré avec un condensé d&apos;informations et de liens) généralement à droite de la page. Ici, &quot;Hymne&quot; par exemple</span>
                        <Image src="/forbidden2.png" width={800} height={179} alt="Exemple de page interdite 2" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>La ligne &quot;Article(s) détaillé(s)&quot; aux alentours des titres de section. Ici, &quot;Nom de la France&quot; par exemple</span>
                        <Image src="/forbidden3.png" width={800} height={179} alt="Exemple de page interdite 3" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les légendes sous les infographies. Ici, &quot;Géologie de la France&quot; par exemple</span>
                        <Image src="/forbidden4.png" width={800} height={179} alt="Exemple de page interdite 4" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les titres et le contenu des tableaux au milieu du corps de l&apos;article. Ici, &quot;Aire d&apos;attraction&quot; par exemple</span>
                        <Image src="/forbidden5.png" width={800} height={179} alt="Exemple de page interdite 5" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>La ligne &quot;Article(s) connexe(s)&quot; aux alentours des titres de section. Ici, &quot;Liste des organisations internationales où siège la France&quot; par exemple</span>
                        <Image src="/forbidden6.png" width={800} height={179} alt="Exemple de page interdite 6" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les notes et références en fin de page. Ici, &quot;DROM&quot; par exemple</span>
                        <Image src="/forbidden7.png" width={800} height={179} alt="Exemple de page interdite 7" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les annexes (Bibliographie & Liens externes) en fin de page. Ici, &quot;Bibliographie sur la France&quot; par exemple</span>
                        <Image src="/forbidden8.png" width={800} height={179} alt="Exemple de page interdite 8" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les titres et le contenu de la navbox en fin de page. Ici, &quot;États souverains&quot; par exemple</span>
                        <Image src="/forbidden9.png" width={800} height={179} alt="Exemple de page interdite 9" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les portails en fin de page. Ici, &quot;Portail de la France&quot; par exemple</span>
                        <Image src="/forbidden10.png" width={800} height={179} alt="Exemple de page interdite 10" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Les catégories en fin de page. Ici &quot;France&quot; (redirigeant vers Catégorie:France) par exemple</span>
                        <Image src="/forbidden11.png" width={800} height={179} alt="Exemple de page interdite 11" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Le &quot;Voir aussi&quot; en fin de page. Ici &quot;Heudebert&quot; (dans la sous-section Articles connexes) par exemple</span>
                        <Image src="/forbidden12.png" width={800} height={179} alt="Exemple de page interdite 12" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                </ul>

                <span className="text-xl mt-2">Liens autorisés</span>
                <span>Les liens contenus dans les titres ou les légendes des sections de type &quot;Galerie&quot; (reconnaissables par l&apos;absence d&apos;une bordure, contrairement aux autres infographies) sont considérés comme étant dans le corps de l&apos;article. On trouve par exemple :</span>
                <ul className="ml-8 list-disc">
                    <li className="mb-4">
                        <span>Le lien contenu dans le titre de la galerie, par exemple &quot;cinéma français&quot;</span>
                        <Image src="/allowed1.png" width={800} height={179} alt="Exemple de page autorisée 1" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Le lien contenu dans la légende d&apos;une infographie de la galerie, par exemple &quot;Porte-avions Charles de Gaulle&quot;</span>
                        <Image src="/allowed2.png" width={800} height={179} alt="Exemple de page autorisée 2" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                    <li className="mb-4">
                        <span>Le lien contenu dans la légende de la seule infographie de la galerie, par exemple &quot;Paris-La Défense&quot;</span>
                        <Image src="/allowed3.png" width={800} height={179} alt="Exemple de page autorisée 3" className="rounded-lg outline-white/20 outline-1"></Image>
                    </li>
                </ul>
                <span className="text-xl mt-2">Navigation générale</span>
                <span>Un joueur est autorisé à naviguer plus rapidement en utilisant le &quot;Sommaire&quot; présent à tout instant à gauche de l&apos;écran, mais ne peut pas rechercher une chose en particulier sur la page actuelle (avec le raccourci Ctrl + F ou autrement) ou utiliser le retour arrière du navigateur s&apos;il s&apos;est trompé de lien ou si le lien sur lequel il a cliqué n&apos;est pas avantageux.</span>
            </div>
        </div>
    );
}

export default BingoRules;