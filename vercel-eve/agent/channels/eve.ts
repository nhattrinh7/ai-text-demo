import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";
import { getToken } from "next-auth/jwt";
import { CloudCog } from "lucide-react";

export default eveChannel({
  auth: [
    async (req: Request) => {
      // Use getToken directly to avoid importing next-auth main module which crashes in raw node
      const isSecure = process.env.NODE_ENV === "production" || req.url.startsWith("https://");
      const token = await getToken({
        req: req as any,
        secret: process.env.AUTH_SECRET,
        salt: isSecure ? "__Secure-authjs.session-token" : "authjs.session-token",
        secureCookie: isSecure,
      });

      if (token?.sub) {
        return {
          principalId: token.sub,
          principalType: "user",
          attributes: { providerId: token.sub },
          authenticator: "next-auth",
        };
      }
      return null;
    },
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
  ],
});
