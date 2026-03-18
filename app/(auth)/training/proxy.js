import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function proxy(request) {
    const session = await auth.api.getSession()

    console.log({ middleware: session })

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/trainings/:path*"],
}
