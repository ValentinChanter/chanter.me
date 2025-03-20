import BingoGame from '../BingoGame';

export default async function Code({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params

    return <BingoGame code={code} />;
}