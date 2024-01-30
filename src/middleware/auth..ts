import { Request, Response, NextFunction } from 'express';
import httpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';
import asyncCatch from '../utils/asyncCatch';
import { userService } from '../services';
import { getPublicUserInfo } from '../services/user.service';

const authMiddleware = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      const user = await userService.getUser(req.session.userId);

      if (user) {
        req.user = getPublicUserInfo(user);
        return next();
      }
    }

    return next(
      new wwsError(
        httpStatusCode.UNAUTHORIZED,
        httpStatusCode.getStatusText(httpStatusCode.UNAUTHORIZED)
      )
    );
  }
);

export { authMiddleware };
