import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface NicoJwtPayload {
    level2?: number;
    age?: string | number;
    [key: string]: unknown;
  }

function getJwtAlg(jwt: string): string | undefined {
    const parts = jwt.split(".");
    if (parts.length < 2) {
        throw new Error("Invalid JWT format");
    }

    const header = JSON.parse(Buffer.from(parts[0], "base64").toString("utf-8"));
    return header.alg;
}

export async function GET() {
    return NextResponse.json({
        message: `The baker says: 'I'd rather have you send me the cookie by post.'`
    });
}

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }
    
    const { nico_jwt } = body;
    
    if (!nico_jwt) {
        const extraParams = Object.keys(body).filter(key => key !== "nico_jwt");
        if (extraParams.length > 0) {
            return NextResponse.json({
                message: `The baker says: 'I don't know a recipe named '${extraParams[0]}'. Bring me the recipe named 'nico_jwt'.'`
            });
        }
        
        return NextResponse.json({
            message: "The baker says: 'You didn't bring any cookies! Come back when you have some.'"
        });
    }
    
    try {
        const decoded = jwtDecode<NicoJwtPayload>(nico_jwt);

        if (!decoded) throw new Error("Invalid JWT");

        if (!decoded.level2) {
            return NextResponse.json({  
                message: "The baker says: 'Your cookie seems a little bit undercooked.'"
            });
        }

        if (decoded.level2 > Date.now()) {
            return NextResponse.json({
                message: "The baker says: 'Hey! You can't bring me a cookie from the future!'"
            });
        }

        if (!decoded.age) {
            return NextResponse.json({
                message: "The baker says: 'This cookie smells really good! Unfortunately, I misplaced the algorithm to bake the best 'nico_jwt' cookies... I can't check right now on it, but my guts tell me you need to add a 'age' field to your 'nico_jwt' cookie.'"
            });
        } else {
            if (decoded.age == process.env.NICO_FLAG3_AGE && getJwtAlg(nico_jwt)?.toLowerCase() === "none") {
                return NextResponse.json({
                    message: "The baker says: 'This cookie is perfect! You can take it to the next level!'",
                    flag: process.env.NICO_FLAG3
                });
            } else {
                return new Response("Invalid JWT", { status: 400 });
            }
        }        
    } catch {
        return NextResponse.json({
            message: "The baker says: 'This cookie doesn't seem to follow the 'nico_jwt' recipe although you named it that way.'"
        });
    }
}