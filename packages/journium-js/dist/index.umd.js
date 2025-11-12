(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Journium = {}));
})(this, (function (exports) { 'use strict';

    /**
     * uuidv7: A JavaScript implementation of UUID version 7
     *
     * Copyright 2021-2024 LiosK
     *
     * @license Apache-2.0
     * @packageDocumentation
     */
    const DIGITS = "0123456789abcdef";
    /** Represents a UUID as a 16-byte byte array. */
    class UUID {
        /** @param bytes - The 16-byte byte array representation. */
        constructor(bytes) {
            this.bytes = bytes;
        }
        /**
         * Creates an object from the internal representation, a 16-byte byte array
         * containing the binary UUID representation in the big-endian byte order.
         *
         * This method does NOT shallow-copy the argument, and thus the created object
         * holds the reference to the underlying buffer.
         *
         * @throws TypeError if the length of the argument is not 16.
         */
        static ofInner(bytes) {
            if (bytes.length !== 16) {
                throw new TypeError("not 128-bit length");
            }
            else {
                return new UUID(bytes);
            }
        }
        /**
         * Builds a byte array from UUIDv7 field values.
         *
         * @param unixTsMs - A 48-bit `unix_ts_ms` field value.
         * @param randA - A 12-bit `rand_a` field value.
         * @param randBHi - The higher 30 bits of 62-bit `rand_b` field value.
         * @param randBLo - The lower 32 bits of 62-bit `rand_b` field value.
         * @throws RangeError if any field value is out of the specified range.
         */
        static fromFieldsV7(unixTsMs, randA, randBHi, randBLo) {
            if (!Number.isInteger(unixTsMs) ||
                !Number.isInteger(randA) ||
                !Number.isInteger(randBHi) ||
                !Number.isInteger(randBLo) ||
                unixTsMs < 0 ||
                randA < 0 ||
                randBHi < 0 ||
                randBLo < 0 ||
                unixTsMs > 281474976710655 ||
                randA > 0xfff ||
                randBHi > 1073741823 ||
                randBLo > 4294967295) {
                throw new RangeError("invalid field value");
            }
            const bytes = new Uint8Array(16);
            bytes[0] = unixTsMs / 2 ** 40;
            bytes[1] = unixTsMs / 2 ** 32;
            bytes[2] = unixTsMs / 2 ** 24;
            bytes[3] = unixTsMs / 2 ** 16;
            bytes[4] = unixTsMs / 2 ** 8;
            bytes[5] = unixTsMs;
            bytes[6] = 0x70 | (randA >>> 8);
            bytes[7] = randA;
            bytes[8] = 0x80 | (randBHi >>> 24);
            bytes[9] = randBHi >>> 16;
            bytes[10] = randBHi >>> 8;
            bytes[11] = randBHi;
            bytes[12] = randBLo >>> 24;
            bytes[13] = randBLo >>> 16;
            bytes[14] = randBLo >>> 8;
            bytes[15] = randBLo;
            return new UUID(bytes);
        }
        /**
         * Builds a byte array from a string representation.
         *
         * This method accepts the following formats:
         *
         * - 32-digit hexadecimal format without hyphens: `0189dcd553117d408db09496a2eef37b`
         * - 8-4-4-4-12 hyphenated format: `0189dcd5-5311-7d40-8db0-9496a2eef37b`
         * - Hyphenated format with surrounding braces: `{0189dcd5-5311-7d40-8db0-9496a2eef37b}`
         * - RFC 9562 URN format: `urn:uuid:0189dcd5-5311-7d40-8db0-9496a2eef37b`
         *
         * Leading and trailing whitespaces represents an error.
         *
         * @throws SyntaxError if the argument could not parse as a valid UUID string.
         */
        static parse(uuid) {
            var _a, _b, _c, _d;
            let hex = undefined;
            switch (uuid.length) {
                case 32:
                    hex = (_a = /^[0-9a-f]{32}$/i.exec(uuid)) === null || _a === void 0 ? void 0 : _a[0];
                    break;
                case 36:
                    hex =
                        (_b = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i
                            .exec(uuid)) === null || _b === void 0 ? void 0 : _b.slice(1, 6).join("");
                    break;
                case 38:
                    hex =
                        (_c = /^\{([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\}$/i
                            .exec(uuid)) === null || _c === void 0 ? void 0 : _c.slice(1, 6).join("");
                    break;
                case 45:
                    hex =
                        (_d = /^urn:uuid:([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i
                            .exec(uuid)) === null || _d === void 0 ? void 0 : _d.slice(1, 6).join("");
                    break;
            }
            if (hex) {
                const inner = new Uint8Array(16);
                for (let i = 0; i < 16; i += 4) {
                    const n = parseInt(hex.substring(2 * i, 2 * i + 8), 16);
                    inner[i + 0] = n >>> 24;
                    inner[i + 1] = n >>> 16;
                    inner[i + 2] = n >>> 8;
                    inner[i + 3] = n;
                }
                return new UUID(inner);
            }
            else {
                throw new SyntaxError("could not parse UUID string");
            }
        }
        /**
         * @returns The 8-4-4-4-12 canonical hexadecimal string representation
         * (`0189dcd5-5311-7d40-8db0-9496a2eef37b`).
         */
        toString() {
            let text = "";
            for (let i = 0; i < this.bytes.length; i++) {
                text += DIGITS.charAt(this.bytes[i] >>> 4);
                text += DIGITS.charAt(this.bytes[i] & 0xf);
                if (i === 3 || i === 5 || i === 7 || i === 9) {
                    text += "-";
                }
            }
            return text;
        }
        /**
         * @returns The 32-digit hexadecimal representation without hyphens
         * (`0189dcd553117d408db09496a2eef37b`).
         */
        toHex() {
            let text = "";
            for (let i = 0; i < this.bytes.length; i++) {
                text += DIGITS.charAt(this.bytes[i] >>> 4);
                text += DIGITS.charAt(this.bytes[i] & 0xf);
            }
            return text;
        }
        /** @returns The 8-4-4-4-12 canonical hexadecimal string representation. */
        toJSON() {
            return this.toString();
        }
        /**
         * Reports the variant field value of the UUID or, if appropriate, "NIL" or
         * "MAX".
         *
         * For convenience, this method reports "NIL" or "MAX" if `this` represents
         * the Nil or Max UUID, although the Nil and Max UUIDs are technically
         * subsumed under the variants `0b0` and `0b111`, respectively.
         */
        getVariant() {
            const n = this.bytes[8] >>> 4;
            if (n < 0) {
                throw new Error("unreachable");
            }
            else if (n <= 0b0111) {
                return this.bytes.every((e) => e === 0) ? "NIL" : "VAR_0";
            }
            else if (n <= 0b1011) {
                return "VAR_10";
            }
            else if (n <= 0b1101) {
                return "VAR_110";
            }
            else if (n <= 0b1111) {
                return this.bytes.every((e) => e === 0xff) ? "MAX" : "VAR_RESERVED";
            }
            else {
                throw new Error("unreachable");
            }
        }
        /**
         * Returns the version field value of the UUID or `undefined` if the UUID does
         * not have the variant field value of `0b10`.
         */
        getVersion() {
            return this.getVariant() === "VAR_10" ? this.bytes[6] >>> 4 : undefined;
        }
        /** Creates an object from `this`. */
        clone() {
            return new UUID(this.bytes.slice(0));
        }
        /** Returns true if `this` is equivalent to `other`. */
        equals(other) {
            return this.compareTo(other) === 0;
        }
        /**
         * Returns a negative integer, zero, or positive integer if `this` is less
         * than, equal to, or greater than `other`, respectively.
         */
        compareTo(other) {
            for (let i = 0; i < 16; i++) {
                const diff = this.bytes[i] - other.bytes[i];
                if (diff !== 0) {
                    return Math.sign(diff);
                }
            }
            return 0;
        }
    }
    /**
     * Encapsulates the monotonic counter state.
     *
     * This class provides APIs to utilize a separate counter state from that of the
     * global generator used by {@link uuidv7} and {@link uuidv7obj}. In addition to
     * the default {@link generate} method, this class has {@link generateOrAbort}
     * that is useful to absolutely guarantee the monotonically increasing order of
     * generated UUIDs. See their respective documentation for details.
     */
    class V7Generator {
        /**
         * Creates a generator object with the default random number generator, or
         * with the specified one if passed as an argument. The specified random
         * number generator should be cryptographically strong and securely seeded.
         */
        constructor(randomNumberGenerator) {
            this.timestamp = 0;
            this.counter = 0;
            this.random = randomNumberGenerator !== null && randomNumberGenerator !== void 0 ? randomNumberGenerator : getDefaultRandom();
        }
        /**
         * Generates a new UUIDv7 object from the current timestamp, or resets the
         * generator upon significant timestamp rollback.
         *
         * This method returns a monotonically increasing UUID by reusing the previous
         * timestamp even if the up-to-date timestamp is smaller than the immediately
         * preceding UUID's. However, when such a clock rollback is considered
         * significant (i.e., by more than ten seconds), this method resets the
         * generator and returns a new UUID based on the given timestamp, breaking the
         * increasing order of UUIDs.
         *
         * See {@link generateOrAbort} for the other mode of generation and
         * {@link generateOrResetCore} for the low-level primitive.
         */
        generate() {
            return this.generateOrResetCore(Date.now(), 10000);
        }
        /**
         * Generates a new UUIDv7 object from the current timestamp, or returns
         * `undefined` upon significant timestamp rollback.
         *
         * This method returns a monotonically increasing UUID by reusing the previous
         * timestamp even if the up-to-date timestamp is smaller than the immediately
         * preceding UUID's. However, when such a clock rollback is considered
         * significant (i.e., by more than ten seconds), this method aborts and
         * returns `undefined` immediately.
         *
         * See {@link generate} for the other mode of generation and
         * {@link generateOrAbortCore} for the low-level primitive.
         */
        generateOrAbort() {
            return this.generateOrAbortCore(Date.now(), 10000);
        }
        /**
         * Generates a new UUIDv7 object from the `unixTsMs` passed, or resets the
         * generator upon significant timestamp rollback.
         *
         * This method is equivalent to {@link generate} except that it takes a custom
         * timestamp and clock rollback allowance.
         *
         * @param rollbackAllowance - The amount of `unixTsMs` rollback that is
         * considered significant. A suggested value is `10_000` (milliseconds).
         * @throws RangeError if `unixTsMs` is not a 48-bit positive integer.
         */
        generateOrResetCore(unixTsMs, rollbackAllowance) {
            let value = this.generateOrAbortCore(unixTsMs, rollbackAllowance);
            if (value === undefined) {
                // reset state and resume
                this.timestamp = 0;
                value = this.generateOrAbortCore(unixTsMs, rollbackAllowance);
            }
            return value;
        }
        /**
         * Generates a new UUIDv7 object from the `unixTsMs` passed, or returns
         * `undefined` upon significant timestamp rollback.
         *
         * This method is equivalent to {@link generateOrAbort} except that it takes a
         * custom timestamp and clock rollback allowance.
         *
         * @param rollbackAllowance - The amount of `unixTsMs` rollback that is
         * considered significant. A suggested value is `10_000` (milliseconds).
         * @throws RangeError if `unixTsMs` is not a 48-bit positive integer.
         */
        generateOrAbortCore(unixTsMs, rollbackAllowance) {
            const MAX_COUNTER = 4398046511103;
            if (!Number.isInteger(unixTsMs) ||
                unixTsMs < 1 ||
                unixTsMs > 281474976710655) {
                throw new RangeError("`unixTsMs` must be a 48-bit positive integer");
            }
            else if (rollbackAllowance < 0 || rollbackAllowance > 281474976710655) {
                throw new RangeError("`rollbackAllowance` out of reasonable range");
            }
            if (unixTsMs > this.timestamp) {
                this.timestamp = unixTsMs;
                this.resetCounter();
            }
            else if (unixTsMs + rollbackAllowance >= this.timestamp) {
                // go on with previous timestamp if new one is not much smaller
                this.counter++;
                if (this.counter > MAX_COUNTER) {
                    // increment timestamp at counter overflow
                    this.timestamp++;
                    this.resetCounter();
                }
            }
            else {
                // abort if clock went backwards to unbearable extent
                return undefined;
            }
            return UUID.fromFieldsV7(this.timestamp, Math.trunc(this.counter / 2 ** 30), this.counter & (2 ** 30 - 1), this.random.nextUint32());
        }
        /** Initializes the counter at a 42-bit random integer. */
        resetCounter() {
            this.counter =
                this.random.nextUint32() * 0x400 + (this.random.nextUint32() & 0x3ff);
        }
        /**
         * Generates a new UUIDv4 object utilizing the random number generator inside.
         *
         * @internal
         */
        generateV4() {
            const bytes = new Uint8Array(Uint32Array.of(this.random.nextUint32(), this.random.nextUint32(), this.random.nextUint32(), this.random.nextUint32()).buffer);
            bytes[6] = 0x40 | (bytes[6] >>> 4);
            bytes[8] = 0x80 | (bytes[8] >>> 2);
            return UUID.ofInner(bytes);
        }
    }
    /** Returns the default random number generator available in the environment. */
    const getDefaultRandom = () => {
        // detect Web Crypto API
        if (typeof crypto !== "undefined" &&
            typeof crypto.getRandomValues !== "undefined") {
            return new BufferedCryptoRandom();
        }
        else {
            // fall back on Math.random() unless the flag is set to true
            if (typeof UUIDV7_DENY_WEAK_RNG !== "undefined" && UUIDV7_DENY_WEAK_RNG) {
                throw new Error("no cryptographically strong RNG available");
            }
            return {
                nextUint32: () => Math.trunc(Math.random() * 65536) * 65536 +
                    Math.trunc(Math.random() * 65536),
            };
        }
    };
    /**
     * Wraps `crypto.getRandomValues()` to enable buffering; this uses a small
     * buffer by default to avoid both unbearable throughput decline in some
     * environments and the waste of time and space for unused values.
     */
    class BufferedCryptoRandom {
        constructor() {
            this.buffer = new Uint32Array(8);
            this.cursor = 0xffff;
        }
        nextUint32() {
            if (this.cursor >= this.buffer.length) {
                crypto.getRandomValues(this.buffer);
                this.cursor = 0;
            }
            return this.buffer[this.cursor++];
        }
    }
    let defaultGenerator;
    /**
     * Generates a UUIDv7 string.
     *
     * @returns The 8-4-4-4-12 canonical hexadecimal string representation
     * ("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
     */
    const uuidv7 = () => uuidv7obj().toString();
    /** Generates a UUIDv7 object. */
    const uuidv7obj = () => (defaultGenerator || (defaultGenerator = new V7Generator())).generate();

    const generateId = () => {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };
    const generateUuidv7 = () => {
        return uuidv7();
    };
    const getCurrentTimestamp = () => {
        return new Date().toISOString();
    };
    const getCurrentUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };
    const getPageTitle = () => {
        if (typeof document !== 'undefined') {
            return document.title;
        }
        return '';
    };
    const getReferrer = () => {
        if (typeof document !== 'undefined') {
            return document.referrer;
        }
        return '';
    };
    const isBrowser = () => {
        return typeof window !== 'undefined';
    };
    const isNode = () => {
        var _a;
        return typeof process !== 'undefined' && !!((_a = process.versions) === null || _a === void 0 ? void 0 : _a.node);
    };
    const fetchRemoteConfig = async (apiHost, applicationKey, configEndpoint, fetchFn) => {
        const endpoint = configEndpoint || '/configs';
        const url = `${apiHost}${endpoint}?ingestion_key=${encodeURIComponent(applicationKey)}`;
        try {
            let fetch = fetchFn;
            if (!fetch) {
                if (isNode()) {
                    // For Node.js environments, expect fetch to be passed in
                    throw new Error('Fetch function must be provided in Node.js environment');
                }
                else {
                    // Use native fetch in browser
                    fetch = window.fetch;
                }
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Config fetch failed: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.warn('Failed to fetch remote config:', error);
            return null;
        }
    };
    const mergeConfigs = (localConfig, remoteConfig) => {
        if (!remoteConfig) {
            return localConfig;
        }
        // Deep merge remote config into local config
        // Remote config takes precedence over local config
        const merged = { ...localConfig };
        // Handle primitive values
        Object.keys(remoteConfig).forEach(key => {
            if (remoteConfig[key] !== undefined && remoteConfig[key] !== null) {
                if (typeof remoteConfig[key] === 'object' && !Array.isArray(remoteConfig[key])) {
                    // Deep merge objects
                    merged[key] = {
                        ...(merged[key] || {}),
                        ...remoteConfig[key]
                    };
                }
                else {
                    // Override primitive values and arrays
                    merged[key] = remoteConfig[key];
                }
            }
        });
        return merged;
    };

    const STORAGE_KEY = '__journium_identity';
    const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in ms
    class BrowserIdentityManager {
        constructor(sessionTimeout) {
            this.identity = null;
            this.sessionTimeout = DEFAULT_SESSION_TIMEOUT;
            if (sessionTimeout) {
                this.sessionTimeout = sessionTimeout;
            }
            this.loadOrCreateIdentity();
        }
        loadOrCreateIdentity() {
            if (!this.isBrowser())
                return;
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsedIdentity = JSON.parse(stored);
                    // Check if session is expired
                    const now = Date.now();
                    const sessionAge = now - parsedIdentity.session_timestamp;
                    if (sessionAge > this.sessionTimeout) {
                        // Session expired, create new session but keep device and distinct IDs
                        this.identity = {
                            distinct_id: parsedIdentity.distinct_id,
                            $device_id: parsedIdentity.$device_id,
                            $session_id: generateUuidv7(),
                            session_timestamp: now,
                        };
                    }
                    else {
                        // Session still valid
                        this.identity = parsedIdentity;
                    }
                }
                else {
                    // First time, create all new IDs
                    const newId = generateUuidv7();
                    this.identity = {
                        distinct_id: newId,
                        $device_id: newId,
                        $session_id: newId,
                        session_timestamp: Date.now(),
                    };
                }
                // Save to localStorage
                this.saveIdentity();
            }
            catch (error) {
                console.warn('Journium: Failed to load/create identity:', error);
                // Fallback: create temporary identity without localStorage
                const newId = generateUuidv7();
                this.identity = {
                    distinct_id: newId,
                    $device_id: newId,
                    $session_id: newId,
                    session_timestamp: Date.now(),
                };
            }
        }
        saveIdentity() {
            if (!this.isBrowser() || !this.identity)
                return;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.identity));
            }
            catch (error) {
                console.warn('Journium: Failed to save identity to localStorage:', error);
            }
        }
        isBrowser() {
            return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
        }
        getIdentity() {
            return this.identity;
        }
        updateSessionTimeout(timeoutMs) {
            this.sessionTimeout = timeoutMs;
        }
        refreshSession() {
            if (!this.identity)
                return;
            this.identity = {
                ...this.identity,
                $session_id: generateUuidv7(),
                session_timestamp: Date.now(),
            };
            this.saveIdentity();
        }
        getUserAgentInfo() {
            if (!this.isBrowser()) {
                return {
                    $raw_user_agent: '',
                    $browser: 'Unknown',
                    $os: 'Unknown',
                    $device_type: 'Unknown',
                };
            }
            const userAgent = navigator.userAgent;
            return {
                $raw_user_agent: userAgent,
                $browser: this.parseBrowser(userAgent),
                $os: this.parseOS(userAgent),
                $device_type: this.parseDeviceType(userAgent),
            };
        }
        parseBrowser(userAgent) {
            if (userAgent.includes('Chrome') && !userAgent.includes('Edg'))
                return 'Chrome';
            if (userAgent.includes('Firefox'))
                return 'Firefox';
            if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
                return 'Safari';
            if (userAgent.includes('Edg'))
                return 'Edge';
            if (userAgent.includes('Opera') || userAgent.includes('OPR'))
                return 'Opera';
            return 'Unknown';
        }
        parseOS(userAgent) {
            if (userAgent.includes('Windows'))
                return 'Windows';
            if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS'))
                return 'Mac OS';
            if (userAgent.includes('Linux'))
                return 'Linux';
            if (userAgent.includes('Android'))
                return 'Android';
            if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
                return 'iOS';
            return 'Unknown';
        }
        parseDeviceType(userAgent) {
            if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
                return 'Mobile';
            }
            if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
                return 'Tablet';
            }
            return 'Desktop';
        }
    }

    class JourniumClient {
        constructor(config) {
            this.queue = [];
            this.flushTimer = null;
            this.initialized = false;
            // Preserve apiHost and applicationKey, set minimal defaults for others
            this.config = {
                apiHost: 'http://localhost:3006',
                ...config,
            };
            // Initialize identity manager
            this.identityManager = new BrowserIdentityManager(this.config.sessionTimeout);
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
                    const remoteConfigResponse = await fetchRemoteConfig(this.config.apiHost, this.config.applicationKey, this.config.configEndpoint);
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
                        // Update session timeout if provided in remote config
                        if (remoteConfigResponse.config.sessionTimeout) {
                            this.identityManager.updateSessionTimeout(remoteConfigResponse.config.sessionTimeout);
                        }
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
                    console.log('Journium: Client initialized with config:', this.config);
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
            this.flushTimer = window.setInterval(() => {
                this.flush();
            }, this.config.flushInterval);
        }
        async sendEvents(events) {
            if (!events.length)
                return;
            try {
                const response = await fetch(`${this.config.apiHost}/ingest_event`, {
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
        track(event, properties = {}) {
            const identity = this.identityManager.getIdentity();
            const userAgentInfo = this.identityManager.getUserAgentInfo();
            // Create standardized event properties
            const eventProperties = {
                $device_id: identity === null || identity === void 0 ? void 0 : identity.$device_id,
                distinct_id: identity === null || identity === void 0 ? void 0 : identity.distinct_id,
                $session_id: identity === null || identity === void 0 ? void 0 : identity.$session_id,
                $current_url: typeof window !== 'undefined' ? window.location.href : '',
                $pathname: typeof window !== 'undefined' ? window.location.pathname : '',
                ...userAgentInfo,
                $lib_version: '0.1.0', // TODO: Get from package.json
                $platform: 'web',
                ...properties, // User-provided properties override defaults
            };
            const journiumEvent = {
                uuid: generateUuidv7(),
                ingestion_key: this.config.applicationKey,
                client_timestamp: getCurrentTimestamp(),
                event,
                properties: eventProperties,
            };
            this.queue.push(journiumEvent);
            if (this.config.debug) {
                console.log('Journium: Event tracked', journiumEvent);
            }
            if (this.queue.length >= this.config.flushAt) {
                this.flush();
            }
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
        destroy() {
            if (this.flushTimer) {
                clearInterval(this.flushTimer);
                this.flushTimer = null;
            }
            this.flush();
        }
    }

    class PageviewTracker {
        constructor(client) {
            this.lastUrl = '';
            this.client = client;
        }
        capturePageview(customProperties = {}) {
            const currentUrl = getCurrentUrl();
            const url = new URL(currentUrl);
            const properties = {
                $current_url: currentUrl,
                $host: url.host,
                $pathname: url.pathname,
                $search: url.search,
                $title: getPageTitle(),
                $referrer: getReferrer(),
                ...customProperties,
            };
            this.client.track('$pageview', properties);
            this.lastUrl = currentUrl;
        }
        startAutoCapture() {
            this.capturePageview();
            if (typeof window !== 'undefined') {
                const originalPushState = window.history.pushState;
                const originalReplaceState = window.history.replaceState;
                window.history.pushState = (...args) => {
                    originalPushState.apply(window.history, args);
                    setTimeout(() => this.capturePageview(), 0);
                };
                window.history.replaceState = (...args) => {
                    originalReplaceState.apply(window.history, args);
                    setTimeout(() => this.capturePageview(), 0);
                };
                window.addEventListener('popstate', () => {
                    setTimeout(() => this.capturePageview(), 0);
                });
            }
        }
        stopAutoCapture() {
            // In a real implementation, we'd need to store references to restore original methods
            // For now, this is a placeholder
        }
    }

    class AutocaptureTracker {
        constructor(client, config = {}) {
            this.listeners = new Map();
            this.isActive = false;
            this.client = client;
            this.config = {
                captureClicks: true,
                captureFormSubmits: true,
                captureFormChanges: true,
                captureTextSelection: false,
                ignoreClasses: ['journium-ignore'],
                ignoreElements: ['script', 'style', 'noscript'],
                captureContentText: true,
                ...config,
            };
        }
        start() {
            if (!isBrowser() || this.isActive) {
                return;
            }
            this.isActive = true;
            if (this.config.captureClicks) {
                this.addClickListener();
            }
            if (this.config.captureFormSubmits) {
                this.addFormSubmitListener();
            }
            if (this.config.captureFormChanges) {
                this.addFormChangeListener();
            }
            if (this.config.captureTextSelection) {
                this.addTextSelectionListener();
            }
        }
        stop() {
            if (!isBrowser() || !this.isActive) {
                return;
            }
            this.isActive = false;
            this.listeners.forEach((listener, event) => {
                document.removeEventListener(event, listener, true);
            });
            this.listeners.clear();
        }
        addClickListener() {
            const clickListener = (event) => {
                const target = event.target;
                if (this.shouldIgnoreElement(target)) {
                    return;
                }
                const properties = this.getElementProperties(target, 'click');
                this.client.track('$autocapture', {
                    $event_type: 'click',
                    ...properties,
                });
            };
            document.addEventListener('click', clickListener, true);
            this.listeners.set('click', clickListener);
        }
        addFormSubmitListener() {
            const submitListener = (event) => {
                const target = event.target;
                if (this.shouldIgnoreElement(target)) {
                    return;
                }
                const properties = this.getFormProperties(target, 'submit');
                this.client.track('$autocapture', {
                    $event_type: 'submit',
                    ...properties,
                });
            };
            document.addEventListener('submit', submitListener, true);
            this.listeners.set('submit', submitListener);
        }
        addFormChangeListener() {
            const changeListener = (event) => {
                const target = event.target;
                if (this.shouldIgnoreElement(target) || !this.isFormElement(target)) {
                    return;
                }
                const properties = this.getInputProperties(target, 'change');
                this.client.track('$autocapture', {
                    $event_type: 'change',
                    ...properties,
                });
            };
            document.addEventListener('change', changeListener, true);
            this.listeners.set('change', changeListener);
        }
        addTextSelectionListener() {
            const selectionListener = () => {
                const selection = window.getSelection();
                if (!selection || selection.toString().trim().length === 0) {
                    return;
                }
                const selectedText = selection.toString().trim();
                if (selectedText.length < 3) { // Ignore very short selections
                    return;
                }
                this.client.track('$autocapture', {
                    $event_type: 'text_selection',
                    $selected_text: selectedText.substring(0, 200), // Limit text length
                    $selection_length: selectedText.length,
                });
            };
            document.addEventListener('mouseup', selectionListener);
            this.listeners.set('mouseup', selectionListener);
        }
        shouldIgnoreElement(element) {
            var _a, _b, _c;
            if (!element || !element.tagName) {
                return true;
            }
            // Check if element should be ignored by tag name
            if ((_a = this.config.ignoreElements) === null || _a === void 0 ? void 0 : _a.includes(element.tagName.toLowerCase())) {
                return true;
            }
            // Check if element has ignore classes
            if ((_b = this.config.ignoreClasses) === null || _b === void 0 ? void 0 : _b.some(cls => element.classList.contains(cls))) {
                return true;
            }
            // Check parent elements for ignore classes
            let parent = element.parentElement;
            while (parent) {
                if ((_c = this.config.ignoreClasses) === null || _c === void 0 ? void 0 : _c.some(cls => parent.classList.contains(cls))) {
                    return true;
                }
                parent = parent.parentElement;
            }
            return false;
        }
        isFormElement(element) {
            const formElements = ['input', 'select', 'textarea'];
            return formElements.includes(element.tagName.toLowerCase());
        }
        getElementProperties(element, eventType) {
            const properties = {
                $element_tag: element.tagName.toLowerCase(),
                $element_type: this.getElementType(element),
            };
            // Element identifiers
            if (element.id) {
                properties.$element_id = element.id;
            }
            if (element.className) {
                properties.$element_classes = Array.from(element.classList);
            }
            // Element attributes
            const relevantAttributes = ['name', 'role', 'aria-label', 'data-testid', 'data-track'];
            relevantAttributes.forEach(attr => {
                const value = element.getAttribute(attr);
                if (value) {
                    properties[`$element_${attr.replace('-', '_')}`] = value;
                }
            });
            // Element content
            if (this.config.captureContentText) {
                const text = this.getElementText(element);
                if (text) {
                    properties.$element_text = text.substring(0, 200); // Limit text length
                }
            }
            // Elements chain data
            const elementsChain = this.getElementsChain(element);
            properties.$elements_chain = elementsChain.chain;
            properties.$elements_chain_href = elementsChain.href;
            properties.$elements_chain_elements = elementsChain.elements;
            properties.$elements_chain_texts = elementsChain.texts;
            properties.$elements_chain_ids = elementsChain.ids;
            // Position information
            const rect = element.getBoundingClientRect();
            properties.$element_position = {
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            };
            // Parent information
            if (element.parentElement) {
                properties.$parent_tag = element.parentElement.tagName.toLowerCase();
                if (element.parentElement.id) {
                    properties.$parent_id = element.parentElement.id;
                }
            }
            // URL information
            properties.$current_url = window.location.href;
            properties.$host = window.location.host;
            properties.$pathname = window.location.pathname;
            return properties;
        }
        getFormProperties(form, eventType) {
            const properties = this.getElementProperties(form, eventType);
            // Form-specific properties
            properties.$form_method = form.method || 'get';
            properties.$form_action = form.action || '';
            // Count form elements
            const inputs = form.querySelectorAll('input, select, textarea');
            properties.$form_elements_count = inputs.length;
            // Form element types
            const elementTypes = {};
            inputs.forEach(input => {
                const type = this.getElementType(input);
                elementTypes[type] = (elementTypes[type] || 0) + 1;
            });
            properties.$form_element_types = elementTypes;
            return properties;
        }
        getInputProperties(input, eventType) {
            const properties = this.getElementProperties(input, eventType);
            // Input-specific properties
            properties.$input_type = input.type || 'text';
            if (input.name) {
                properties.$input_name = input.name;
            }
            if (input.placeholder) {
                properties.$input_placeholder = input.placeholder;
            }
            // Value information (be careful with sensitive data)
            if (this.isSafeInputType(input.type)) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    properties.$input_checked = input.checked;
                }
                else if (input.value) {
                    // For safe inputs, capture value length and basic characteristics
                    properties.$input_value_length = input.value.length;
                    properties.$input_has_value = input.value.length > 0;
                    // For select elements, capture the selected value
                    if (input.tagName.toLowerCase() === 'select') {
                        properties.$input_selected_value = input.value;
                    }
                }
            }
            // Form context
            const form = input.closest('form');
            if (form && form.id) {
                properties.$form_id = form.id;
            }
            return properties;
        }
        getElementType(element) {
            const tag = element.tagName.toLowerCase();
            if (tag === 'input') {
                return element.type || 'text';
            }
            if (tag === 'button') {
                return element.type || 'button';
            }
            return tag;
        }
        getElementText(element) {
            var _a, _b;
            // For buttons and links, get the visible text
            if (['button', 'a'].includes(element.tagName.toLowerCase())) {
                return ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            }
            // For inputs, get placeholder or label
            if (element.tagName.toLowerCase() === 'input') {
                const input = element;
                return input.placeholder || input.value || '';
            }
            // For other elements, get text content but limit it
            const text = ((_b = element.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            return text.length > 50 ? text.substring(0, 47) + '...' : text;
        }
        getElementsChain(element) {
            var _a;
            const elements = [];
            const texts = [];
            const ids = [];
            let href = '';
            let current = element;
            while (current && current !== document.body) {
                // Element selector
                let selector = current.tagName.toLowerCase();
                // Add ID if present
                if (current.id) {
                    selector += `#${current.id}`;
                    ids.push(current.id);
                }
                else {
                    ids.push('');
                }
                // Add classes if present
                if (current.className && typeof current.className === 'string') {
                    const classes = current.className.trim().split(/\s+/).slice(0, 3); // Limit to first 3 classes
                    if (classes.length > 0 && classes[0] !== '') {
                        selector += '.' + classes.join('.');
                    }
                }
                // Add nth-child if no ID (to make selector more specific)
                if (!current.id && current.parentElement) {
                    const siblings = Array.from(current.parentElement.children)
                        .filter(child => child.tagName === current.tagName);
                    if (siblings.length > 1) {
                        const index = siblings.indexOf(current) + 1;
                        selector += `:nth-child(${index})`;
                    }
                }
                elements.push(selector);
                // Extract text content
                let text = '';
                if (current.tagName.toLowerCase() === 'a') {
                    text = ((_a = current.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                    // Capture href for links
                    if (!href && current.getAttribute('href')) {
                        href = current.getAttribute('href') || '';
                    }
                }
                else if (['button', 'span', 'div'].includes(current.tagName.toLowerCase())) {
                    // For buttons and text elements, get direct text content (not including children)
                    const directText = Array.from(current.childNodes)
                        .filter(node => node.nodeType === Node.TEXT_NODE)
                        .map(node => { var _a; return (_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
                        .join(' ')
                        .trim();
                    text = directText || '';
                }
                else if (current.tagName.toLowerCase() === 'input') {
                    const input = current;
                    text = input.placeholder || input.value || '';
                }
                // Limit text length and clean it
                text = text.substring(0, 100).replace(/\s+/g, ' ').trim();
                texts.push(text);
                current = current.parentElement;
            }
            // Build the chain string (reverse order so it goes from parent to child)
            const chain = elements.reverse().join(' > ');
            return {
                chain,
                href,
                elements: elements,
                texts: texts.reverse(),
                ids: ids.reverse()
            };
        }
        isSafeInputType(type) {
            // Don't capture values for sensitive input types
            const sensitiveTypes = ['password', 'email', 'tel', 'credit-card-number'];
            return !sensitiveTypes.includes(type.toLowerCase());
        }
    }

    class Journium {
        constructor(config) {
            this.config = config;
            this.client = new JourniumClient(config);
            this.pageviewTracker = new PageviewTracker(this.client);
            const autocaptureConfig = this.resolveAutocaptureConfig(config.autocapture);
            this.autocaptureTracker = new AutocaptureTracker(this.client, autocaptureConfig);
        }
        resolveAutocaptureConfig(autocapture) {
            if (autocapture === false || autocapture === undefined) {
                return {
                    captureClicks: false,
                    captureFormSubmits: false,
                    captureFormChanges: false,
                    captureTextSelection: false,
                };
            }
            if (autocapture === true) {
                return {}; // Use default configuration
            }
            return autocapture;
        }
        track(event, properties) {
            this.client.track(event, properties);
        }
        capturePageview(properties) {
            this.pageviewTracker.capturePageview(properties);
        }
        startAutoCapture() {
            this.pageviewTracker.startAutoCapture();
            if (this.config.autocapture) {
                this.autocaptureTracker.start();
            }
        }
        stopAutoCapture() {
            this.pageviewTracker.stopAutoCapture();
            this.autocaptureTracker.stop();
        }
        startAutocapture() {
            this.autocaptureTracker.start();
        }
        stopAutocapture() {
            this.autocaptureTracker.stop();
        }
        async flush() {
            return this.client.flush();
        }
        destroy() {
            this.pageviewTracker.stopAutoCapture();
            this.autocaptureTracker.stop();
            this.client.destroy();
        }
    }
    const init = (config) => {
        return new Journium(config);
    };

    exports.AutocaptureTracker = AutocaptureTracker;
    exports.BrowserIdentityManager = BrowserIdentityManager;
    exports.Journium = Journium;
    exports.JourniumClient = JourniumClient;
    exports.PageviewTracker = PageviewTracker;
    exports.fetchRemoteConfig = fetchRemoteConfig;
    exports.generateId = generateId;
    exports.generateUuidv7 = generateUuidv7;
    exports.getCurrentTimestamp = getCurrentTimestamp;
    exports.getCurrentUrl = getCurrentUrl;
    exports.getPageTitle = getPageTitle;
    exports.getReferrer = getReferrer;
    exports.init = init;
    exports.isBrowser = isBrowser;
    exports.isNode = isNode;
    exports.mergeConfigs = mergeConfigs;

}));
//# sourceMappingURL=index.umd.js.map
