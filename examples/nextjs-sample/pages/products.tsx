import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTrackEvent } from '@journium/nextjs';
import styles from '../styles/Home.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const sampleProducts: Product[] = [
  { id: 'prod_1', name: 'Next.js Masterclass', price: 149.99, category: 'education' },
  { id: 'prod_2', name: 'React Hooks Guide', price: 79.99, category: 'education' },
  { id: 'prod_3', name: 'TypeScript Pro', price: 99.99, category: 'education' },
];

export default function Products() {
  const trackEvent = useTrackEvent();
  const [viewedProducts, setViewedProducts] = useState<Set<string>>(new Set());

  const handleProductView = (product: Product) => {
    if (!viewedProducts.has(product.id)) {
      setViewedProducts(prev => new Set(Array.from(prev).concat(product.id)));
      trackEvent('product_viewed', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
        page: 'products'
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
      category: product.category,
      quantity: 1,
      source: 'products_page'
    });
  };

  const handlePurchase = (product: Product) => {
    trackEvent('purchase_completed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
      category: product.category,
      quantity: 1,
      payment_method: 'credit_card',
      source: 'products_page'
    });
  };

  return (
    <>
      <Head>
        <title>Products - Journium Next.js Sample</title>
        <meta name="description" content="Product catalog with Journium event tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>📦 Products</h1>
          <p className={styles.description}>
            Browse our sample product catalog and see e-commerce event tracking in action.
          </p>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2>Product Catalog</h2>
            <div className={styles.productGrid}>
              {sampleProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={styles.productCard}
                  onMouseEnter={() => handleProductView(product)}
                >
                  <h3>{product.name}</h3>
                  <p className={styles.price}>${product.price}</p>
                  <p className={styles.category}>{product.category}</p>
                  <div className={styles.productActions}>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className={`${styles.button} ${styles.cart}`}
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => handlePurchase(product)}
                      className={`${styles.button} ${styles.purchase}`}
                    >
                      Buy Now
                    </button>
                  </div>
                  {viewedProducts.has(product.id) && (
                    <div className={styles.viewedBadge}>Viewed ✓</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.info}`}>
            <h2>🛍️ E-commerce Tracking Features</h2>
            <ul>
              <li><strong>Product Views:</strong> Tracked when you hover over a product</li>
              <li><strong>Add to Cart:</strong> Tracked with full product details</li>
              <li><strong>Purchase Events:</strong> Complete transaction tracking</li>
              <li><strong>Page Analytics:</strong> Product catalog pageview with metadata</li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}