import { getServerSession, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        console.log(credentials, "credentials");
        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "J Smith", email: "jsmith@example.com" };

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
