import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { extractCodeAndDecodedTokenFromBody } from "../../_shared/extractCodeAndDecodedTokenFromBody";
import createGrid from "../../_shared/createGrid";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const extracted = await extractCodeAndDecodedTokenFromBody(req);
    if (extracted instanceof Response) return extracted;
    const { code, decoded } = extracted;

    if (code === decoded.code && decoded.owner) {
        const res = await createGrid();
        if (res instanceof Response) return res;
        const { grid, startWord } = res;

        await prisma.bingoGrids.update({
            where: { code },
            data: {
                grid,
                startWord,
            }
        });

        return NextResponse.json({ grid, startWord });
    } else {
        return new Response("Invalid code", { status: 400 });
    }
}