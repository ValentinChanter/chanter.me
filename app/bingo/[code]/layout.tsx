type Props = {
  params: Promise<{ code: string }>
};

export async function generateMetadata({ params }: Props) {
  const { code } = await params;

  const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BASE_URL : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/bingo/getRoomOwnerAndPlayerCount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code })
  })
  .then((res) => {
    if (res.ok) {
      return res.json();
    }
  });

  if (!res) {
    return {
      title: "Wikirace Bingo | chanter.me",
      description: "Créez ou rejoigner un salon pour jouer au Wikirace Bingo contre vos amis !"
    };
  }

  const { owner, playerCount } = res as { owner: string, playerCount: number };

  return {
    title: `Wikirace Bingo - Salon ${code} | chanter.me`,
    description: `Rejoignez ce salon maintenant pour affronter ${owner}${playerCount === 1 ? "" : ` et ${playerCount} autres personnes`} !`
  };
}

export default function BingoRoomLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (children);
}
