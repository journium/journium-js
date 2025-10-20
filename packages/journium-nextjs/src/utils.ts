import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { isNode } from '@journium/shared';

export const isServerSide = (): boolean => {
  return isNode() && typeof window === 'undefined';
};

export const getPagePropsForSSR = (
  context: GetServerSidePropsContext | GetStaticPropsContext
) => {
  if ('req' in context && context.req) {
    const { req } = context;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const url = `${protocol}://${host}${req.url}`;
    
    return {
      $current_url: url,
      $host: host,
      $pathname: req.url?.split('?')[0] || '',
      $search: req.url?.includes('?') ? req.url.split('?')[1] : '',
      $referrer: req.headers.referer || '',
    };
  }
  
  return {};
};