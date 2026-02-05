import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateData(schema: z.ZodObject<any, any>, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[source]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }));
        return res.status(400).json({ status: 'error', message: 'Données invalides', details: errorMessages });
      }
      return res.status(500).json({ status: 'error', message: 'Erreur interne du serveur' });
    }
  };
}