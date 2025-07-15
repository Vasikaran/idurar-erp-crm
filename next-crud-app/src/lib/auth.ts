import { getServerSession, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./mongodb";
import { Admin } from "./models/admin";
import { AdminPassword } from "./models/adminPassword";
import bcrypt from "bcryptjs";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Basic Auth",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@demo.com" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "admin123",
        },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        const user = await Admin.findOne({
          email: email.toLowerCase(),
          removed: false,
        });
        if (!user || !user.enabled) return null;

        const dbPassword = await AdminPassword.findOne({
          user: user._id,
          removed: false,
        });
        if (!dbPassword) return null;

        const isValid = bcrypt.compareSync(
          dbPassword.salt + password,
          dbPassword.password
        );
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
