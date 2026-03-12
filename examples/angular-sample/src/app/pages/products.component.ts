import { Component } from '@angular/core';
import { JourniumService } from '@journium/angular';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Products</h1>
      <p>Products page demonstrating e-commerce event tracking patterns.</p>
    </div>

    <section class="demo-section">
      <h2>Product Catalog</h2>
      <p>Click products to track view and purchase events:</p>
      <div class="button-group">
        @for (product of products; track product.id) {
          <button class="demo-button" (click)="trackProductView(product)">
            View: {{ product.name }} ({{ '$' + product.price }})
          </button>
        }
      </div>
    </section>

    <section class="demo-section">
      <h2>Cart Actions</h2>
      <div class="button-group">
        <button class="demo-button purchase" (click)="trackAddToCart()">Add to Cart</button>
        <button class="demo-button feature" (click)="trackCheckout()">Checkout</button>
      </div>
    </section>

    <section class="demo-section info">
      <h2>E-Commerce Tracking</h2>
      <ul>
        <li><strong>product_viewed:</strong> Track when users view product details</li>
        <li><strong>add_to_cart:</strong> Track cart additions with product and price data</li>
        <li><strong>purchase_completed:</strong> Track successful conversions</li>
        <li><strong>Properties:</strong> Always include product_id, price, category for analysis</li>
      </ul>
    </section>
  `,
})
export class ProductsComponent {
  products: Product[] = [
    { id: 'prod-001', name: 'Analytics Pro', price: 49.99, category: 'software' },
    { id: 'prod-002', name: 'Data Export', price: 19.99, category: 'addon' },
    { id: 'prod-003', name: 'Team Plan', price: 99.99, category: 'subscription' },
  ];

  constructor(private journium: JourniumService) {}

  trackProductView(product: Product): void {
    this.journium.track('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category,
      page: 'products',
    });
  }

  trackAddToCart(): void {
    this.journium.track('add_to_cart', {
      product_id: 'prod-001',
      price: 49.99,
      currency: 'USD',
      page: 'products',
    });
  }

  trackCheckout(): void {
    this.journium.track('checkout_initiated', {
      cart_total: 69.98,
      item_count: 2,
      page: 'products',
    });
  }
}
