import { NextRequest } from "next/server";

import * as jwt from "jsonwebtoken";

export async function extractCodeAndDecodedTokenFromBody(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    const { code } = body as { code: string | null };

    if (!code || !/^[A-Z0-9]{4}$/.test(code)) {
        return new Response("Missing or incorrect code", { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Authorization header missing or malformed", { status: 400 });
    }
    const token = authHeader.split(" ")[1];

    try {
        const secret = <jwt.Secret>process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload>jwt.verify(token, secret);

        if (!decoded.username || !decoded.id || !decoded.code || decoded.owner === undefined || !decoded.color) {
            return new Response("Invalid token", { status: 401 });
        }

        return { code, decoded };
    } catch {
        return new Response("Invalid token", { status: 401 });
    }
}