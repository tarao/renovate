import {
  PLATFORM_TYPE_GITEA,
  PLATFORM_TYPE_GITHUB,
  PLATFORM_TYPE_GITLAB,
} from '../../constants/platforms';
import { logger } from '../../logger';
import { create } from './util';

export default create({
  options: {},
  handler: (options, next) => {
    if (options.auth || options.headers.authorization) {
      return next(options);
    }
    if (options.token) {
      logger.trace(
        { hostname: options.hostname },
        'Converting token to Bearer auth'
      );
      if (
        options.hostType === PLATFORM_TYPE_GITHUB ||
        options.hostType === PLATFORM_TYPE_GITEA
      ) {
        /* eslint-disable no-param-reassign */
        options.headers.authorization = `token ${options.token}`;
        if (options.token.startsWith('x-access-token:')) {
          options.headers.authorization = options.headers.authorization.replace(
            'x-access-token:',
            ''
          );
          options.headers.accept = options.headers.accept.replace(
            'application/vnd.github.v3+json',
            'application/vnd.github.machine-man-preview+json'
          );
        }
        /* eslint-enable no-param-reassign */
      } else if (options.hostType === PLATFORM_TYPE_GITLAB) {
        options.headers['Private-token'] = options.token; // eslint-disable-line no-param-reassign
      } else {
        options.headers.authorization = `Bearer ${options.token}`; // eslint-disable-line no-param-reassign
      }
      delete options.token; // eslint-disable-line no-param-reassign
    }
    return next(options);
  },
});
