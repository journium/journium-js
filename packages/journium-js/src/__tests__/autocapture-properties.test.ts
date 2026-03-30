import { AutocaptureTracker } from '../AutocaptureTracker.js';
import { JourniumClient } from '../JourniumClient.js';

jest.mock('../JourniumClient.js');

describe('AutocaptureTracker - enriched properties', () => {
  let mockClient: jest.Mocked<JourniumClient>;
  let tracker: AutocaptureTracker;
  let trackedEvents: Array<{ event: string; properties: Record<string, unknown> }>;

  beforeEach(() => {
    trackedEvents = [];
    mockClient = {
      track: jest.fn((event: string, properties: Record<string, unknown>) => {
        trackedEvents.push({ event, properties });
      }),
    } as any;

    // Set up document.title
    Object.defineProperty(document, 'title', {
      value: 'Test Page Title',
      writable: true,
    });
  });

  afterEach(() => {
    if (tracker) tracker.stop();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  function createTracker(options = {}): AutocaptureTracker {
    tracker = new AutocaptureTracker(mockClient, options);
    tracker.start();
    return tracker;
  }

  function clickElement(el: HTMLElement): void {
    el.click();
  }

  function getLastProperties(): Record<string, unknown> {
    return trackedEvents[trackedEvents.length - 1]?.properties ?? {};
  }

  // --- $element_href ---

  describe('$element_href', () => {
    test('is captured for <a> elements', () => {
      createTracker();
      const link = document.createElement('a');
      link.href = 'https://example.com/products';
      link.textContent = 'Products';
      document.body.appendChild(link);

      clickElement(link);

      const props = getLastProperties();
      expect(props.$element_href).toBe('https://example.com/products');
    });

    test('is absent for <button> elements', () => {
      createTracker();
      const button = document.createElement('button');
      button.textContent = 'Click me';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_href).toBeUndefined();
    });
  });

  // --- $page_title ---

  describe('$page_title', () => {
    test('is included in all autocapture events', () => {
      createTracker();
      const button = document.createElement('button');
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$page_title).toBe('Test Page Title');
    });
  });

  // --- $element_semantic_classes ---

  describe('$element_semantic_classes', () => {
    test('extracts readable name from CSS module pattern Module__hash__name', () => {
      createTracker();
      const button = document.createElement('button');
      button.className = 'Home-module__6mYgAq__button';
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_semantic_classes).toEqual(['button']);
    });

    test('keeps regular class names as-is', () => {
      createTracker();
      const button = document.createElement('button');
      button.className = 'primary-btn large';
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_semantic_classes).toEqual(['primary-btn', 'large']);
    });

    test('drops 2-part __ classes (no semantic name)', () => {
      createTracker();
      const button = document.createElement('button');
      button.className = 'Module__6mYgAq';
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_semantic_classes).toEqual([]);
    });

    test('filters hash-like single-part classes', () => {
      createTracker();
      const button = document.createElement('button');
      button.className = '6mYgAq btn';
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_semantic_classes).toEqual(['btn']);
    });

    test('deduplicates extracted class names', () => {
      createTracker();
      const button = document.createElement('button');
      button.className = 'Home-module__abc123__button Card-module__def456__button';
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_semantic_classes).toEqual(['button']);
    });

    test('$element_classes still present for backward compat', () => {
      createTracker();
      const button = document.createElement('button');
      button.className = 'Home-module__6mYgAq__button';
      button.textContent = 'Click';
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$element_classes).toEqual(['Home-module__6mYgAq__button']);
      expect(props.$element_semantic_classes).toEqual(['button']);
    });
  });

  // --- data-* attribute capture ---

  describe('data-* attribute capture', () => {
    test('captures data-jrnm-* attributes with default prefix', () => {
      createTracker();
      const button = document.createElement('button');
      button.textContent = 'Add to Cart';
      button.setAttribute('data-jrnm-product-id', 'prod_123');
      button.setAttribute('data-jrnm-action', 'add_to_cart');
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$attr_data_jrnm_product_id).toBe('prod_123');
      expect(props.$attr_data_jrnm_action).toBe('add_to_cart');
    });

    test('captures attributes matching dataAttributeNames', () => {
      createTracker({ dataAttributeNames: ['data-testid', 'data-track', 'data-custom-id'] });
      const button = document.createElement('button');
      button.textContent = 'Click';
      button.setAttribute('data-custom-id', 'my-button');
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$attr_data_custom_id).toBe('my-button');
    });

    test('captures attributes with custom prefix', () => {
      createTracker({ dataAttributePrefixes: ['jrnm-', 'product-'] });
      const button = document.createElement('button');
      button.textContent = 'Buy';
      button.setAttribute('data-product-name', 'Widget');
      button.setAttribute('data-product-price', '9.99');
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$attr_data_product_name).toBe('Widget');
      expect(props.$attr_data_product_price).toBe('9.99');
    });

    test('skips attributes already in relevantAttributes list', () => {
      createTracker();
      const button = document.createElement('button');
      button.textContent = 'Click';
      button.setAttribute('data-testid', 'my-btn');
      button.setAttribute('data-jrnm-action', 'click');
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      // data-testid captured by relevantAttributes as $element_data_testid
      expect(props.$element_data_testid).toBe('my-btn');
      // Should NOT also be captured as $attr_data_testid
      expect(props.$attr_data_testid).toBeUndefined();
      // data-jrnm-action captured by new logic
      expect(props.$attr_data_jrnm_action).toBe('click');
    });

    test('caps at 10 data attributes per element', () => {
      createTracker({ dataAttributePrefixes: ['test-'] });
      const button = document.createElement('button');
      button.textContent = 'Click';
      for (let i = 0; i < 15; i++) {
        button.setAttribute(`data-test-attr-${i}`, `value-${i}`);
      }
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      const attrProps = Object.keys(props).filter(k => k.startsWith('$attr_'));
      expect(attrProps.length).toBe(10);
    });

    test('ignores data-* attributes not matching any prefix or name', () => {
      createTracker();
      const button = document.createElement('button');
      button.textContent = 'Click';
      button.setAttribute('data-random-thing', 'value');
      document.body.appendChild(button);

      clickElement(button);

      const props = getLastProperties();
      expect(props.$attr_data_random_thing).toBeUndefined();
    });
  });
});
