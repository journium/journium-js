const puppeteer = require('puppeteer');

async function testElementsChain() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    console.log('Clicking on Dashboard button...');
    await page.click('button:text("Track Event")'); // Click a button to trigger autocapture
    
    await page.waitForTimeout(1000);
    
    console.log('Clicking on navigation links...');
    await page.click('a[href="/dashboard"]'); // Click navigation link
    
    await page.waitForTimeout(2000);
    
    console.log('Clicking on more buttons...');
    await page.click('button'); // Click any button on dashboard
    
    await page.waitForTimeout(2000);
    
    console.log('Test completed. Check events monitor for autocapture events with elements chain data.');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testElementsChain().catch(console.error);
}