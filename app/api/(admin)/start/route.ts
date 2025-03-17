import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { username } = body;

    if (username.match(/\w{2,}/)) {
        const token = jwt.sign({ username, start: Date.now() }, process.env.JWT_SECRET) as string;
        return NextResponse.json({ token });
    } else {
        return new Response("Invalid username", { status: 400 });
    }
}