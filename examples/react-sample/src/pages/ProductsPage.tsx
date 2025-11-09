import React from 'react';
import { useTrackEvent } from '@journium/react';
import { Link } from 'react-router-dom';

export function ProductsPage() {
  const trackEvent = useTrackEvent();

  const products = [
    { id: 'prod_1', name: 'Premium Analytics Plan', price: 99, category: 'saas' },
    { id: 'prod_2', name: 'Basic Dashboard', price: 29, category: 'saas' },
    { id: 'prod_3', name: 'Enterprise Solution', price: 299, category: 'enterprise' }
  ];

  const handleProductView = (product: typeof products[0]) => {
    trackEvent('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category,
      page: 'products'
    });
  };

  const handleAddToCart = (product: typeof products[0]) => {
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category,
      page: 'products',
      action: 'add_to_cart'
    });
  };

  return (
    <div className="app-content">
      <header>
        <h1>🛍️ Products - Browse Our Offerings</h1>
        <nav style={{margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link>
          <Link to="/settings" className="nav-link">⚙️ Settings</Link>
          <Link to="/products" className="nav-link">🛍️ Products</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
        <p>This page demonstrates e-commerce tracking with automatic pageviews.</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Product Catalog</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '20px 0'}}>
            {products.map((product) => (
              <div key={product.id} 
                   style={{
                     padding: '20px', 
                     border: '1px solid #ddd', 
                     borderRadius: '8px',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: '10px'
                   }}>
                <h3>{product.name}</h3>
                <p style={{color: '#666', fontSize: '0.9em', textTransform: 'uppercase'}}>
                  {product.category}
                </p>
                <p style={{fontSize: '1.5em', fontWeight: 'bold', color: '#007acc'}}>
                  ${product.price}/month
                </p>
                <div className="button-group" style={{flexDirection: 'column', gap: '10px'}}>
                  <button 
                    className="demo-button"
                    onClick={() => handleProductView(product)}
                  >
                    View Details
                  </button>
                  <button 
                    className="demo-button purchase"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="demo-section">
          <h2>Product Actions</h2>
          <div className="button-group">
            <button 
              className="demo-button"
              onClick={() => trackEvent('view_all_products', {page: 'products', filter: 'all'})}
            >
              View All Products
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('filter_products', {page: 'products', filter: 'saas'})}
            >
              Filter by SaaS
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('sort_products', {page: 'products', sort_by: 'price'})}
            >
              Sort by Price
            </button>
          </div>
        </section>

        <section className="demo-section info">
          <h2>🛍️ Products Page Events</h2>
          <ul>
            <li><strong>Page Load:</strong> Automatic pageview tracking for /products route</li>
            <li><strong>Product Views:</strong> Individual product detail viewing</li>
            <li><strong>Cart Actions:</strong> Add to cart tracking with product details</li>
            <li><strong>Catalog Actions:</strong> Filtering, sorting, browsing events</li>
            <li><strong>E-commerce Data:</strong> Product IDs, prices, categories tracked</li>
          </ul>
        </section>
      </main>
    </div>
  );
}