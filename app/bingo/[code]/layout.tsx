export async function generateMetadata({ params }) {
  return {
    title: `Wikirace Bingo - Salon ${params.code} | chanter.me`,
    description: "Rejoignez ce salon de Wikirace Bingo pour affronter vos amis !"
  };
}

export default function BingoRoomLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (children);
}
