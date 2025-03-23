const example = [
    {
      word: 'Cricétomiculture',
      description: "La cricétomiculture ou élevage du cricétome désigne l'élevage des cricétomes. L'espèce principalement élevée est le Cricétome des savanes (Cricetomys gambianus). La cricétomiculture a pour objet principal la production de viande à destination de l'alimentation humaine. Ce mini-élevage se pratique surtout en Afrique de l'Ouest et en Afrique centrale."
    },
    {
      word: 'Ángeles sin cielo',
      description: 'Ángeles sin cielo est un film hispano-italien réalisé par Sergio Corbucci et Carlos Arévalo, sorti en 1957.'
    },
    {
      word: 'Drone de surface naval',
      description: "Les drones de surface navals ou unmanned surface vehicles (USV, « véhicules de surface sans pilote » en anglais),  « autonomous surface vehicles » (ASV, « véhicules de surface autonome » en anglais), « uncrewed surface vessels » (USV, « navires de surface sans équipage » en anglais), ou familièrement navires-drone (« drone ships » en anglais), sont des bateaux ou des navires qui opèrent à la surface de l'eau sans équipage. Les USV fonctionnent avec différents niveaux d'autonomie, contrôlés à distance ou  autonomes."
    },
    {
      word: 'The Dirty Picture',
      description: "The Dirty Picture (द डर्टी पिक्चर) est un film indien de Bollywood réalisé par Milan Luthria en 2011, s'inspirant de la vie de Silk Smitha, une actrice du sud de l'Inde réputée pour sa sensualité et ses tenues suggestives. Le rôle principal est tenu par Vidya Balan entourée de Naseeruddin Shah, Tusshar Kapoor et Emraan Hashmi tandis que la musique est composée par Vishal-Shekhar sur des paroles de Rajat Aroraa.\n" +
        'Le film reçoit un bon accueil tant des critiques que du public et recueille de nombreux prix.'
    },
    {
      word: 'Tamar Khmiadachvili',
      description: "Tamar Khmiadachvili est une joueuse d'échecs soviétique puis géorgienne née le 27 novembre 1944 à Tbilissi et morte en 2019. Elle a le titre de grand maître international féminin depuis 1998."
    },
    {
      word: 'Stawek (Mikołajki)',
      description: 'Stawek est un village de Pologne, situé dans le gmina de Mikołajki, dans le powiat de Mrągowo, dans la voïvodie de Varmie-Mazurie.'
    },
    {
      word: 'Sošići',
      description: "Sošići (en italien : Sossi) est une localité de Croatie située en Istrie, dans la municipalité de Kanfanar, dans le comitat d'Istrie. En 2001, la localité comptait 57 habitants."
    },
    {
      word: 'Small (journal)',
      description: 'Small (abrégé en Small) est une revue scientifique à comité de lecture qui publie des articles dans le domaine des nanotechnologies.\n' +
        "D'après le Journal Citation Reports, le facteur d'impact de ce journal était de 15,153 en 2021. Actuellement, les directeurs de publication sont Chad Mirkin (université Northwestern, États-Unis), Harald Fuchs (université de Münster, Allemagne) et Toshio Yanagida (université d'Osaka, Japon)."
    },
    {
      word: "Statue du dieu A'a",
      description: "La statue du dieu A'a, en reo rurutu ti’i ’A’a, est une sculpture sur bois originaire de Rurutu dans l'archipel des Australes et représentant la divinité A'a. Elle est probablement réalisée entre 1591 et 1647, les premières mentions traçables de l'œuvre datant de 1821. C'est à cette époque que la sculpture est donnée aux missionnaires de la London Missionary Society (LMS) par des insulaires pour marquer leur conversion au christianisme. La statue est alors envoyée à Londres, où elle est exposée, d'abord au musée de la LMS, puis au British Museum. Depuis 2023, elle est prêtée et exposée au musée de Tahiti et des îles à Punaauia.\n" +
        "La statue est considérée comme une des plus belles sculptures polynésiennes à avoir traversé le temps. Parfois surnommée « la Joconde de la Polynésie », elle est reconnue dans les milieux universitaires pour sa singularité et la finesse de son exécution. Elle fut également admirée par nombre d'artistes à l'instar de Picasso ou Henry Moore, qui y trouvèrent une source d'inspiration pour leurs propres créations."
    },
    {
      word: 'Récepteur muscarinique',
      description: "Un récepteur muscarinique est un récepteur métabotrope qui lie l'acétylcholine libérée dans le milieu extracellulaire. Les récepteurs muscariniques présentent 5 sous-types : M1, M2, M3, M4 et M5. Cette liaison entraîne soit une inhibition de l'adénylate cyclase, ce qui diminue la concentration intracellulaire en AMP cyclique, soit une activation de la phospholipase C (PLC), provoquant une augmentation de la concentration intracellulaire de diacylglycérol (DAG) et d'inositol triphosphate (IP3). Ces deux seconds messagers activent ou inhibent plusieurs voies métaboliques, qui peuvent activer des canaux ioniques et influencer le potentiel de membrane. Dans les poumons, ce mécanisme sous le contrôle du système parasympathique provoque une bronchoconstriction qui peut être à l’origine de crise d’asthme.\n" +
        'Il tient son nom de son agoniste, la muscarine. Les récepteurs muscariniques ouvrent aussi les canaux potassiques.'
    },
    {
      word: 'Roga-Roga',
      description: 'Roga-Roga (de son vrai nom Ibambi Okombi Rogatien), né le 31 août 1974 à Fort Rousset (actuellement Owando), est un musicien congolais, leader du groupe Extra-Musica.\n' +
        "Roga-Roga commence sa carrière musicale, dans une chorale catholique et dans l'orchestre Cogiex Stars de Mava Tytan puis, il crée avec ses amis Espé Bass, Kila Mbongo, Guy-Guy Fall, Durell Loemba, Quentin Moyasko, Oxy-Oxygène, Ramatoulaye Ngolali, Régis Touba et Pinochet Thierry, le mythique orchestre Extra-Musica.\n" +
        "Après trois albums à succès, le groupe subit des départs de quelques membres de l'orchestre et scission oblige, ils vont se partager le nom Extra-Musica dont lui, ajoutera au sien Zangul tandis que les dissidents vont créer Extra-Musica International. Mais, avec plusieurs albums et des titres mémorables comme État-Major, Shalaï et Trop c'est trop, Roga-Roga finit par prendre le dessus sur les dissidents qui vont finir par s'éclater en plusieurs groupes et laissant la scène à Extra Musica Zangul qui va obtenir plusieurs distinctions continentales dont celle du meilleur groupe musical africain de la décennie aux KORAS.\n" +
        "En 2010, à l'occasion du cinquantenaire de l'indépendance de la république du Congo, il est décoré chevalier dans l'ordre du mérite congolais et devient ainsi, le premier de sa génération à recevoir une telle distinction."
    },
    {
      word: 'Sacrum',
      description: 'Le sacrum, chez les vertébrés terrestres, est un os du bassin, impair, médian et symétrique, formé de la soudure des vertèbres sacrées ou sacrales \n' +
        '\n'
    },
    {
      word: 'Organisme multicellulaire',
      description: "Un organisme multicellulaire (ou pluricellulaire) est un organisme vivant composé de plusieurs cellules, différenciées ou non, en contact. Les organismes qui peuvent être vus à l'œil nu sont habituellement multicellulaires, mais certains organismes unicellulaires, notamment des myxomycètes, sont également visibles sans utiliser de microscope.\n" +
        "Un groupe de cellules semblables qui assurent une fonction au sein d'un organisme multicellulaire est appelé tissu."
    },
    {
      word: 'Pierre-Luc Gagnon',
      description: 'Pierre-Luc Gagnon (né le 2 mai 1980 à Boucherville au Québec au Canada) est un skateur professionnel canadien.\n' +
        '\n'
    },
    {
      word: 'Mayotte',
      description: "Mayotte (en mahorais : Maoré), officiellement nommée département de Mayotte, est une collectivité territoriale unique d'outre-mer, regroupant les compétences d'une région et celles d'un département, dirigée par le conseil départemental de Mayotte.\n" +
        "Sur le plan géographique, Mayotte fait partie de l'archipel des Comores, dans le Nord du canal du Mozambique (océan Indien) et au nord-ouest de Madagascar,,,,. Mayotte est constituée de deux îles principales, Grande-Terre et Petite-Terre, et de plusieurs autres petites îles dont Mtsamboro, Mbouzi et Bandrélé. Son code départemental officiel est « 976 ».\n" +
        "Depuis août 2023, le chef-lieu du territoire est Mamoudzou, sur Grande-Terre, qui est aussi la ville la plus peuplée de Mayotte (c'était auparavant Dzaoudzi, situé en Petite-Terre),,. Le siège du conseil départemental et les services administratifs de la préfecture sont tous deux à Mamoudzou. Du fait de son statut de département et région d'outre-mer, Mayotte est également une région ultrapériphérique de l'Union européenne. Ses habitants sont appelés les Mahorais et les langues locales sont le mahorais (shimaoré) et le shibushi.\n" +
        "Le 25 avril 1841, sous le règne de Louis-Philippe Ier, le dernier sultan de Mayotte Andriantsoly, menacé par les royaumes voisins, vend son île au royaume de France en échange de sa protection. En 1848, l'île intègre la République française. En 1886, la France établit un protectorat sur le reste de l'archipel des Comores, composé de la Grande Comore, Mohéli et Anjouan qui se retrouvent placées sous la direction du gouverneur de Mayotte. Toutefois, à partir de 1958, l'administration du territoire quitte Mayotte pour Moroni (en Grande Comore), ce qui provoque le mécontentement des Mahorais, qui réclament la départementalisation.\n" +
        "Dans les années 1960 et 1970, Zéna M'Déré et le mouvement des chatouilleuses militent pour le rattachement définitif de Mayotte à la République française. En 1974, la France organise sur l'ensemble de l'archipel des Comores, une Consultation pour que les populations de l'archipel décident d'une éventuelle indépendance, mais les Mahorais ne votant qu'à 36,78 % pour l'indépendance, l’État français décide finalement de considérer le résultat île par île. Une seconde consultation est organisée par la France uniquement à Mayotte en 1976,, qui confirme largement ce choix de la population de demeurer française, au contraire des trois îles qui formeront la République des Comores. À la suite du référendum de 2009, Mayotte devient département et région d'outre-mer (DROM) à assemblée délibérante unique : le conseil départemental exerce également les compétences d'un conseil régional en 2011. En 2014, Mayotte change également de statut au niveau européen, devenant une région ultrapériphérique, et fait depuis partie de l'Union européenne. L'État Comorien revendique toujours la souveraineté sur Mayotte depuis son indépendance,.\n" +
        "Du fait de la forte immigration depuis les Comores voisines, Mayotte a au début des années 2020 la plus forte densité de population de la France d'outre-mer. Elle a aussi le plus fort taux de croissance démographique avec près de cinq enfants par femme en moyenne.\n" +
        'En 2022, le département comptait 310 000 habitants selon le dernier recensement, contre 256 518 habitants en 2017 et 212 645 en 2012, répartis sur 376 km2, soit une densité de plus de 800 habitants par km².\n' +
        "Ce jeune département, dont la population a quasiment augmenté de moitié en une décennie, doit faire face à des difficultés sociales de taille. Selon un rapport de l'INSEE publié en 2018, 77 % de la population vit sous le seuil de pauvreté national, comparé à 14 % pour la France métropolitaine.\n" +
        "La priorité pour la France est de transformer 40 % des résidences principales, aujourd'hui des cases en tôle, en maisons de bois ou de briques séchées et raccorder les 29 % de ménages mahorais qui n'ont pas l'eau courante. Améliorer toutes les infrastructures, ports et adductions d'eau. Et surtout aider TPE et PME pour aider les 66 % des 15–64 ans chercheurs d'emploi à en trouver un.\n" +
        "Seuls un tiers des actifs ont un emploi,. Le taux de pauvreté défini par ce même rapport est de 84 %. Le niveau de vie médian des habitants de Mayotte est sept fois plus faible qu'au niveau national selon l'Insee. En 2019, avec une croissance démographique de 3,8 %, la moitié de la population avait moins de 17 ans. En outre, en raison de l'arrivée massive des migrants en kwassa kwassa, petits bateaux des passeurs, en provenance des Comores,, chaque année, des centaines de personnes périssent en tentant de rallier les côtes de l'île, de manière illégale, en dépit du danger de la mer, qui est réputée pour être particulièrement périlleuse. De ce fait, plus de 50 % des résidents du département sont des Comoriens ou des étrangers,,."
    },
    {
      word: 'Lucas Höler',
      description: "Lucas Höler, né le 10 juillet 1994 à Achim en Allemagne, est un footballeur allemand qui joue au poste d'avant-centre au SC Fribourg."
    },
    {
      word: 'Lignes de bus Noctilien de N01 à N99',
      description: "Les lignes de bus Noctilien de N01 à N99 constituent une série de lignes que la RATP exploite la nuit à Paris et en petite couronne de l'agglomération parisienne, certaines lignes desservant également la grande couronne."
    },
    {
      word: 'La Renommée du Roi',
      description: "La Renommée du Roi ou La Renommée écrivant l'histoire du Roi de Domenico Guidi est un groupe en marbre se trouvant au bassin de Neptune dans les jardins du château de Versailles."
    },
    {
      word: 'Just Charlie',
      description: 'Just Charlie est un film dramatique britannique réalisé par Rebekah Fortune, sorti en 2017. Il s’agit de l’adaptation du court-métrage Something Blue des mêmes scénariste et réalisateur (2011).\n' +
        '\n'
    },
    {
      word: 'Joshua Franco',
      description: 'Joshua Franco est un boxeur américain né le 27 octobre 1995 à San Antonio, Texas.'
    },
    {
      word: 'Jonathan Danty',
      description: 'Jonathan Danty, né le 7 octobre 1992, est un joueur international français de rugby à XV jouant au poste de centre au Stade rochelais.\n' +
        "En club, il remporte notamment deux fois la Coupe d'Europe/Champions Cup avec le Stade rochelais en 2022 et 2023. Il est également champion de France en 2015 avec le Stade français Paris et vainqueur du Challenge européen en 2017 avec ce même club. \n" +
        'Sélectionné en équipe de France depuis 2016, il est titulaire lors du Grand Chelem dans le Tournoi des Six Nations 2022.'
    },
    {
      word: 'Helostoma temminkii',
      description: "Le Gourami embrasseur (Helostoma temminkii ou Helostoma temminckii) est un poisson d'eau douce originaire de l'Asie du Sud-Est : Thaïlande, Sumatra et Java. C'est le seul représentant de sa famille, Helostomatidae, et de son genre Helostoma. Le genre Helostoma est donc monospécifique.\n" +
        'Le mot Helostoma vient du grec ancien helo (verrue) et στόμα (stóma, bouche), en référence à la bouche du Gourami embrasseur.\n' +
        '\n'
    },
    {
      word: 'Fonds négocié en bourse',
      description: 'Un fonds négocié en bourse (FNB), appelé en anglais : Exchange-Traded Fund (ETF), est un fonds de placement qui regroupe un ensemble de valeurs mobilières (actions, obligations, matières premières, etc.) et dont les parts peuvent être achetées ou vendues en bourse comme des actions.\n' +
        'Ce type de fonds inclut notamment les fonds indiciels cotés, appelés au Canada fonds indiciels négociables en bourse (FINB). Cependant les fonds indiciels ne sont pas tous cotés en bourse et les FNB ne sont pas tous indiciels (il existe des FNB à rendement inverse, des FNB à effet de levier, et des FNB à effet de levier inversé).'
    },
    {
      word: 'École de recherche graphique',
      description: "L'École de recherche graphique, ou l'erg, est une école d’art et de design de Belgique, sise rue du Page 87 à Ixelles et fondée en 1972, par Thierry de Duve et Jean Guiraud. L’erg est une École supérieure des Arts (ESA) subventionnée par la Communauté française de Belgique et fait partie des instituts Saint-Luc de Bruxelles."
    },
    {
      word: 'Cavité du bassin osseux',
      description: 'La cavité du bassin osseux est la cavité anatomique délimitée par les os du bassin osseux. Elle est constituée de la partie inférieure de la cavité abdominale et de la cavité pelvienne. Elle constitue, avec la cavité abdominale, la cavité abdomino-pelvienne.'
    },
    {
      word: 'Corinth (Mississippi)',
      description: "La ville de Corinth est le siège du comté d'Alcorn, dans le Mississippi, aux États-Unis. Sa population était de 14 622 habitants en 2020."
    },
    {
      word: 'Conflit gelé',
      description: "Dans les relations internationales, un conflit gelé est une situation dans laquelle un conflit armé actif a pris fin, mais aucun traité de paix ou autre cadre politique ne résout le conflit à la satisfaction des combattants. Par conséquent, légalement, le conflit peut recommencer à tout moment, créant un environnement d'insécurité et d'instabilité.\n" +
        "Le terme a été couramment utilisé pour les conflits relatifs aux régions sécessionnistes des anciennes républiques socialistes soviétiques après la dislocation de l’URSS (Haut-Karabagh, Transnistrie, Abkhazie, etc.), mais il a également souvent été appliqué à d'autres conflits territoriaux pérennes. La situation de facto qui se dégage peut correspondre à la position de jure affirmée par une partie au conflit ; par exemple, la Russie revendique et contrôle efficacement la Crimée à la suite de la crise de 2014 en Crimée malgré les revendications persistantes de l'Ukraine dans la région. Alternativement, la situation de facto peut ne pas correspondre à la demande officielle de l'une ou l'autre partie. La division de la Corée est un exemple de cette dernière situation : tant la république de Corée que la république populaire démocratique de Corée revendiquent officiellement des droits sur l'ensemble de la péninsule ; cependant, il existe une frontière bien définie entre les zones de contrôle des deux pays.\n" +
        "Les conflits gelés aboutissent parfois à des États partiellement reconnus. Par exemple, la république d'Ossétie du Sud, un produit du conflit gelé entre la Géorgie et l'Ossétie, est reconnue par huit autres États, dont cinq membres des Nations unies; les trois autres de ces entités sont elles-mêmes des États partiellement reconnus."
    },
    {
      word: 'City 2',
      description: "City 2 est le deuxième centre commercial en Belgique quant à la surface. Il se situe au centre-ville de Bruxelles, dans l'ancien immeuble du grand magasin Au Bon Marché, le long de la rue Neuve et à proximité de la place Rogier et du boulevard du Jardin botanique.\n" +
        "Le centre commercial appartient au groupe Ageas. Il a été créé en 1980 par la SCC qui l'a géré jusqu'en 2003, date à laquelle le groupe Devimo a pris la relève, bénéficiant de la rénovation de 1999. Une centaine de magasins sont répartis sur quatre étages (le dernier étant attribué à la Fnac, Action et une école de boxe), pour une surface totale de 51 000 m².\n" +
        "Le bâtiment dispose d'un accès direct à la station Rogier des lignes 2 et 6 du métro de Bruxelles et d'un parking (payant) de 450 places.\n" +
        "Autrefois, le centre hébergeait huit salles de cinéma du groupe UGC accompagnées d'un Quick."
    },
    {
      word: 'Cintray',
      description: 'Cintray est un nom de lieu notamment porté  par :\n' +
        '\n' +
        "Cintray, commune française de l'Eure\n" +
        "Cintray, commune française d'Eure-et-Loir"
    },
    {
      word: 'Château de Perrien',
      description: 'Le château de Perrien est un édifice en ruines situé à Lanrodec, en France.'
    },
    {
      word: 'Charlotte Cortlandt Ellis',
      description: 'Charlotte Cortlandt Ellis (27 juin 1874 - 17 mars 1956) est une collectionneuse de plantes amateur américaine active au Nouveau-Mexique. Elle découvre plusieurs taxons de plantes et a collecté quelque 500 spécimens de plantes.'
    },
    {
      word: 'Bella calamidades',
      description: 'Bella calamidades est une telenovela américaine-colombienne diffusée entre le 24 mars 2010 et le 23 novembre 2010 sur Telemundo (États-Unis) et Caracol Televisión (Colombie).\n' +
        '\n'
    },
    {
      word: 'Banque commerciale du Congo',
      description: "La Banque commerciale du Congo (BCDC) est une des premières banques de la république démocratique du Congo. Fondée en 1909, sous le nom, à l'époque de Banque du Congo belge, elle traversa toutes les époques et troubles du pays pour rester, aujourd'hui, l'une des banques les plus importantes et actives de la  RDC. Sa clientèle englobe des particuliers, des petites et moyennes entreprises, des grandes sociétés ainsi que des organismes gouvernementaux. Hormis les services bancaires de base, la BCDC propose de nombreux autres services, tels que la banque électronique, Western Union, MasterCard."
    },
    {
      word: 'Asconoïde',
      description: "L’asconoïde est l'une des trois formes corporelles possible chez les éponges. L'expression « éponges de type Ascon » (en référence au genre biologique « modèle » Ascon) est aussi utilisée, mais il ne s'agit que d'un critère anatomique ne correspondant pas à une réalité taxinomique. Le plan asconoïde est caractérisé par des animaux sans forme corporelle définie. Une seule couche de choanocytes tapisse le spongocèle, dans lequel l'eau pénètre directement par les pores inhalants des porocytes. Ce type de plan ne se retrouve que chez les petites éponges, car il est peu efficace : la surface disponible couverte de choanocytes ne peut en effet satisfaire les besoins métaboliques (nutrition, échanges gazeux et excrétion) d'un grand volume de cellules."
    },
    {
      word: 'Ambassade de France au Liban',
      description: "L'ambassade de France au Liban est la représentation diplomatique de la République française auprès de la  République libanaise. Elle est située à Beyrouth, la capitale du pays, et son ambassadeur est, depuis 2023, Hervé Magro (d)."
    }
];

export default example;