/**
 * Module d'export pour VelocitAI SEO Checker
 * Gère l'export des résultats d'analyse en différents formats
 */

// Variable globale pour stocker les derniers résultats d'analyse
let lastAnalysisResults = null;

/**
 * Sauvegarde les résultats d'analyse pour export ultérieur
 * @param {Object} data - Données d'analyse complètes
 */
function saveAnalysisResults(data) {
  console.log('[VelocitAI SEO][EXPORT] Sauvegarde des résultats pour export');
  lastAnalysisResults = {
    ...data,
    exportedAt: new Date().toISOString(),
    version: chrome.runtime.getManifest().version
  };
}

/**
 * Exporte les résultats vers le presse-papier au format JSON
 * @returns {Promise<boolean>} - Succès de l'opération
 */
async function exportToClipboard() {
  console.log('[VelocitAI SEO][EXPORT] Export vers presse-papier');
  
  if (!lastAnalysisResults) {
    showActionFeedback('Aucune donnée à exporter. Effectuez d\'abord une analyse.', 'error');
    return false;
  }

  try {
    // Formater les données pour un affichage lisible
    const exportData = {
      url: lastAnalysisResults.url,
      analyzedAt: lastAnalysisResults.analyzedAt,
      score: calculateGlobalScore(lastAnalysisResults),
      
      // Données principales
      title: {
        text: lastAnalysisResults.title?.text || '',
        length: lastAnalysisResults.title?.length || 0,
        optimal: lastAnalysisResults.title?.length >= 30 && lastAnalysisResults.title?.length <= 60
      },
      
      metaDescription: {
        text: lastAnalysisResults.metaDescription?.text || '',
        length: lastAnalysisResults.metaDescription?.length || 0,
        optimal: lastAnalysisResults.metaDescription?.length >= 120 && lastAnalysisResults.metaDescription?.length <= 160
      },
      
      headings: {
        h1Count: lastAnalysisResults.h1?.count || 0,
        h1Text: lastAnalysisResults.h1?.text || '',
        structure: lastAnalysisResults.headings || {}
      },
      
      security: {
        https: lastAnalysisResults.isHTTPS || false,
        canonical: !!lastAnalysisResults.canonical
      },
      
      content: {
        wordCount: lastAnalysisResults.wordCount || 0,
        images: lastAnalysisResults.images || {},
        links: lastAnalysisResults.links || {}
      },
      
      mobile: {
        viewport: lastAnalysisResults.viewport?.present || false
      },
      
      meta: lastAnalysisResults.meta || {}
    };

    // Copier vers le presse-papier
    await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    
    showActionFeedback('Résultats copiés dans le presse-papier !', 'success');
    console.log('[VelocitAI SEO][EXPORT] Export JSON réussi');
    return true;
    
  } catch (error) {
    console.error('[VelocitAI SEO][EXPORT] Erreur lors de l\'export:', error);
    showActionFeedback('Erreur lors de l\'export vers le presse-papier.', 'error');
    return false;
  }
}

/**
 * Exporte les résultats au format texte lisible
 * @returns {Promise<boolean>} - Succès de l'opération
 */
async function exportToText() {
  console.log('[VelocitAI SEO][EXPORT] Export vers format texte');
  
  if (!lastAnalysisResults) {
    showActionFeedback('Aucune donnée à exporter. Effectuez d\'abord une analyse.', 'error');
    return false;
  }

  try {
    const score = calculateGlobalScore(lastAnalysisResults);
    const data = lastAnalysisResults;
    
    // Générer un rapport texte lisible
    const report = `
VelocitAI SEO Checker - Rapport d'Analyse
==========================================

URL: ${data.url}
Date d'analyse: ${new Date(data.analyzedAt).toLocaleString('fr-FR')}
Score SEO Global: ${score}/100

STRUCTURE DE LA PAGE
====================
• Titre: ${data.title?.text || 'Aucun'} (${data.title?.length || 0} caractères)
  ${data.title?.length >= 30 && data.title?.length <= 60 ? '✓ Longueur optimale' : '⚠ Longueur non optimale (30-60 caractères recommandés)'}

• Meta Description: ${data.metaDescription?.text || 'Aucune'} (${data.metaDescription?.length || 0} caractères)
  ${data.metaDescription?.length >= 120 && data.metaDescription?.length <= 160 ? '✓ Longueur optimale' : '⚠ Longueur non optimale (120-160 caractères recommandés)'}

• Balises H1: ${data.h1?.count || 0} trouvée(s)
  ${data.h1?.count === 1 ? '✓ Nombre optimal' : '⚠ Il est recommandé d\'avoir exactement une balise H1'}
  ${data.h1?.text ? `Contenu: "${data.h1.text}"` : ''}

• Structure des en-têtes:
${Object.entries(data.headings || {}).map(([tag, count]) => `  - ${tag.toUpperCase()}: ${count}`).join('\n')}

SÉCURITÉ ET TECHNIQUE
=====================
• HTTPS: ${data.isHTTPS ? '✓ Activé' : '✗ Non activé (recommandé)'}
• Balise canonique: ${data.canonical ? '✓ Présente' : '⚠ Absente'}
• Viewport mobile: ${data.viewport?.present ? '✓ Configuré' : '✗ Non configuré'}

CONTENU
=======
• Nombre de mots: ${data.wordCount || 0}
  ${data.wordCount >= 300 ? '✓ Contenu substantiel' : '⚠ Contenu court (300+ mots recommandés)'}

• Images: ${data.images?.total || 0} au total
  - Avec attribut alt: ${data.images?.withAlt || 0}
  - Sans attribut alt: ${data.images?.withoutAlt || 0}
  - Taux d'optimisation: ${data.images?.altTextRatio || 0}%

• Liens: ${data.links?.total || 0} au total
  - Internes: ${data.links?.internal || 0}
  - Externes: ${data.links?.external || 0}

MÉTADONNÉES SOCIALES
====================
• Open Graph: ${data.meta?.hasOpenGraph ? '✓ Configuré' : '⚠ Non configuré'}
• Twitter Cards: ${data.meta?.hasTwitterCard ? '✓ Configuré' : '⚠ Non configuré'}
• Mots-clés meta: ${data.meta?.keywords || 'Aucun'}

---
Rapport généré par VelocitAI SEO Checker v${chrome.runtime.getManifest().version}
${new Date().toLocaleString('fr-FR')}
`;

    // Copier vers le presse-papier
    await navigator.clipboard.writeText(report);
    
    showActionFeedback('Rapport texte copié dans le presse-papier !', 'success');
    console.log('[VelocitAI SEO][EXPORT] Export texte réussi');
    return true;
    
  } catch (error) {
    console.error('[VelocitAI SEO][EXPORT] Erreur lors de l\'export texte:', error);
    showActionFeedback('Erreur lors de l\'export du rapport.', 'error');
    return false;
  }
}

/**
 * Calcule le score global à partir des données d'analyse
 * @param {Object} data - Données d'analyse
 * @returns {number} - Score sur 100
 */
function calculateGlobalScore(data) {
  if (!data) return 0;
  
  let score = 0;
  let totalChecks = 0;
  
  // Titre (15 points)
  if (data.title) {
    totalChecks += 15;
    if (data.title.length >= 30 && data.title.length <= 60) {
      score += 15;
    } else if (data.title.length > 0) {
      score += 8;
    }
  }
  
  // Meta description (10 points)
  if (data.metaDescription) {
    totalChecks += 10;
    if (data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
      score += 10;
    } else if (data.metaDescription.length > 0) {
      score += 5;
    }
  }
  
  // H1 (15 points)
  if (data.h1) {
    totalChecks += 15;
    if (data.h1.count === 1) {
      score += 15;
    } else if (data.h1.count > 0) {
      score += 8;
    }
  }
  
  // HTTPS (20 points)
  totalChecks += 20;
  if (data.isHTTPS) {
    score += 20;
  }
  
  // Viewport mobile (10 points)
  totalChecks += 10;
  if (data.viewport?.present) {
    score += 10;
  }
  
  // Images avec alt (10 points)
  if (data.images) {
    totalChecks += 10;
    score += Math.round((data.images.altTextRatio || 0) / 10);
  }
  
  // Contenu (10 points)
  totalChecks += 10;
  if (data.wordCount >= 300) {
    score += 10;
  } else if (data.wordCount > 0) {
    score += Math.round((data.wordCount / 300) * 10);
  }
  
  // Canonique (10 points)
  totalChecks += 10;
  if (data.canonical) {
    score += 10;
  }
  
  // Calculer le pourcentage final
  return totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 0;
}

/**
 * Affiche un message de feedback à l'utilisateur
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message (success, error, info)
 */
function showActionFeedback(message, type = 'info') {
  const feedbackElement = document.getElementById('action-feedback');
  if (!feedbackElement) return;
  
  // Nettoyer les classes précédentes
  feedbackElement.className = 'action-feedback';
  feedbackElement.classList.add(type);
  feedbackElement.textContent = message;
  feedbackElement.style.display = 'block';
  
  // Masquer automatiquement après 3 secondes
  setTimeout(() => {
    feedbackElement.style.display = 'none';
  }, 3000);
}

/**
 * Gestionnaire pour le bouton d'export
 * Affiche un menu avec les options d'export
 */
function handleExportClick() {
  console.log('[VelocitAI SEO][EXPORT] Bouton export cliqué');
  
  if (!lastAnalysisResults) {
    showActionFeedback('Aucune donnée à exporter. Effectuez d\'abord une analyse.', 'error');
    return;
  }
  
  // Pour l'instant, exporter directement au format texte
  // TODO: Implémenter un menu déroulant avec les options
  exportToText();
}

// Exposer les fonctions dans la portée globale
window.saveAnalysisResults = saveAnalysisResults;
window.exportToClipboard = exportToClipboard;
window.exportToText = exportToText;
window.handleExportClick = handleExportClick;
window.showActionFeedback = showActionFeedback;

console.log('[VelocitAI SEO][EXPORT] Module d\'export chargé');