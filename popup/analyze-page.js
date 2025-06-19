// Fonction d'analyse de la page (exécutée dans le contexte de la page)
console.log('Fonction analyzePage() chargée depuis analyze-page.js');

function analyzePage() {
  console.log('Début de l\'analyse de la page...');
  try {
    // Récupérer les informations de base
    const title = document.title;
    const titleLength = title.length;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const metaDescLength = metaDescription.length;
    
    // Analyser les balises H1
    const h1Elements = Array.from(document.getElementsByTagName('h1'));
    const h1 = h1Elements[0]?.textContent || '';
    const h1Count = h1Elements.length;
    
    // Récupérer la balise canonique
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    
    // Vérifier si le site est en HTTPS
    const isHTTPS = window.location.protocol === 'https:';
    
    // Vérifier la présence de la balise viewport
    const viewport = document.querySelector('meta[name="viewport"]')?.content || '';
    const hasViewport = !!viewport;
    
    // Analyser la structure des en-têtes
    const headings = {};
    let headingStructure = [];
    let lastLevel = 0;
    
    for (let i = 1; i <= 6; i++) {
      const hElements = document.getElementsByTagName(`h${i}`);
      headings[`h${i}`] = hElements.length;
      
      // Analyser la structure hiérarchique
      if (hElements.length > 0) {
        const currentLevel = i;
        if (currentLevel > lastLevel + 1) {
          headingStructure.push({
            level: currentLevel,
            issue: `Saut de niveau de H${lastLevel} à H${currentLevel}`
          });
        }
        lastLevel = currentLevel;
      }
    }
    
    // Analyser les images
    const images = {
      total: 0,
      withAlt: 0,
      withoutAlt: 0,
      altTextRatio: 0,
      withDimensions: 0,
      withoutDimensions: 0,
      largeImages: 0
    };
    
    const imgElements = document.getElementsByTagName('img');
    images.total = imgElements.length;
    
    for (const img of imgElements) {
      // Vérifier les attributs alt
      if (img.alt && img.alt.trim() !== '') {
        images.withAlt++;
      } else {
        images.withoutAlt++;
      }
      
      // Vérifier les dimensions
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        images.withDimensions++;
      } else {
        images.withoutDimensions++;
      }
      
      // Détecter les images potentiellement trop grandes
      if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
        images.largeImages++;
      }
    }
    
    images.altTextRatio = images.total > 0 ? Math.round((images.withAlt / images.total) * 100) : 100;
    
    // Analyser les liens
    const links = {
      total: 0,
      internal: 0,
      external: 0,
      noFollow: 0,
      noHref: 0,
      withTitle: 0,
      broken: 0
    };
    
    const linkElements = document.getElementsByTagName('a');
    links.total = linkElements.length;
    
    for (const link of linkElements) {
      const href = link.getAttribute('href');
      
      // Vérifier les liens vides ou avec javascript:
      if (!href || href.startsWith('javascript:')) {
        links.noHref++;
        continue;
      }
      
      // Compter les liens internes/externes
      if (href.startsWith('http')) {
        try {
          if (new URL(href).hostname === window.location.hostname) {
            links.internal++;
          } else {
            links.external++;
          }
        } catch (e) {
          console.warn('URL invalide:', href);
          links.broken++;
        }
      } else {
        links.internal++;
      }
      
      // Vérifier les attributs nofollow et title
      if (link.rel && link.rel.includes('nofollow')) {
        links.noFollow++;
      }
      
      if (link.title && link.title.trim() !== '') {
        links.withTitle++;
      }
    }
    
    // Analyser le contenu textuel
    const text = document.body.innerText || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Analyser les balises meta importantes
    const robots = document.querySelector('meta[name="robots"]')?.content || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
    const ogDescription = document.querySelector('meta[property="og:description"]')?.content || '';
    
    // Vérifier la présence de balises Open Graph
    const hasOpenGraph = document.querySelector('meta[property^="og:"]') !== null;
    
    // Vérifier la présence de balises Twitter Card
    const hasTwitterCard = document.querySelector('meta[name^="twitter:"]') !== null;
    
    console.log('Analyse de la page terminée avec succès');
    
    // Retourner les résultats enrichis
    return {
      title: {
        text: title,
        length: titleLength,
        hasKeywords: title.toLowerCase().includes('seo') || title.toLowerCase().includes('référencement')
      },
      metaDescription: {
        text: metaDescription,
        length: metaDescLength,
        hasKeywords: metaDescription.toLowerCase().includes('seo') || metaDescription.toLowerCase().includes('référencement')
      },
      h1: {
        text: h1,
        count: h1Count,
        length: h1.length
      },
      canonical,
      isHTTPS,
      viewport: {
        present: hasViewport,
        content: viewport
      },
      headings,
      headingStructure,
      images,
      links: {
        ...links,
        titleRatio: links.total > 0 ? Math.round((links.withTitle / links.total) * 100) : 0,
        noFollowRatio: links.total > 0 ? Math.round((links.noFollow / links.total) * 100) : 0
      },
      wordCount,
      meta: {
        robots,
        keywords,
        ogTitle,
        ogDescription,
        hasOpenGraph,
        hasTwitterCard
      },
      url: window.location.href,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la page :', error);
    throw error;
  }
}

// Exporter la fonction dans la portée globale
window.analyzePage = analyzePage;
