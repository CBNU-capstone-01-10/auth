import { Request, Response, NextFunction } from 'express';
import { webServerLogger } from '../logger/winston';

const RequestLogger = (req: Request, res: Response, next: NextFunction) => {
  webServerLogger.log('info', `${req.method} ${req.ip}`);

  next();
};

export default RequestLogger;
