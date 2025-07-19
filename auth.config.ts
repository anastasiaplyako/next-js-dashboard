import type { NextAuthConfig } from 'next-auth'
import {satisfies} from "next/dist/lib/semver-noop";

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [
        // ...add providers here
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl} }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                return isLoggedIn
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }

            return true;
        }
    }
} satisfies NextAuthConfig;
