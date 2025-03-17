import { NextRequest, NextResponse } from "next/server";
const jwt = require("jsonwebtoken");

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token } = body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { username: string, start: number, level1: number, level2?: number }; // TODO: Add all remaining levels here
        if (decoded.level1 < Date.now()) {
            // TODO:  Upload username, best level, and completion time (for each level?) to database
            return new Response("Successfully ended", { status: 200 });
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch (e) {
        return new Response("Invalid token", { status: 400 });
    }
}