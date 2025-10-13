import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { allowedMethods } from '@modelcontextprotocol/sdk/server/auth/middleware/allowedMethods.js';

export function metadataHandler<T>(resolver: (req: Request) => Promise<T>) {
  const router = express.Router();
  router.use(cors());
  router.use(allowedMethods(['GET']));
  const handleRequest = (req: Request, res: Response, next: NextFunction) => {
    resolver(req)
      .then((metadata) => res.status(200).json(metadata))
      .catch(next);
  };
  router.get('/', handleRequest);
  router.get('/*', handleRequest);
  return router;
}