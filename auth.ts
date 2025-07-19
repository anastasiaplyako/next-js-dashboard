import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import z from 'zod'
import postgres from "postgres";
import {User} from "@/app/lib/definitions";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string) {
    try {
        const users = await sql<User[]>`SELECT * FROM users WHERE email=${email}`
        console.log('users', users)
        return users[0]
    } catch (e) {
        console.error('Failed to fetch users:', e)
        throw new Error('Failed to fetch users')
    }

}
export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [Credentials({
        async authorize(credentials) {
            const parsedCredential = z
                .object({ email: z.string().email(), password: z.string().min(6) })
                .safeParse(credentials)

            console.log(parsedCredential)
            if (parsedCredential.success) {
                const user = await getUser(parsedCredential.data.email);
                console.log('user', user)
                if (!user) return null;

                console.log('user', user)
                const passwordMatched = await bcrypt.compare(parsedCredential.data.password, user.password)

                console.log('Password matched', passwordMatched)
                if (passwordMatched) return user;

                console.log('Invalid credentials')
                return null;
            }
        }
    })]
})
