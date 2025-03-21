import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }
    
    const { token, pass } = body;

    if (pass !== process.env.LEVEL_2_PASS) {
        return new Response("Invalid password", { status: 400 });
    }
    
    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);
        if (decoded.level1 && decoded.level1 < Date.now()) {
            const newToken = jwt.sign({ ...decoded, level2: Date.now() }, secret);
            return NextResponse.json({ token: newToken });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch {
        return new Response("Invalid token", { status: 400 });
    }
}