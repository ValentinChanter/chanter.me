import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token } = body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { username: string, start: number };
        if (decoded.start < Date.now()) {
            const newToken = jwt.sign({ ...decoded, level1: Date.now() }, process.env.JWT_SECRET) as string;
            return NextResponse.json({ token: newToken });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch (e) {
        return new Response("Invalid token", { status: 400 });
    }
}