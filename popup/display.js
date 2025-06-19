/**
 * Affiche les résultats de l'analyse SEO
 * Version simplifiée pour le débogage
 */

// Variables globales

/**
 * Affiche les résultats de l'analyse
 * @param {Object} data - Données d'analyse
 */
async function displayResults(data) {
  console.log('[VelocitAI SEO] === Début de displayResults ===');
  console.log('[VelocitAI SEO] Données reçues:', data ? Object.keys(data) : 'Aucune donnée');
  
  try {
    // Masquer l'indicateur de chargement
    const loadingIndicator = document.getElementById('loading-indicator');
    console.log('[VelocitAI SEO] État de loadingIndicator:', loadingIndicator ? 'Trouvé' : 'Non trouvé');
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
      console.log('[VelocitAI SEO] Indicateur de chargement masqué');
    }
    
    // Afficher le conteneur des résultats
    const resultsContainer = document.getElementById('results');
    console.log('[VelocitAI SEO] État de resultsContainer:', resultsContainer ? 'Trouvé' : 'Non trouvé');
    
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
      console.log('[VelocitAI SEO] Conteneur de résultats affiché');
    } else {
      console.error('[VelocitAI SEO] ERREUR: Conteneur de résultats introuvable');
      showError("Impossible d'afficher les résultats: conteneur introuvable");
      return;
    }
    
    // Vérifier si des données valides ont été fournies
    if (!data) {
      console.error('[VelocitAI SEO] ERREUR: Aucune donnée valide fournie à displayResults');
      showError("Aucune donnée d'analyse disponible.");
      return;
    }
    
    // Mettre à jour chaque section avec les données d'analyse
    console.log('[VelocitAI SEO] Appel de updateSections...');
    try {
      updateSections(data);
      console.log('[VelocitAI SEO] updateSections terminé avec succès');
    } catch (sectionsError) {
      console.error('[VelocitAI SEO] ERREUR dans updateSections:', sectionsError);
      throw new Error(`Erreur lors de la mise à jour des sections: ${sectionsError.message}`);
    }
    
    // Mettre à jour le score global
    console.log('[VelocitAI SEO] Appel de updateGlobalScore...');
    try {
      updateGlobalScore(data);
      console.log('[VelocitAI SEO] updateGlobalScore terminé avec succès');
    } catch (scoreError) {
      console.error('[VelocitAI SEO] ERREUR dans updateGlobalScore:', scoreError);
      throw new Error(`Erreur lors de la mise à jour du score: ${scoreError.message}`);
    }
    
    console.log('[VelocitAI SEO] === Affichage des résultats terminé avec succès ===');
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur lors de l\'affichage des résultats :', error);
    showError("Une erreur est survenue lors de l'affichage des résultats.");
  }
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur à afficher
 */
function showError(message) {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  } else {
    console.error('Impossible d\'afficher le message d\'erreur : élément non trouvé');
  }
}

/**
 * Met à jour toutes les sections avec les données d'analyse
 * @param {Object} data - Données d'analyse complètes
 */
function updateSections(data) {
  try {
    console.log('[VelocitAI SEO] Mise à jour des sections avec les données :', Object.keys(data));
    
    // Mettre à jour chaque section individuellement
    updateSection('structure', data);
    updateSection('security', data);
    updateSection('content', data);
    updateSection('performance', data);
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur lors de la mise à jour des sections :', error);
    showError("Erreur lors de la mise à jour des sections d'analyse.");
  }
}

/**
 * Met à jour une section spécifique avec les résultats d'analyse
 * @param {string} sectionId - Identifiant de la section à mettre à jour
 * @param {Object} data - Données d'analyse complètes
 */
function updateSection(sectionId, data) {
  console.log(`[VelocitAI SEO] === Début de updateSection pour ${sectionId} ===`);
  console.log(`[VelocitAI SEO] Recherche de l'élément: ${sectionId}-content`);
  
  try {
    const sectionElement = document.getElementById(`${sectionId}-content`);
    if (!sectionElement) {
      console.warn(`[VelocitAI SEO] ERREUR: Élément de section non trouvé : ${sectionId}-content`);
      console.log('[VelocitAI SEO] Éléments disponibles dans le document:');
      // Lister tous les éléments avec un ID pour le débogage
      document.querySelectorAll('[id]').forEach(el => {
        console.log(`- ${el.id}`);
      });
      return;
    }
    
    console.log(`[VelocitAI SEO] Élément de section trouvé, vidage du contenu`);
    // Vider la section
    sectionElement.innerHTML = '';
    
    // Appeler la fonction spécifique à la section
    switch (sectionId) {
      case 'structure':
        updateStructureSection(sectionElement, data);
        break;
      case 'security':
        updateSecuritySection(sectionElement, data);
        break;
      case 'content':
        updateContentSection(sectionElement, data);
        break;
      case 'performance':
        updatePerformanceSection(sectionElement, data);
        break;
      default:
        console.warn(`[VelocitAI SEO] Section non gérée : ${sectionId}`);
    }
    
  } catch (error) {
    console.error(`[VelocitAI SEO] Erreur lors de la mise à jour de la section ${sectionId} :`, error);
    showError(`Erreur lors de la mise à jour de la section ${sectionId}.`);
  }
}

/**
 * Crée un élément de résultat simple
 * @param {string} label - Libellé du résultat
 * @param {string} status - Statut (success, warning, error)
 * @param {string} details - Détails du résultat
 * @returns {HTMLElement} - Élément de résultat créé
 */
function createResultItem(label, status, details = '') {
  const item = document.createElement('div');
  item.className = 'result-item';
  
  // Déterminer l'icône et la couleur en fonction du statut
  let statusClass = 'status-success';
  let statusIcon = '✓';
  
  if (status === 'warning') {
    statusClass = 'status-warning';
    statusIcon = '!';
  } else if (status === 'error') {
    statusClass = 'status-error';
    statusIcon = '✗';
  }
  
  item.innerHTML = `
    <div class="result-label">
      <span>${label}</span>
      <span class="result-status ${statusClass}" title="${status}">${statusIcon}</span>
    </div>
    ${details ? `<div class="result-details">${details}</div>` : ''}
  `;
  
  return item;
}

/**
 * Met à jour le score global dans l'interface utilisateur
 * @param {Object} data - Données d'analyse
 */
function updateGlobalScore(data) {
  try {
    console.log('[VelocitAI SEO] === Début de updateGlobalScore ===');
    console.log('[VelocitAI SEO] Données reçues:', data ? Object.keys(data) : 'Aucune donnée');
    
    // Calculer le score global
    const score = calculateScore(data);
    const roundedScore = Math.round(score);
    console.log('[VelocitAI SEO] Score calculé:', roundedScore);
    
    // Mettre à jour l'affichage du score
    console.log('[VelocitAI SEO] Recherche des éléments du score');
    const scoreElement = document.getElementById('score');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const scoreContainer = document.querySelector('.score-circle');
    
    if (scoreElement && progressCircle && scoreContainer) {
      console.log('[VelocitAI SEO] Éléments trouvés, mise à jour du score');
      
      // Mettre à jour le texte du score
      scoreElement.textContent = roundedScore;
      
      // Mettre à jour la classe de couleur en fonction du score
      console.log('[VelocitAI SEO] Mise à jour des classes CSS pour le score:', roundedScore);
      
      // Supprimer les classes de score existantes
      scoreContainer.classList.remove('score-low', 'score-medium', 'score-high');
      
      // Ajouter la classe appropriée en fonction du score
      let scoreClass = 'score-high';
      if (roundedScore < 40) {
        scoreClass = 'score-low';
      } else if (roundedScore < 70) {
        scoreClass = 'score-medium';
      }
      scoreContainer.classList.add(scoreClass);
      
      console.log('[VelocitAI SEO] Classes CSS appliquées:', scoreContainer.className);
      
      // Animer le cercle de progression
      const progress = roundedScore / 100;
      console.log('[VelocitAI SEO] Animation du cercle avec progression:', progress);
      
      // Mettre à jour la propriété CSS personnalisée pour l'animation
      progressCircle.style.setProperty('--progress', progress);
      
      // Forcer le recalcul des styles pour déclencher l'animation
      void progressCircle.offsetWidth;
      
      console.log('[VelocitAI SEO] Animation du cercle lancée');
    } else {
      console.error('[VelocitAI SEO] ERREUR: Éléments du score non trouvés dans le DOM');
      console.log('[VelocitAI SEO] Éléments disponibles:');
      document.querySelectorAll('*[id]').forEach(el => {
        console.log(`- #${el.id}`);
      });
    }
    
    console.log(`[VelocitAI SEO] Score global mis à jour : ${roundedScore}`);
    return roundedScore;
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur lors de la mise à jour du score global :', error);
    return 0;
  }
}

/**
 * Calcule le score SEO global à partir des données d'analyse
 * @param {Object} data - Données d'analyse
 * @returns {number} - Score SEO global (0-100)
 */
function calculateScore(data) {
  try {
    console.log('[VelocitAI SEO] Calcul du score avec les données :', data);
    
    if (!data) {
      console.error('Aucune donnée fournie pour le calcul du score');
      return 0;
    }
    
    let score = 0;
    let totalWeight = 0;
    
    // Poids pour chaque catégorie
    const weights = {
      title: 15,
      metaDescription: 10,
      headings: 10,
      images: 10,
      links: 15,
      security: 20,
      performance: 10,
      mobile: 10
    };
    
    // Calculer le score pour chaque catégorie
    
    // 1. Titre
    if (data.title) {
      const titleLength = data.title.length;
      const titleScore = titleLength >= 30 && titleLength <= 60 ? 100 : 
                        titleLength > 0 ? 50 : 0;
      score += (titleScore * weights.title) / 100;
      totalWeight += weights.title;
    }
    
    // 2. Meta description
    if (data.metaDescription) {
      const descLength = data.metaDescription.length;
      const descScore = descLength >= 120 && descLength <= 160 ? 100 :
                       descLength > 0 ? 50 : 0;
      score += (descScore * weights.metaDescription) / 100;
      totalWeight += weights.metaDescription;
    }
    
    // 3. En-têtes (H1, H2, etc.)
    if (data.headings) {
      const h1Count = data.headings.h1 || 0;
      const h2Count = data.headings.h2 || 0;
      
      let headingsScore = 0;
      if (h1Count === 1) headingsScore += 50; // Un seul H1
      if (h2Count > 0) headingsScore += 25;   // Au moins un H2
      if (data.headingStructure && data.headingStructure.length === 0) headingsScore += 25; // Structure valide
      
      score += (headingsScore * weights.headings) / 100;
      totalWeight += weights.headings;
    }
    
    // 4. Images
    if (data.images) {
      const imgScore = data.images.altTextRatio || 0; // Pourcentage d'images avec alt
      score += (imgScore * weights.images) / 100;
      totalWeight += weights.images;
    }
    
    // 5. Liens
    if (data.links) {
      const brokenLinks = data.links.broken || 0;
      const totalLinks = (data.links.internal || 0) + (data.links.external || 0);
      const linksScore = totalLinks > 0 ? Math.max(0, 100 - (brokenLinks / totalLinks * 100)) : 100;
      
      score += (linksScore * weights.links) / 100;
      totalWeight += weights.links;
    }
    
    // 6. Sécurité (HTTPS, etc.)
    if (data.isHTTPS !== undefined) {
      const securityScore = data.isHTTPS ? 100 : 0;
      score += (securityScore * weights.security) / 100;
      totalWeight += weights.security;
    }
    
    // 7. Performance (simplifiée)
    if (data.images && data.images.largeImages !== undefined) {
      const perfScore = data.images.largeImages === 0 ? 100 : 50;
      score += (perfScore * weights.performance) / 100;
      totalWeight += weights.performance;
    }
    
    // 8. Mobile (viewport)
    if (data.viewport && data.viewport.present) {
      const mobileScore = 100; // Viewport présent
      score += (mobileScore * weights.mobile) / 100;
      totalWeight += weights.mobile;
    }
    
    // Calculer le score final (moyenne pondérée)
    const finalScore = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
    
    console.log(`[VelocitAI SEO] Score calculé : ${finalScore} (${totalWeight} points de poids)`);
    return Math.min(100, Math.max(0, Math.round(finalScore))); // S'assurer que le score est entre 0 et 100
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur lors du calcul du score :', error);
    return 0;
  }
}

// Fonctions pour mettre à jour chaque section
function updateStructureSection(container, data) {
  if (!container || !data) return;
  
  container.innerHTML = '';
  
  // Titre de la page
  if (data.title) {
    const titleStatus = data.title.length >= 30 && data.title.length <= 60 ? 'success' : 'warning';
    container.appendChild(createResultItem(
      `Titre de la page (${data.title.length} caractères)`,
      titleStatus,
      `"${data.title.text}"`
    ));
  }
  
  // Balises H1
  if (data.h1) {
    const h1Status = data.h1.count === 1 ? 'success' : 'error';
    container.appendChild(createResultItem(
      `Balises H1 (${data.h1.count} trouvée${data.h1.count !== 1 ? 's' : ''})`,
      h1Status,
      data.h1.count === 1 ? `"${data.h1.text}"` : 'Une seule balise H1 est recommandée par page.'
    ));
  }
  
  // Structure des en-têtes
  if (data.headings) {
    const headingsStatus = Object.values(data.headings).some(count => count > 0) ? 'success' : 'warning';
    const headingsText = Object.entries(data.headings)
      .filter(([_, count]) => count > 0)
      .map(([tag, count]) => `${tag}: ${count}`)
      .join(', ');
      
    container.appendChild(createResultItem(
      'Structure des en-têtes',
      headingsStatus,
      headingsText || 'Aucun en-tête trouvé.'
    ));
  }
  
  // Balise viewport
  if (data.viewport) {
    const viewportStatus = data.viewport.present ? 'success' : 'error';
    container.appendChild(createResultItem(
      'Balise viewport pour mobile',
      viewportStatus,
      data.viewport.present 
        ? 'La balise viewport est correctement définie.' 
        : 'La balise viewport est manquante. Essentiel pour le mobile.'
    ));
  }
}

function updateSecuritySection(container, data) {
  if (!container || !data) return;
  
  container.innerHTML = '';
  
  // HTTPS
  container.appendChild(createResultItem(
    'Connexion sécurisée (HTTPS)',
    data.isHTTPS ? 'success' : 'error',
    data.isHTTPS 
      ? 'Votre site utilise une connexion sécurisée.' 
      : 'Votre site n\'utilise pas HTTPS. Cela peut affecter votre référencement et la sécurité.'
  ));
  
  // Balise canonique
  const canonicalStatus = data.canonical ? 'success' : 'warning';
  container.appendChild(createResultItem(
    'URL canonique',
    canonicalStatus,
    data.canonical 
      ? `Canonical: ${data.canonical}` 
      : 'Aucune balise canonique trouvée. Recommandé pour éviter le contenu dupliqué.'
  ));
  
  // Balise meta robots
  const robotsStatus = data.meta.robots ? 'success' : 'warning';
  container.appendChild(createResultItem(
    'Directives pour les robots',
    robotsStatus,
    data.meta.robots 
      ? `Directives: ${data.meta.robots}` 
      : 'Aucune directive robots spécifiée. Les moteurs de recherche indexeront normalement cette page.'
  ));
}

function updateContentSection(container, data) {
  if (!container || !data) return;
  
  container.innerHTML = '';
  
  // Meta description
  if (data.metaDescription) {
    const descStatus = data.metaDescription.length >= 120 && data.metaDescription.length <= 160 ? 'success' : 'warning';
    container.appendChild(createResultItem(
      `Meta description (${data.metaDescription.length} caractères)`,
      descStatus,
      `"${data.metaDescription.text}"`
    ));
  }
  
  // Mots-clés
  const keywordsStatus = data.meta.keywords ? 'success' : 'warning';
  container.appendChild(createResultItem(
    'Mots-clés meta',
    keywordsStatus,
    data.meta.keywords 
      ? `Mots-clés: ${data.meta.keywords}` 
      : 'Aucun mot-clé meta défini. Moins important pour le référencement moderne, mais toujours utile.'
  ));
  
  // Nombre de mots
  if (data.wordCount) {
    const wordCountStatus = data.wordCount >= 300 ? 'success' : 'warning';
    container.appendChild(createResultItem(
      `Contenu textuel (${data.wordCount} mots)`,
      wordCountStatus,
      wordCountStatus === 'success' 
        ? 'Votre contenu a une bonne longueur.' 
        : 'Un contenu plus long (300+ mots) est généralement mieux référencé.'
    ));
  }
  
  // Images
  if (data.images) {
    const imagesStatus = data.images.altTextRatio >= 80 ? 'success' : 'warning';
    container.appendChild(createResultItem(
      `Images (${data.images.total} au total, ${data.images.withAlt} avec texte alternatif)`,
      imagesStatus,
      `Taux de balises alt: ${data.images.altTextRatio}%`
    ));
  }
}

function updatePerformanceSection(container, data) {
  if (!container || !data) return;
  
  container.innerHTML = '';
  
  // Liens
  if (data.links) {
    const linksStatus = data.links.broken === 0 ? 'success' : 'error';
    container.appendChild(createResultItem(
      `Liens (${data.links.total} au total, ${data.links.broken || 0} cassés)`,
      linksStatus,
      linksStatus === 'success' 
        ? 'Aucun lien cassé détecté.' 
        : 'Certains liens semblent cassés. Vérifiez-les.'
    ));
  }
  
  // Open Graph
  const ogStatus = data.meta.hasOpenGraph ? 'success' : 'warning';
  container.appendChild(createResultItem(
    'Balises Open Graph',
    ogStatus,
    ogStatus === 'success' 
      ? 'Les balises Open Graph sont configurées.' 
      : 'Les balises Open Graph sont recommandées pour un meilleur partage sur les réseaux sociaux.'
  ));
  
  // Twitter Cards
  const twitterStatus = data.meta.hasTwitterCard ? 'success' : 'info';
  container.appendChild(createResultItem(
    'Cartes Twitter',
    twitterStatus,
    twitterStatus === 'success' 
      ? 'Les cartes Twitter sont configurées.' 
      : 'Les cartes Twitter sont recommandées pour un meilleur affichage lors du partage sur Twitter.'
  ));
  
  // Images volumineuses
  if (data.images && data.images.largeImages > 0) {
    container.appendChild(createResultItem(
      'Images volumineuses',
      'warning',
      `${data.images.largeImages} image(s) volumineuse(s) détectée(s). Cela peut ralentir le chargement de la page.`
    ));
  }
}

// Exposer les fonctions globalement
window.displayResults = displayResults;
