import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wikirace Bingo | chanter.me",
  description: "Créez ou rejoignez un salon pour jouer au Wikirace Bingo contre vos amis !",
};

export default function BingoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (children);
}
