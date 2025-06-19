// Script de fond pour gérer l'analyse SEO
// Log de démarrage du service worker
console.log('[VelocitAI SEO][BACKGROUND] Service Worker démarré - v' + chrome.runtime.getManifest().version);

// Fonction utilitaire pour formater les logs avec un ID de requête
function logWithId(id, ...args) {
  const prefix = id ? `[VelocitAI SEO][BACKGROUND][${id}]` : '[VelocitAI SEO][BACKGROUND]';
  console.log(prefix, ...args);
}

// Fonction utilitaire pour formater les erreurs avec un ID de requête
function errorWithId(id, ...args) {
  const prefix = id ? `[VelocitAI SEO][BACKGROUND][${id}]` : '[VelocitAI SEO][BACKGROUND]';
  console.error(prefix, ...args);
}

// Variable pour suivre l'état de l'analyse
let isAnalyzing = false;

// Fonction utilitaire pour formater les erreurs
function formatError(error) {
  if (!error) return 'Aucune information sur l\'erreur';
  if (typeof error === 'string') return error;
  return error.message || JSON.stringify(error);
}

/**
 * Exécute l'analyse SEO sur l'onglet spécifié
 * @param {number} tabId - ID de l'onglet à analyser
 * @param {string} requestId - ID unique de la requête pour le suivi
 * @returns {Promise<Object>} Résultats de l'analyse
 */
async function runAnalysis(tabId, requestId = 'N/A') {
  const log = (...args) => logWithId(requestId, ...args);
  const error = (...args) => errorWithId(requestId, ...args);
  
  log(`Début de l'analyse pour l'onglet ${tabId}`);
  
  if (isAnalyzing) {
    const errorMsg = 'Une analyse est déjà en cours';
    error(errorMsg);
    throw new Error(errorMsg);
  }
  
  isAnalyzing = true;
  log('Démarrage de l\'analyse...');
  
  try {
    // 1. Vérifier que l'onglet est toujours valide
    log('Vérification de l\'onglet...');
    const tab = await new Promise((resolve, reject) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          const errorMsg = `Impossible d'accéder à l'onglet: ${chrome.runtime.lastError.message}`;
          error(errorMsg);
          reject(new Error(errorMsg));
        } else {
          log(`Onglet trouvé: ${tab.url}`);
          resolve(tab);
        }
      });
    });
    
    // 2. Injecter le script d'analyse dans la page
    log('Injection du script d\'analyse...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['popup/analyze-page.js']
      });
      log('Script d\'analyse injecté avec succès');
    } catch (injectError) {
      error('Erreur lors de l\'injection du script:', injectError);
      throw new Error(`Échec de l'injection du script: ${injectError.message}`);
    }
    
    // 3. Exécuter la fonction d'analyse
    log('Exécution de la fonction d\'analyse...');
    let results;
    try {
      results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          try {
            if (typeof window.analyzePage === 'function') {
              return window.analyzePage();
            } else {
              throw new Error('La fonction d\'analyse n\'est pas disponible dans le contexte de la page');
            }
          } catch (e) {
            console.error('Erreur dans analyzePage:', e);
            throw e;
          }
        }
      });
      log('Fonction d\'analyse exécutée avec succès');
    } catch (execError) {
      error('Erreur lors de l\'exécution de l\'analyse:', execError);
      throw new Error(`Échec de l'exécution de l'analyse: ${execError.message}`);
    }
    
    // 4. Vérifier les résultats
    log('Vérification des résultats...');
    if (!results || !results[0]) {
      const errorMsg = 'Aucun résultat retourné par l\'analyse';
      error(errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!results[0].result) {
      const errorMsg = 'Résultat vide retourné par l\'analyse';
      error(errorMsg, { results });
      throw new Error(errorMsg);
    }
    
    const resultData = results[0].result;
    log('Analyse terminée avec succès', { 
      resultKeys: Object.keys(resultData),
      hasTitle: !!resultData.title,
      hasMeta: !!resultData.meta,
      resultSummary: {
        title: resultData.title?.text?.substring(0, 50) + (resultData.title?.text?.length > 50 ? '...' : ''),
        url: resultData.url,
        analyzedAt: resultData.analyzedAt
      }
    });
    
    return resultData;
    
  } catch (error) {
    error('Erreur critique lors de l\'analyse:', error);
    throw error; // Renvoyer l'erreur pour qu'elle soit gérée par l'appelant
  } finally {
    log('Nettoyage après analyse...');
    isAnalyzing = false;
    log('Analyse terminée, état réinitialisé');
  }
}

/**
 * Gestionnaire de messages pour la communication avec le popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const requestId = request.requestId || `req_${Date.now()}`;
  const log = (...args) => logWithId(requestId, ...args);
  const error = (...args) => errorWithId(requestId, ...args);
  
  log('Message reçu:', {
    type: request.type,
    sender: sender?.tab?.url || 'unknown',
    tabId: request.tabId,
    hasRequestId: !!request.requestId
  });
  
  // Démarrer l'analyse depuis le popup
  if (request.type === 'START_ANALYSIS') {
    log('Traitement de la demande d\'analyse...');
    
    if (!request.tabId) {
      const errorMsg = 'ID d\'onglet manquant dans la requête';
      error(errorMsg);
      
      try {
        sendResponse({
          type: 'ANALYSIS_ERROR',
          error: errorMsg,
          tabId: null,
          requestId: requestId
        });
      } catch (e) {
        error('Erreur lors de l\'envoi de la réponse d\'erreur:', e);
      }
      return true; // Garder le canal ouvert pour la réponse
    }
    
    // Stocker si la réponse a déjà été envoyée
    let responseSent = false;
    
    /**
     * Envoie une réponse de manière fiable
     * @param {string} type - Type de réponse (ANALYSIS_RESULT, ANALYSIS_ERROR)
     * @param {Object|null} data - Données de la réponse
     * @param {string|null} errorMsg - Message d'erreur éventuel
     */
    const sendAnalysisResponse = (type, data = null, errorMsg = null) => {
      if (responseSent) {
        log('Réponse déjà envoyée, nouvel envoi ignoré:', type);
        return;
      }
      
      responseSent = true;
      const response = { 
        type, 
        tabId: request.tabId,
        requestId: requestId
      };
      
      if (data) response.data = data;
      if (errorMsg) response.error = errorMsg;
      
      log(`Envoi de la réponse: ${type}`, { 
        hasData: !!data,
        hasError: !!errorMsg 
      });
      
      // Fonction pour envoyer via runtime.sendMessage
      const sendRuntimeMessage = () => {
        chrome.runtime.sendMessage(response)
          .catch(e => {
            error('Échec de l\'envoi du message via runtime.sendMessage:', e);
            // Réessayer après un court délai
            setTimeout(sendRuntimeMessage, 100);
          });
      };
      
      // Essayer d'abord avec sendResponse
      if (sendResponse) {
        try {
          sendResponse(response);
          return;
        } catch (e) {
          error('Erreur avec sendResponse, bascule vers runtime.sendMessage:', e);
        }
      }
      
      // Fallback sur runtime.sendMessage
      sendRuntimeMessage();
    };
    
    // Démarrer l'analyse de manière asynchrone
    (async () => {
      try {
        const result = await runAnalysis(request.tabId, requestId);
        sendAnalysisResponse('ANALYSIS_RESULT', result);
      } catch (error) {
        error('Erreur lors de l\'analyse:', error);
        sendAnalysisResponse('ANALYSIS_ERROR', null, formatError(error));
      }
    })();
    
    // Indiquer que la réponse sera asynchrone
    return true;
  }
  
  // Pour les autres types de messages
  const warningMsg = `Type de message non géré: ${request.type}`;
  log(warningMsg);
  
  try {
    sendResponse({
      success: false,
      error: warningMsg,
      requestId: requestId
    });
  } catch (sendError) {
    error('Échec de l\'envoi de la réponse pour le message non géré:', sendError);
  }
  
  return false; // Ne pas garder le canal ouvert pour les messages non gérés
});
