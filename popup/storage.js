/**
 * Module de stockage pour VelocitAI SEO Checker
 * Gère la persistance des données d'analyse et l'historique
 */

/**
 * Sauvegarde les résultats d'analyse dans le stockage Chrome
 * @param {Object} data - Données d'analyse
 * @returns {Promise<boolean>} - Succès de l'opération
 */
async function saveAnalysisToStorage(data) {
  try {
    console.log('[VelocitAI SEO][STORAGE] Sauvegarde en cours...');
    
    const storageKey = `analysis_${data.url}_${Date.now()}`;
    const analysisData = {
      ...data,
      id: storageKey,
      savedAt: new Date().toISOString()
    };
    
    // Sauvegarder dans le stockage Chrome
    await chrome.storage.local.set({
      [storageKey]: analysisData,
      lastAnalysis: analysisData
    });
    
    // Mettre à jour la liste des analyses récentes
    await updateRecentAnalyses(storageKey, data.url);
    
    console.log('[VelocitAI SEO][STORAGE] Sauvegarde réussie:', storageKey);
    return true;
    
  } catch (error) {
    console.error('[VelocitAI SEO][STORAGE] Erreur de sauvegarde:', error);
    return false;
  }
}

/**
 * Met à jour la liste des analyses récentes
 * @param {string} analysisId - ID de l'analyse
 * @param {string} url - URL analysée
 */
async function updateRecentAnalyses(analysisId, url) {
  try {
    const result = await chrome.storage.local.get(['recentAnalyses']);
    let recentAnalyses = result.recentAnalyses || [];
    
    // Ajouter la nouvelle analyse en tête
    recentAnalyses.unshift({
      id: analysisId,
      url: url,
      timestamp: Date.now()
    });
    
    // Garder seulement les 10 plus récentes
    recentAnalyses = recentAnalyses.slice(0, 10);
    
    await chrome.storage.local.set({ recentAnalyses });
    
  } catch (error) {
    console.error('[VelocitAI SEO][STORAGE] Erreur mise à jour analyses récentes:', error);
  }
}

/**
 * Récupère la dernière analyse depuis le stockage
 * @returns {Promise<Object|null>} - Dernière analyse ou null
 */
async function getLastAnalysis() {
  try {
    const result = await chrome.storage.local.get(['lastAnalysis']);
    return result.lastAnalysis || null;
  } catch (error) {
    console.error('[VelocitAI SEO][STORAGE] Erreur récupération dernière analyse:', error);
    return null;
  }
}

/**
 * Récupère la liste des analyses récentes
 * @returns {Promise<Array>} - Liste des analyses récentes
 */
async function getRecentAnalyses() {
  try {
    const result = await chrome.storage.local.get(['recentAnalyses']);
    return result.recentAnalyses || [];
  } catch (error) {
    console.error('[VelocitAI SEO][STORAGE] Erreur récupération analyses récentes:', error);
    return [];
  }
}

/**
 * Nettoie le stockage en supprimant les anciennes analyses
 * @param {number} maxAge - Âge maximum en jours (défaut: 30)
 */
async function cleanupOldAnalyses(maxAge = 30) {
  try {
    console.log('[VelocitAI SEO][STORAGE] Nettoyage des anciennes analyses...');
    
    const cutoffDate = Date.now() - (maxAge * 24 * 60 * 60 * 1000);
    const recentAnalyses = await getRecentAnalyses();
    
    // Filtrer les analyses à supprimer
    const toDelete = recentAnalyses
      .filter(analysis => analysis.timestamp < cutoffDate)
      .map(analysis => analysis.id);
    
    if (toDelete.length > 0) {
      // Supprimer du stockage
      await chrome.storage.local.remove(toDelete);
      
      // Mettre à jour la liste des analyses récentes
      const updatedRecent = recentAnalyses.filter(analysis => analysis.timestamp >= cutoffDate);
      await chrome.storage.local.set({ recentAnalyses: updatedRecent });
      
      console.log(`[VelocitAI SEO][STORAGE] ${toDelete.length} analyses supprimées`);
    }
    
  } catch (error) {
    console.error('[VelocitAI SEO][STORAGE] Erreur nettoyage:', error);
  }
}

// Exposer les fonctions dans la portée globale
window.saveAnalysisToStorage = saveAnalysisToStorage;
window.getLastAnalysis = getLastAnalysis;
window.getRecentAnalyses = getRecentAnalyses;
window.cleanupOldAnalyses = cleanupOldAnalyses;

console.log('[VelocitAI SEO][STORAGE] Module de stockage chargé');