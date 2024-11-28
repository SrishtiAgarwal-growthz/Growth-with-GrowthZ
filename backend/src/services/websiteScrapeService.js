import puppeteer from 'puppeteer';

export const scrapeWebsiteContent = async (websiteUrl) => {
  try {
    console.log(`[scrapeWebsiteContent] Scraping website: ${websiteUrl}`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for some environments
    });
    const page = await browser.newPage();

    // Set headers to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Navigate to the website
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Delay to allow for dynamic content loading
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scrape content dynamically
    const scrapedData = await page.evaluate(() => {
      const getInnerTextArray = (selector) => Array.from(document.querySelectorAll(selector)).map((el) => el.innerText.trim());
      const getAttributesArray = (selector, attr) => Array.from(document.querySelectorAll(selector)).map((el) => el.getAttribute(attr));

      return {
        // Metadata
        metadata: {
          title: document.querySelector('title')?.innerText || '',
          metaDescription: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || '',
          canonicalUrl: document.querySelector('link[rel="canonical"]')?.href || '',
        },

        // // Images
        // images: Array.from(document.querySelectorAll('img')).map((img) => ({
        //   src: img.src,
        //   alt: img.alt || 'No alt text',
        // })),

        // Headings
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) => ({
          tag: heading.tagName,
          text: heading.innerText.trim(),
        })),

        // // Buttons
        // buttons: getInnerTextArray('button'),

        // Forms
        forms: Array.from(document.querySelectorAll('form')).map((form) => ({
          action: form.action || '',
          method: form.method || 'GET',
          inputs: Array.from(form.querySelectorAll('input')).map((input) => ({
            name: input.name || '',
            type: input.type || '',
            placeholder: input.placeholder || '',
          })),
        })),

        // Tables
        tables: Array.from(document.querySelectorAll('table')).map((table) => {
          const rows = Array.from(table.querySelectorAll('tr'));
          return rows.map((row) =>
            Array.from(row.querySelectorAll('td, th')).map((cell) => cell.innerText.trim())
          );
        }),

        // Social Media Links
        socialLinks: Array.from(document.querySelectorAll('a')).filter((a) =>
          ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com'].some((domain) =>
            a.href.includes(domain)
          )
        ).map((link) => ({
          platform: link.href.includes('facebook.com') ? 'Facebook' :
                    link.href.includes('twitter.com') ? 'Twitter' :
                    link.href.includes('instagram.com') ? 'Instagram' :
                    link.href.includes('linkedin.com') ? 'LinkedIn' :
                    link.href.includes('youtube.com') ? 'YouTube' : 'Other',
          url: link.href,
        })),

        // Inline Scripts (JavaScript Data)
        scripts: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script) =>
          JSON.parse(script.innerText)
        ),

        // Advertisements
        advertisements: Array.from(document.querySelectorAll('[class*="ad"], [id*="ad"]')).map((ad) => ({
          text: ad.innerText.trim(),
          image: ad.querySelector('img')?.src || '',
        })),
      };
    });

    await browser.close();

    console.log(`[scrapeWebsiteContent] Scraped Data:`, scrapedData);
    return scrapedData;
  } catch (error) {
    console.error('[scrapeWebsiteContent] Error:', error.message);
    throw new Error('Failed to scrape website content.');
  }
};
