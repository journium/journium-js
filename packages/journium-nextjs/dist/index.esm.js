import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { JourniumProvider, useJournium } from '@journium/react';
export * from '@journium/react';
import { isNode } from '@journium/shared';

const RouteChangeTracker = ({ trackRouteChanges }) => {
    const router = useRouter();
    const { journium } = useJournium();
    useEffect(() => {
        if (!trackRouteChanges || !journium)
            return;
        const handleRouteChange = () => {
            journium.capturePageview();
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events, journium, trackRouteChanges]);
    return null;
};
const NextJourniumProvider = ({ children, config, autoCapture = false, trackRouteChanges = true, }) => {
    return (React.createElement(JourniumProvider, { config: config, autoCapture: autoCapture },
        React.createElement(RouteChangeTracker, { trackRouteChanges: trackRouteChanges }),
        children));
};

const isServerSide = () => {
    return isNode() && typeof window === 'undefined';
};
const getPagePropsForSSR = (context) => {
    var _a, _b;
    if ('req' in context && context.req) {
        const { req } = context;
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const url = `${protocol}://${host}${req.url}`;
        return {
            $current_url: url,
            $host: host,
            $pathname: ((_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || '',
            $search: ((_b = req.url) === null || _b === void 0 ? void 0 : _b.includes('?')) ? req.url.split('?')[1] : '',
            $referrer: req.headers.referer || '',
        };
    }
    return {};
};

export { NextJourniumProvider, getPagePropsForSSR, isServerSide };
//# sourceMappingURL=index.esm.js.map
