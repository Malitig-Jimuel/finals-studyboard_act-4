
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as groupService from "@/lib/services/groupService";
import { createGroupSchema } from "@/lib/validations";

export async function GET() {
  try {
    const groups = await groupService.getGroups();

    return NextResponse.json(groups);
  } catch (error) {
    console.error("GET /api/groups error:", error);

    return NextResponse.json(
      { error: "Failed to load groups. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create a group." },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Please submit valid JSON." },
        { status: 400 }
      );
    }

    const parsed = createGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid group details." },
        { status: 400 }
      );
    }

    const newGroup = await groupService.createGroup(
      parsed.data,
      session.user.id
    );

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error("POST /api/groups error:", error);

    return NextResponse.json(
      { error: "Failed to create group. Please try again." },
      { status: 500 }
    );
  }
}
