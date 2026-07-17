import {
  checkLoginRateLimit,
  getClientIp,
  setSessionCookie,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getUserByUsername } from "@/lib/properties";
import { loginSchema } from "@/shared/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkLoginRateLimit(ip);
    if (!rate.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados de login inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;
    const user = await getUserByUsername(username);

    if (!user?.password || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { success: false, error: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
