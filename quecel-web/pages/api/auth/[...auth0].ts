import { handleAuth, handleCallback, Session } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";

const afterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<Session> => {
  console.log("session.user:", session.user);
  console.log("session:", session);
  return session;
};

export default handleAuth({
  async callback(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      await handleCallback(req, res, { afterCallback });
    } catch (error: any) {
      res.status(error.status || 500).end(error.message);
    }
  },
});
