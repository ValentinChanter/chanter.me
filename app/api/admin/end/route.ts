import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }
    
    const { token } = body;

    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);
        if (decoded.level1 && decoded.level1 < Date.now()) {
            // TODO:  Upload username, best level, and completion time (for each level?) to database
            return new Response("Successfully ended", { status: 200 });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch {
        return new Response("Invalid token", { status: 400 });
    }
}