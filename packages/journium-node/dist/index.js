'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var shared = require('@journium/shared');
var fetch = require('node-fetch');

class JourniumNodeClient {
    constructor(config) {
        this.queue = [];
        this.flushTimer = null;
        this.initialized = false;
        // Preserve apiHost and applicationKey, set minimal defaults for others
        this.config = {
            apiHost: 'https://api.journium.io',
            ...config,
        };
        // Initialize asynchronously to fetch remote config
        this.initialize();
    }
    async initialize() {
        var _a, _b, _c, _d, _e, _f;
        try {
            if (this.config.applicationKey) {
                if (this.config.debug) {
                    console.log('Journium: Fetching remote configuration...');
                }
                const remoteConfigResponse = await shared.fetchRemoteConfig(this.config.apiHost, this.config.applicationKey, this.config.configEndpoint, fetch);
                if (remoteConfigResponse && remoteConfigResponse.success) {
                    // Preserve apiHost and applicationKey, merge everything else from remote
                    const localOnlyConfig = {
                        apiHost: this.config.apiHost,
                        applicationKey: this.config.applicationKey,
                        configEndpoint: this.config.configEndpoint,
                    };
                    this.config = {
                        ...localOnlyConfig,
                        ...remoteConfigResponse.config,
                    };
                    if (this.config.debug) {
                        console.log('Journium: Remote configuration applied:', remoteConfigResponse.config);
                    }
                }
                else {
                    // Fallback to minimal defaults if remote config fails
                    this.config = {
                        ...this.config,
                        debug: (_a = this.config.debug) !== null && _a !== void 0 ? _a : false,
                        flushAt: (_b = this.config.flushAt) !== null && _b !== void 0 ? _b : 20,
                        flushInterval: (_c = this.config.flushInterval) !== null && _c !== void 0 ? _c : 10000,
                    };
                }
            }
            this.initialized = true;
            // Start flush timer after configuration is finalized
            if (this.config.flushInterval && this.config.flushInterval > 0) {
                this.startFlushTimer();
            }
            if (this.config.debug) {
                console.log('Journium: Node client initialized with config:', this.config);
            }
        }
        catch (error) {
            console.warn('Journium: Failed to fetch remote config, using local config:', error);
            // Fallback to defaults
            this.config = {
                ...this.config,
                debug: (_d = this.config.debug) !== null && _d !== void 0 ? _d : false,
                flushAt: (_e = this.config.flushAt) !== null && _e !== void 0 ? _e : 20,
                flushInterval: (_f = this.config.flushInterval) !== null && _f !== void 0 ? _f : 10000,
            };
            this.initialized = true;
            // Start with local config
            if (this.config.flushInterval && this.config.flushInterval > 0) {
                this.startFlushTimer();
            }
        }
    }
    startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(() => {
            this.flush().catch(error => {
                if (this.config.debug) {
                    console.error('Journium: Auto-flush failed', error);
                }
            });
        }, this.config.flushInterval);
    }
    async sendEvents(events) {
        if (!events.length)
            return;
        try {
            const response = await fetch(`${this.config.apiHost}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.applicationKey}`,
                },
                body: JSON.stringify({
                    events,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            if (this.config.debug) {
                console.log('Journium: Successfully sent events', events);
            }
        }
        catch (error) {
            if (this.config.debug) {
                console.error('Journium: Failed to send events', error);
            }
            throw error;
        }
    }
    track(event, properties = {}, distinctId) {
        const journiumEvent = {
            uuid: shared.generateUuidv7(),
            ingestion_key: this.config.applicationKey,
            client_timestamp: shared.getCurrentTimestamp(),
            event,
            properties,
            distinct_id: distinctId || shared.generateId(),
        };
        this.queue.push(journiumEvent);
        if (this.config.debug) {
            console.log('Journium: Event tracked', journiumEvent);
        }
        if (this.queue.length >= this.config.flushAt) {
            this.flush().catch(error => {
                if (this.config.debug) {
                    console.error('Journium: Auto-flush failed', error);
                }
            });
        }
    }
    trackPageview(url, properties = {}, distinctId) {
        const urlObj = new URL(url);
        const pageviewProperties = {
            $current_url: url,
            $host: urlObj.host,
            $pathname: urlObj.pathname,
            $search: urlObj.search,
            ...properties,
        };
        this.track('$pageview', pageviewProperties, distinctId);
    }
    async flush() {
        if (this.queue.length === 0)
            return;
        const events = [...this.queue];
        this.queue = [];
        try {
            await this.sendEvents(events);
        }
        catch (error) {
            this.queue.unshift(...events);
            throw error;
        }
    }
    async destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        await this.flush();
    }
}

const init = (config) => {
    return new JourniumNodeClient(config);
};
var index = { init, JourniumNodeClient };

exports.JourniumNodeClient = JourniumNodeClient;
exports.default = index;
exports.init = init;
Object.keys(shared).forEach(function (k) {
    if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () { return shared[k]; }
    });
});
//# sourceMappingURL=index.js.map
