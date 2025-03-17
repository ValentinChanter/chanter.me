import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token } = body;

    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);
        if (decoded.start < Date.now()) {
            const newToken = jwt.sign({ ...decoded, level1: Date.now() }, secret);
            return NextResponse.json({ token: newToken });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch {
        return new Response("Invalid token", { status: 400 });
    }
}