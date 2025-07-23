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

    if (pass !== process.env.NICO_FLAG4) {
        return new Response("Invalid password", { status: 400 });
    }
    
    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);
        if (decoded.level3 && decoded.level3 < Date.now()) {
            const newToken = jwt.sign({ ...decoded, level4: Date.now() }, secret);
            return NextResponse.json({ token: newToken, imageUrl: process.env.NICO_FLAG5_IMAGE });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch {
        return new Response("Invalid token", { status: 400 });
    }
}