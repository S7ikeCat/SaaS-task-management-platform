import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { userService } from "@/entities/user/model/user.service";
import { registerSchema } from "@/shared/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await userService.findByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userService.create({
      name,
      email,
      passwordHash,
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}