import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import asyncCatch from '../utils/asyncCatch';
import { isValidURL } from '../lib/url';
import { userService } from '../services';

export const renderSignin = asyncCatch((req: Request, res: Response) => {
  const redirectURL = req.query.redirect_uri;

  res.cookie('redirect_uri', redirectURL);

  return res.render('signin');
});

export const signin = asyncCatch(async (req: Request, res: Response) => {
  const user = await userService.signinUser(req.body);

  //generate JWT with user profile
  const accessToken = jwt.sign(
    user as object,
    process.env.TOKEN_USER_SECRET as string,
    {
      algorithm: 'HS512',
    }
  );

  if (
    isValidURL(req.cookies.redirect_uri, ['http', 'https', 'wwsp', 'wwsp-dev'])
  ) {
    const redirectURL = new URL(req.cookies.redirect_uri);

    res.clearCookie('redirect_uri');

    redirectURL.searchParams.append('jwt', accessToken);

    return res.redirect(redirectURL.toString());
  } else {
    res.cookie('seungho.hub.token', accessToken);
    return res.redirect('/');
  }
});

export const renderSignup = asyncCatch((req: Request, res: Response) => {
  return res.render('signup');
});

export const signup = asyncCatch(async (req: Request, res: Response) => {
  await userService.createUser(req.body);

  return res.render('signup-success');
});

export const verify = asyncCatch(async (req: Request, res: Response) => {
  const { user_id, token } = req.query;

  await userService.verifyUser(parseInt(user_id as string), token as string);

  return res.render('verification-success');
});
