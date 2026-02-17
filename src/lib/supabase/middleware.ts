import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/nouvelle-reparation",
  "/reparations-en-cours",
  "/reparations-pretes",
  "/historique",
  "/statistiques",
  "/utilisateurs",
];

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let supabaseUrl = "";
  let supabaseKey = "";

  try {
    ({ supabaseUrl, supabaseKey } = getSupabaseEnv());
  } catch {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === "/" && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/login") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected(pathname) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}
