// Fichier principal de l'extension - Point d'entrée de l'application

// Variable pour stocker les données d'analyse
let currentAnalysisData = null;

// Configuration du handshake
// Configuration pour les futures fonctionnalités
const CONFIG = {
  // Configuration à définir selon les besoins
};

// Variables pour gérer l'état de préparation du script de contenu
let isContentScriptReady = false;
let pendingAnalysis = false;

// Variables pour gérer l'état de l'analyse (déclarées plus bas dans le fichier)
let isAnalysisInProgress = false;
let lastAnalysisTimestamp = 0;
let lastProcessedRequestId = null;
let currentTabId = null;
const ANALYSIS_COOLDOWN_MS = 3000; // 3 secondes de délai entre les analyses

// Détection du thème
function detectTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Réinitialiser l'analyse
function resetAnalysis() {
  const seoResults = document.getElementById('seo-results');
  if (seoResults) {
    seoResults.style.display = 'none';
    seoResults.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Analyse de la page en cours...</p>
      </div>
    `;
  }
  
  // Réinitialiser le score
  updateScoreCircle(0);
  const scoreElement = document.getElementById('score-value');
  if (scoreElement) {
    scoreElement.textContent = '0';
  }
  
  // Relancer l'analyse
  startAnalysis();
}

// La fonction initAccordions a été déplacée dans display.js
// pour résoudre les problèmes de portée et éviter les initialisations multiples

// Initialiser les écouteurs de messages
function setupMessageListeners() {
  // Gestionnaire de messages du service worker
  const handleRuntimeMessage = (message, sender, sendResponse) => {
    // Vérifier que le message est destiné à ce popup
    if (message.tabId && message.tabId !== currentTabId) {
      console.log('Message ignoré - destiné à un autre onglet:', message.tabId);
      return false;
    }
    
    console.log('Message reçu dans popup.js:', message);
    
    try {
      switch (message.type) {
        case 'ANALYSIS_COMPLETE':
          console.log('Analyse terminée avec succès, traitement des données...', {
            requestId: message.requestId,
            hasData: !!message.data
          });
          
          // Vérifier si nous avons déjà traité ces données
          if (lastProcessedRequestId === message.requestId) {
            console.log('Message déjà traité, ignore...', message.requestId);
            return true;
          }
          
          lastProcessedRequestId = message.requestId;
          isAnalysisInProgress = false;
          
          // Mettre à jour l'interface utilisateur avec les résultats
          if (message.data) {
            handleAnalysisResult(message.data);
          } else {
            console.error('Aucune donnée reçue dans ANALYSIS_COMPLETE');
            showError('Aucune donnée reçue du service d\'analyse');
          }
          return true;
          
        case 'ANALYSIS_ERROR':
          console.error('Erreur d\'analyse:', message.error);
          isAnalysisInProgress = false;
          
          // Afficher le message d'erreur avec un bouton de réessai
          const seoResults = document.getElementById('seo-results');
          if (seoResults) {
            seoResults.innerHTML = `
              <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message.error || 'Erreur inconnue'}</p>
                <button id="retry-button" class="retry-button">
                  <i class="fas fa-sync-alt"></i> Réessayer
                </button>
              </div>
            `;
            
            // Ajouter un écouteur d'événements pour le bouton de réessai
            document.getElementById('retry-button').addEventListener('click', () => {
              startAnalysis();
            });
          }
          return true;
          
        case 'ANALYSIS_PROGRESS':
          console.log('Progression de l\'analyse:', message.progress);
          // Mettre à jour la barre de progression si nécessaire
          return true;
          
        default:
          console.log('Type de message non géré:', message.type);
          return false;
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error, message);
      isAnalysisInProgress = false;
      showError('Erreur lors du traitement des résultats');
      return false;
    }
  };
  
  // Écouter les messages du service worker
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  
  // Vérifier périodiquement les réponses dans le stockage local
  // (solution de secours en cas d'échec des messages)
  const checkForStoredResponse = () => {
    if (!isAnalysisInProgress || !chrome.storage || !chrome.storage.local) {
      return;
    }
    
    try {
      chrome.storage.local.get('lastAnalysisResponse', (result) => {
        if (result && result.lastAnalysisResponse && 
            result.lastAnalysisResponse.tabId === currentTabId) {
          console.log('[VelocitAI SEO] Récupération de la réponse depuis le stockage local');
          handleRuntimeMessage(result.lastAnalysisResponse);
          // Nettoyer la réponse après utilisation
          chrome.storage.local.remove('lastAnalysisResponse');
        }
      });
    } catch (error) {
      console.error('[VelocitAI SEO] Erreur lors de l\'accès au stockage local:', error.message);
    }
  };
  
  // Vérifier toutes les secondes si une réponse est disponible
  const storageCheckInterval = setInterval(checkForStoredResponse, 1000);
  
  // Nettoyer l'intervalle lorsque le popup est fermé
  window.addEventListener('unload', () => {
    clearInterval(storageCheckInterval);
  });
}

// Initialiser l'application
function initializeApp() {
  try {
    console.log('Initialisation de l\'application...');
    
    // Détecter le thème
    detectTheme();
    
    // Les accordéons seront initialisés après le chargement des résultats
    // dans la fonction displayResults
    
    // Ajouter les écouteurs d'événements
    const resetBtn = document.getElementById('reset-analysis');
    const exportBtn = document.getElementById('export-json');
    
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAnalysis);
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', exportAnalysisReport);
    }
    
    // Configurer les écouteurs de messages
    setupMessageListeners();
    
    // Démarrer l'analyse
    startAnalysis();
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application :', error);
    
    // Afficher un message d'erreur
    const seoResults = document.getElementById('seo-results');
    if (seoResults) {
      seoResults.innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Erreur lors du chargement de l'application</p>
          <p>${error.message || 'Erreur inconnue'}</p>
          <button id="retry-btn" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Réessayer
          </button>
        </div>
      `;
      
      // Ajouter un écouteur d'événement pour le bouton de réessai
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', initializeApp);
      }
    }
  }
}

// Démarrer l'analyse de la page active
async function startAnalysis() {
  // Vérifier si une analyse est déjà en cours
  if (isAnalysisInProgress) {
    console.log('[VelocitAI SEO] Analyse déjà en cours, nouvelle demande ignorée');
    return Promise.resolve();
  }
  
  // Vérifier le délai minimum entre les analyses
  const currentTime = Date.now();
  if (currentTime - lastAnalysisTimestamp < ANALYSIS_COOLDOWN_MS) {
    console.log('[VelocitAI SEO] Délai entre les analyses non respecté, attente...');
    return Promise.resolve();
  }
  
  console.log('[VelocitAI SEO] Démarrage de l\'analyse SEO');
  isAnalysisInProgress = true;
  
  // Afficher l'indicateur de chargement
  const loadingIndicator = document.getElementById('loading-indicator');
  const seoResults = document.getElementById('seo-results');
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  if (seoResults) {
    seoResults.innerHTML = '';
    seoResults.style.display = 'block';
  }
  
  // Récupérer l'onglet actif
  console.log('Récupération de l\'onglet actif pour l\'analyse');
  
  // Réinitialiser l'état d'analyse en cas d'erreur
  const resetAnalysisState = () => {
    isAnalysisInProgress = false;
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  };
  
  try {
    // Récupérer l'onglet actif
    const [tab] = await new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!tabs || tabs.length === 0) {
          reject(new Error('Aucun onglet actif trouvé'));
        } else {
          resolve(tabs);
        }
      });
    });
    
    // Vérifier si l'URL est valide (http ou https)
    if (!tab.url || !tab.url.startsWith('http')) {
      throw new Error(`Impossible d'analyser cette page (${tab.url}). Veuillez charger une page web valide (http ou https).`);
    }
    
    // Envoi de la requête d'analyse au service worker
    
    try {
      // Préparation de la requête d'analyse
      
      // Envoyer la demande d'analyse directement au service worker
      chrome.runtime.sendMessage(
        { 
          type: 'START_ANALYSIS', 
          tabId: tab.id,
          timestamp: new Date().toISOString() 
        },
        (response) => {
          // Cette fonction de rappel est optionnelle dans Chrome
          // et peut ne pas être appelée si le service worker ne répond pas
          if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message || 'Erreur inconnue';
            console.error('Erreur runtime lors de l\'envoi du message:', chrome.runtime.lastError);
            showError(`Erreur de communication avec le service d'analyse: ${errorMsg}`);
            return;
          }
          
          // La réponse peut être undefined si le service worker n'a pas envoyé de réponse
          // Ce n'est pas nécessairement une erreur, car les résultats peuvent arriver via onMessage
          console.log('Réponse reçue du service worker');
          
          // Si nous avons une réponse avec une erreur, l'afficher
          if (response && response.error) {
            console.error('Erreur du service:', response.error);
            showError(response.error);
          } else if (response && response.type === 'ANALYSIS_ERROR') {
            console.error('Erreur d\'analyse:', response.error);
            showError(response.error || 'Erreur lors de l\'analyse');
          } else if (response && response.type === 'ANALYSIS_COMPLETE') {
            console.log('[VelocitAI SEO] Analyse terminée avec succès');
            handleAnalysisResult(response.data);
          } else if (response) {
            console.warn('[VelocitAI SEO] Réponse inattendue du service:', response.type);
            // Ne pas considérer cela comme une erreur critique
            // Les résultats peuvent arriver via onMessage
          }
        }
      );
      
      // Requête d'analyse envoyée avec succès
      
    } catch (error) {
      console.error('[VelocitAI SEO] Erreur lors de l\'envoi de la requête d\'analyse:', error.message);
      showError(`Erreur lors du démarrage de l'analyse: ${error.message || 'Erreur inconnue'}`);
    }
    
    // L'analyse se poursuivra de manière asynchrone
    return Promise.resolve();
    
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'analyse:', error);
    
    // Afficher un message d'erreur
    const seoResults = document.getElementById('seo-results');
    if (seoResults) {
      seoResults.innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Erreur lors du démarrage de l'analyse</p>
          <p>${error.message || 'Erreur inconnue'}</p>
          <button id="retry-btn" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Réessayer
          </button>
        </div>
      `;
      
      // Ajouter un écouteur d'événement pour le bouton de réessai
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', startAnalysis);
      }
    }
    
    throw error; // Propager l'erreur pour un traitement ultérieur si nécessaire
  }
}

// Exporter le rapport d'analyse
function exportAnalysisReport() {
  if (!currentAnalysisData) {
    console.warn('Aucune donnée d\'analyse à exporter');
    return;
  }
  
  try {
    // Créer un objet avec les données à exporter
    const exportData = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      score: currentAnalysisData.score,
      results: currentAnalysisData.results
    };
    
    // Créer un blob avec les données
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Déclencher le téléchargement
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Erreur lors de l\'exportation du rapport :', error);
    alert('Une erreur est survenue lors de l\'exportation du rapport');
  }
}

// Stocker les données d'analyse actuelles
function storeAnalysisData(data) {
  currentAnalysisData = data;
  console.log('Données d\'analyse stockées:', data);
}

// Afficher un message d'erreur dans l'interface utilisateur
function showError(message) {
  console.error('Erreur:', message);
  
  // Récupérer l'élément des résultats ou en créer un si nécessaire
  let resultsDiv = document.getElementById('seo-results');
  if (!resultsDiv) {
    const app = document.getElementById('app');
    if (app) {
      resultsDiv = document.createElement('div');
      resultsDiv.id = 'seo-results';
      app.appendChild(resultsDiv);
    } else {
      console.error('Impossible d\'afficher l\'erreur: élément #app non trouvé');
      return;
    }
  }
  
  // Afficher le message d'erreur
  resultsDiv.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Erreur</h3>
      <p>${typeof message === 'string' ? message : 'Une erreur inconnue est survenue'}</p>
      <button id="retry-button" class="btn btn-primary">
        <i class="fas fa-sync-alt"></i> Réessayer
      </button>
    </div>
  `;
  
  // Ajouter un écouteur d'événements pour le bouton de réessai
  const retryButton = document.getElementById('retry-button');
  if (retryButton) {
    retryButton.addEventListener('click', startAnalysis);
  }
}

// Variables pour suivre l'état de l'analyse (déjà déclarées en haut du fichier)

// Gérer les résultats de l'analyse
function handleAnalysisResult(data) {
  // Vérifier si nous avons déjà traité ces données récemment
  const currentTime = Date.now();
  const analyzedTime = data.analyzedAt ? new Date(data.analyzedAt).getTime() : 0;
  
  if (analyzedTime > 0 && analyzedTime <= lastAnalysisTimestamp) {
    console.log('Analyse déjà traitée, ignore...');
    return;
  }
  
  // Mettre à jour le timestamp de la dernière analyse
  lastAnalysisTimestamp = Math.max(currentTime, analyzedTime);
  
  try {
    // Journalisation des données reçues
    console.log('[VelocitAI SEO] Données reçues pour analyse', {
      type: typeof data,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : []
    });
    
    // Stocker les données d'analyse
    storeAnalysisData(data);
    
    // Mettre à jour l'interface utilisateur avec les résultats
    const seoResults = document.getElementById('seo-results');
    if (seoResults) {
      try {
        seoResults.style.display = 'block';
        
        // Afficher les résultats détaillés (y compris le calcul du score)
        // L'initialisation des accordéons est gérée dans displayResults
        displayResults(data).catch(error => {
          console.error('Erreur lors de l\'affichage des résultats:', error);
          throw error; // Propager l'erreur pour qu'elle soit capturée par le bloc catch externe
        });
      } catch (displayError) {
        console.error('Erreur lors de l\'affichage des résultats:', displayError);
        seoResults.innerHTML = `
          <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erreur d'affichage</h3>
            <p>Impossible d'afficher les résultats de l'analyse.</p>
            <p>${displayError.message || 'Erreur inconnue'}</p>
            <button id="retry-btn" class="btn btn-primary">
              <i class="fas fa-sync-alt"></i> Réessayer
            </button>
          </div>
        `;
        
        // Ajouter un écouteur d'événement pour le bouton de réessai
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => handleAnalysisResult(data));
        }
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du traitement des résultats de l\'analyse :', error);
    
    // Afficher un message d'erreur
    const seoResults = document.getElementById('seo-results');
    if (seoResults) {
      seoResults.innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Erreur lors du traitement des résultats</p>
          <p>${error.message || 'Erreur inconnue'}</p>
          <button id="retry-btn" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Réessayer
          </button>
        </div>
      `;
      
      // Ajouter un écouteur d'événement pour le bouton de réessai
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', startAnalysis);
      }
    }
  }
}

// Fonction pour vérifier si le DOM est prêt
function domReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    // Le DOM est déjà chargé
    setTimeout(callback, 0);
  }
}

// Démarrer l'application lorsque le DOM est chargé
domReady(() => {
  console.log('DOM complètement chargé, initialisation de l\'application...');
  
  // Attendre un court instant supplémentaire pour s'assurer que tous les éléments sont disponibles
  setTimeout(() => {
    try {
      initializeApp();
    } catch (error) {
      console.error('Erreur critique lors de l\'initialisation:', error);
      document.body.innerHTML = `
        <div class="error">
          <h2>Erreur critique</h2>
          <p>Impossible de démarrer l'application.</p>
          <p>${error.message || 'Erreur inconnue'}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            <i class="fas fa-sync-alt"></i> Recharger
          </button>
        </div>
      `;
    }
  }, 100);
});

// Écouter les changements de thème
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
darkModeMediaQuery.addListener(detectTheme);
