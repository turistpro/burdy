import { getManager } from 'typeorm';
import UnauthorizedError from '@server/errors/unauthorized-error';
import express from 'express';
import ForbiddenError from '@server/errors/forbidden-error';
import AccessToken from '@server/models/access-token';
import SiteSettings from '@server/models/site-settings.model';

type IContentMiddlewareOptions = {
  alwaysAuthorize?: boolean;
}

const contentMiddleware =
  (options?: IContentMiddlewareOptions) =>
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const entityManager = getManager();
        const verifyToken = async () => {
          const accessToken = await entityManager.getRepository(AccessToken).findOne({
            where: {
              token
            }
          });
          if (!accessToken) throw new Error();
        };
        const token = req?.headers?.token;
        if (options?.alwaysAuthorize) await verifyToken();
        const apiSecurity = await entityManager.getRepository(SiteSettings).findOne({
          where: {
            key: 'apiSecurity'
          }
        });
        if (apiSecurity?.value === 'private') await verifyToken();
        return next();
      } catch (error) {
        if (error instanceof ForbiddenError) {
          return next(error);
        }
        return next(new UnauthorizedError('unauthorized'));
      }
    };

export default contentMiddleware;
