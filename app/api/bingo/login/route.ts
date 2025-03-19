import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { username, password } = body;

    const user = await prisma.users.findFirst({
        where: {
            username,
        },
    });

    if (user && bcrypt.compareSync(password, user.password)) {
        const uuid = uuidv4();

        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const token = jwt.sign({ username, uuid }, secret);

        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                currentUUID: uuid,
            }
        });
        return NextResponse.json({ token });
    } else {
        return new Response("Invalid credentials", { status: 401 });
    }
}