export {};

declare global {
  interface User {
    id: string;
  }

  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
