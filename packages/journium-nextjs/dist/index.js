'use strict';

var React = require('react');
var router = require('next/router');
var react = require('@journium/react');
var shared = require('@journium/shared');

const RouteChangeTracker = ({ trackRouteChanges }) => {
    const router$1 = router.useRouter();
    const { journium } = react.useJournium();
    React.useEffect(() => {
        if (!trackRouteChanges || !journium)
            return;
        const handleRouteChange = () => {
            journium.capturePageview();
        };
        router$1.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router$1.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router$1.events, journium, trackRouteChanges]);
    return null;
};
const NextJourniumProvider = ({ children, config, autoCapture = false, trackRouteChanges = true, }) => {
    return (React.createElement(react.JourniumProvider, { config: config, autoCapture: autoCapture },
        React.createElement(RouteChangeTracker, { trackRouteChanges: trackRouteChanges }),
        children));
};

const isServerSide = () => {
    return shared.isNode() && typeof window === 'undefined';
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

exports.NextJourniumProvider = NextJourniumProvider;
exports.getPagePropsForSSR = getPagePropsForSSR;
exports.isServerSide = isServerSide;
Object.keys(react).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () { return react[k]; }
    });
});
//# sourceMappingURL=index.js.map
