import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token, pass } = body;

    if (pass !== process.env.LEVEL_2_PASS) {
        return new Response("Invalid password", { status: 400 });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { username: string, start: number, level1: number };
        if (decoded.level1 < Date.now()) {
            const newToken = jwt.sign({ ...decoded, level2: Date.now() }, process.env.JWT_SECRET) as string;
            return NextResponse.json({ token: newToken });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch (e) {
        return new Response("Invalid token", { status: 400 });
    }
}