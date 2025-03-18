import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { username } = body;

    if (username.match(/\w{2,}/)) {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const token = jwt.sign({ username, start: Date.now() }, secret);
        return NextResponse.json({ token });
    } else {
        return new Response("Invalid username", { status: 400 });
    }
}