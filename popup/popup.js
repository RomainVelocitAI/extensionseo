document.addEventListener('DOMContentLoaded', async () => {
  const seoResults = document.getElementById('seo-results');
  const scoreValue = document.getElementById('score-value');
  const exportButton = document.getElementById('export-json');

  // Show loading state
  seoResults.innerHTML = '<div class="loading">Analyzing page...</div>';

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute content script in the active tab
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: analyzePage
    });

    if (results && results[0] && results[0].result) {
      const seoData = results[0].result;
      await displayResults(seoData);
      setupExport(seoData);
    }
  } catch (error) {
    console.error('Error analyzing page:', error);
    seoResults.innerHTML = '<div class="error">Error analyzing page. Please try again.</div>';
  }

  function analyzePage() {
    // Get basic page info
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || 'Not found';
    const h1 = document.querySelector('h1')?.textContent || 'Not found';
    const canonical = document.querySelector('link[rel="canonical"]')?.href || 'Not found';
    const isHTTPS = window.location.protocol === 'https:';
    
    // Count headings
    const headingCounts = {};
    for (let i = 1; i <= 6; i++) {
      const headings = document.querySelectorAll(`h${i}`);
      headingCounts[`h${i}`] = headings.length;
    }
    
    // Calculate page size
    const pageSize = (new TextEncoder().encode(document.documentElement.outerHTML).length / 1024).toFixed(2);
    
    // Count words
    const text = document.body.innerText || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Check robots.txt
    const robotsTxtUrl = new URL('/robots.txt', window.location.origin).href;
    
    return {
      url: window.location.href,
      title,
      metaDescription,
      h1,
      headingCounts,
      canonical,
      isHTTPS,
      pageSize,
      wordCount,
      robotsTxtUrl
    };
  }

  function calculateScore(seoData) {
    let score = 0;
    
    if (seoData.title && seoData.title.length > 0) score += 15;
    if (seoData.metaDescription && seoData.metaDescription.length > 0) score += 15;
    if (seoData.h1 && seoData.h1 !== 'Not found') score += 15;
    if (seoData.isHTTPS) score += 10;
    if (seoData.hasRobotsTxt) score += 10;
    if (seoData.canonical && seoData.canonical !== 'Not found') score += 10;
    if (seoData.wordCount > 300) score += 10;
    if (parseFloat(seoData.pageSize) < 500) score += 15;
    
    return score;
  }

  async function checkRobotsTxt(url) {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async function displayResults(seoData) {
    // Check robots.txt asynchronously
    const hasRobotsTxt = await checkRobotsTxt(seoData.robotsTxtUrl);
    seoData.hasRobotsTxt = hasRobotsTxt;
    
    // Calculate final score
    const score = calculateScore(seoData);
    scoreValue.textContent = score;
    
    // Update score circle color based on score
    const scoreCircle = document.querySelector('.score-circle');
    if (score >= 70) {
      scoreCircle.style.background = '#27ae60'; // Green
    } else if (score >= 40) {
      scoreCircle.style.background = '#f39c12'; // Orange
    } else {
      scoreCircle.style.background = '#e74c3c'; // Red
    }
    
    // Prepare results HTML
    let html = `
      <div class="result-item">
        <span class="result-label">URL:</span>
        <span class="result-value" title="${seoData.url}">${seoData.url.length > 30 ? seoData.url.substring(0, 27) + '...' : seoData.url}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Title:</span>
        <span class="result-value ${seoData.title ? 'pass' : 'fail'}" title="${seoData.title}">
          ${seoData.title ? '✓ Present' : '✗ Missing'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">Meta Description:</span>
        <span class="result-value ${seoData.metaDescription !== 'Not found' ? 'pass' : 'fail'}" title="${seoData.metaDescription}">
          ${seoData.metaDescription !== 'Not found' ? '✓ Present' : '✗ Missing'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">H1:</span>
        <span class="result-value ${seoData.h1 !== 'Not found' ? 'pass' : 'fail'}" title="${seoData.h1}">
          ${seoData.h1 !== 'Not found' ? '✓ Present' : '✗ Missing'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">Headings:</span>
        <span class="result-value">${Object.entries(seoData.headingCounts).map(([h, count]) => `${h}: ${count}`).join(', ')}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Canonical:</span>
        <span class="result-value ${seoData.canonical !== 'Not found' ? 'pass' : 'fail'}">
          ${seoData.canonical !== 'Not found' ? '✓ Present' : '✗ Missing'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">HTTPS:</span>
        <span class="result-value ${seoData.isHTTPS ? 'pass' : 'fail'}">
          ${seoData.isHTTPS ? '✓ Active' : '✗ Inactive'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">robots.txt:</span>
        <span class="result-value ${hasRobotsTxt ? 'pass' : 'fail'}">
          ${hasRobotsTxt ? '✓ Found' : '✗ Not found'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">Page Size:</span>
        <span class="result-value ${parseFloat(seoData.pageSize) < 500 ? 'pass' : 'fail'}">
          ${seoData.pageSize} KB ${parseFloat(seoData.pageSize) < 500 ? '(Good)' : '(> 500KB)'}
        </span>
      </div>
      <div class="result-item">
        <span class="result-label">Word Count:</span>
        <span class="result-value ${seoData.wordCount > 300 ? 'pass' : 'fail'}">
          ${seoData.wordCount} words ${seoData.wordCount > 300 ? '(Good)' : '(Consider adding more content)'}
        </span>
      </div>
    `;
    
    seoResults.innerHTML = html;
  }

  function setupExport(seoData) {
    exportButton.addEventListener('click', () => {
      const exportData = {
        url: seoData.url,
        score: parseInt(scoreValue.textContent),
        title: seoData.title,
        metaDescription: seoData.metaDescription,
        h1: seoData.h1,
        headingCounts: seoData.headingCounts,
        canonical: seoData.canonical,
        isHTTPS: seoData.isHTTPS,
        pageSize: seoData.pageSize,
        wordCount: seoData.wordCount,
        hasRobotsTxt: seoData.hasRobotsTxt,
        analyzedAt: new Date().toISOString()
      };
      
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => {
          const originalText = exportButton.textContent;
          exportButton.textContent = 'Copied to clipboard!';
          exportButton.style.backgroundColor = '#27ae60';
          setTimeout(() => {
            exportButton.textContent = originalText;
            exportButton.style.backgroundColor = '#2ecc71';
          }, 2000);
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          alert('Failed to copy to clipboard. Please try again.');
        });
    });
  }
});
