import { JourniumClient } from './JourniumClient';
import { isBrowser, AutocaptureOptions } from '@journium/core';

/**
 * AutocaptureTracker is responsible for tracking user interactions and capturing them as events.
 */
export class AutocaptureTracker {
  private client: JourniumClient;
  private options: AutocaptureOptions;
  private listeners: Map<string, EventListener> = new Map();
  private isActive: boolean = false;

  constructor(client: JourniumClient, options: AutocaptureOptions = {}) {
    this.client = client;
    this.options = {
      captureClicks: true,
      captureFormSubmits: true,
      captureFormChanges: true,
      captureTextSelection: false,
      ignoreClasses: ['journium-ignore'],
      ignoreElements: ['script', 'style', 'noscript'],
      captureContentText: true,
      ...options,
    };
  }

  /**
   * Update autocapture options and restart if currently active
   */
  updateOptions(options: AutocaptureOptions): void {
    const wasActive = this.isActive;
    
    // Stop if currently active
    if (wasActive) {
      this.stop();
    }
    
    // Update options
    this.options = {
      captureClicks: true,
      captureFormSubmits: true,
      captureFormChanges: true,
      captureTextSelection: false,
      ignoreClasses: ['journium-ignore'],
      ignoreElements: ['script', 'style', 'noscript'],
      captureContentText: true,
      ...options,
    };
    
    // Restart if it was active before
    if (wasActive) {
      this.start();
    }
  }

  start(): void {
    if (!isBrowser() || this.isActive) {
      return;
    }

    this.isActive = true;

    if (this.options.captureClicks) {
      this.addClickListener();
    }

    if (this.options.captureFormSubmits) {
      this.addFormSubmitListener();
    }

    if (this.options.captureFormChanges) {
      this.addFormChangeListener();
    }

    if (this.options.captureTextSelection) {
      this.addTextSelectionListener();
    }
  }

  stop(): void {
    if (!isBrowser() || !this.isActive) {
      return;
    }

    this.isActive = false;

    this.listeners.forEach((listener, event) => {
      document.removeEventListener(event, listener, true);
    });

    this.listeners.clear();
  }

  private addClickListener(): void {
    const clickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      
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

  private addFormSubmitListener(): void {
    const submitListener = (event: Event) => {
      const target = event.target as HTMLFormElement;
      
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

  private addFormChangeListener(): void {
    const changeListener = (event: Event) => {
      const target = event.target as HTMLInputElement;
      
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

  private addTextSelectionListener(): void {
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

  private shouldIgnoreElement(element: HTMLElement): boolean {
    if (!element || !element.tagName) {
      return true;
    }

    // Check if element should be ignored by tag name
    if (this.options.ignoreElements?.includes(element.tagName.toLowerCase())) {
      return true;
    }

    // Check if element has ignore classes
    if (this.options.ignoreClasses?.some(cls => element.classList.contains(cls))) {
      return true;
    }

    // Check parent elements for ignore classes
    let parent = element.parentElement;
    while (parent) {
      if (this.options.ignoreClasses?.some(cls => parent!.classList.contains(cls))) {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  private isFormElement(element: HTMLElement): boolean {
    const formElements = ['input', 'select', 'textarea'];
    return formElements.includes(element.tagName.toLowerCase());
  }

  private getElementProperties(element: HTMLElement, eventType: string): Record<string, unknown> {
    const properties: Record<string, unknown> = {
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
    if (this.options.captureContentText) {
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

  private getFormProperties(form: HTMLFormElement, eventType: string): Record<string, unknown> {
    const properties = this.getElementProperties(form, eventType);

    // Form-specific properties
    properties.$form_method = form.method || 'get';
    properties.$form_action = form.action || '';

    // Count form elements
    const inputs = form.querySelectorAll('input, select, textarea');
    properties.$form_elements_count = inputs.length;

    // Form element types
    const elementTypes: Record<string, number> = {};
    inputs.forEach(input => {
      const type = this.getElementType(input as HTMLElement);
      elementTypes[type] = (elementTypes[type] || 0) + 1;
    });
    properties.$form_element_types = elementTypes;

    return properties;
  }

  private getInputProperties(input: HTMLInputElement, eventType: string): Record<string, unknown> {
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
      } else if (input.value) {
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

  private getElementType(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    
    if (tag === 'input') {
      return (element as HTMLInputElement).type || 'text';
    }
    
    if (tag === 'button') {
      return (element as HTMLButtonElement).type || 'button';
    }

    return tag;
  }

  private getElementText(element: HTMLElement): string {
    // For buttons and links, get the visible text
    if (['button', 'a'].includes(element.tagName.toLowerCase())) {
      return element.textContent?.trim() || '';
    }

    // For inputs, get placeholder or label
    if (element.tagName.toLowerCase() === 'input') {
      const input = element as HTMLInputElement;
      return input.placeholder || input.value || '';
    }

    // For other elements, get text content but limit it
    const text = element.textContent?.trim() || '';
    return text.length > 50 ? text.substring(0, 47) + '...' : text;
  }

  private getElementsChain(element: HTMLElement): {
    chain: string;
    href: string;
    elements: string[];
    texts: string[];
    ids: string[];
  } {
    const elements: string[] = [];
    const texts: string[] = [];
    const ids: string[] = [];
    let href = '';

    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      // Element selector
      let selector = current.tagName.toLowerCase();
      
      // Add ID if present
      if (current.id) {
        selector += `#${current.id}`;
        ids.push(current.id);
      } else {
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
          .filter(child => child.tagName === current!.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }
      
      elements.push(selector);
      
      // Extract text content
      let text = '';
      if (current.tagName.toLowerCase() === 'a') {
        text = current.textContent?.trim() || '';
        // Capture href for links
        if (!href && current.getAttribute('href')) {
          href = current.getAttribute('href') || '';
        }
      } else if (['button', 'span', 'div'].includes(current.tagName.toLowerCase())) {
        // For buttons and text elements, get direct text content (not including children)
        const directText = Array.from(current.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent?.trim())
          .join(' ')
          .trim();
        text = directText || '';
      } else if (current.tagName.toLowerCase() === 'input') {
        const input = current as HTMLInputElement;
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

  private isSafeInputType(type: string): boolean {
    // Don't capture values for sensitive input types
    const sensitiveTypes = ['password', 'email', 'tel', 'credit-card-number'];
    return !sensitiveTypes.includes(type.toLowerCase());
  }
}