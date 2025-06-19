/**
 * Fichier principal de l'extension - Version simplifiée
 * Gère l'interface utilisateur et la communication avec le script de fond
 */

// Variables d'état
let currentAnalysisData = null;
let isAnalyzing = false;
let lastAnalysisTimestamp = 0;
const ANALYSIS_COOLDOWN_MS = 3000; // 3 secondes de délai entre les analyses

// Fonction pour initialiser les sections réductibles
function initCollapsibleSections() {
  console.log('[VelocitAI SEO] Initialisation des sections réductibles...');
  
  // Récupérer toutes les en-têtes de section
  const sectionHeaders = document.querySelectorAll('.section-header');
  
  sectionHeaders.forEach(header => {
    // Ajouter un écouteur d'événements pour le clic
    header.addEventListener('click', function() {
      const section = this.closest('.section');
      const wasCollapsed = section.classList.contains('collapsed');
      
      // Fermer toutes les sections si la touche Ctrl est enfoncée
      if (event.ctrlKey) {
        document.querySelectorAll('.section').forEach(s => {
          s.classList.add('collapsed');
        });
        if (!wasCollapsed) return;
      }
      
      // Basculer l'état de la section cliquée
      section.classList.toggle('collapsed');
      
      // Sauvegarder l'état dans le stockage local
      const sectionId = this.getAttribute('data-section');
      if (sectionId) {
        const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
        collapsedSections[sectionId] = section.classList.contains('collapsed');
        localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
      }
    });
    
    // Restaurer l'état précédent des sections
    const sectionId = header.getAttribute('data-section');
    if (sectionId) {
      const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
      if (collapsedSections[sectionId]) {
        header.closest('.section').classList.add('collapsed');
      }
    }
  });
  
  console.log('[VelocitAI SEO] Sections réductibles initialisées');
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('[VelocitAI SEO][POPUP] DOM chargé, initialisation de l\'extension');
  
  try {
    // Vérifier que les éléments clés du DOM sont présents
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContainer = document.getElementById('results');
    
    console.log('[VelocitAI SEO][POPUP] Éléments DOM:', {
      loadingIndicator: !!loadingIndicator,
      resultsContainer: !!resultsContainer,
      hasDisplayResults: typeof window.displayResults === 'function'
    });
    
    // Initialiser les sections réductibles
    initCollapsibleSections();
    
    // Démarrer l'analyse automatiquement au chargement
    console.log('[VelocitAI SEO][POPUP] Démarrage automatique de l\'analyse...');
    startAnalysis();
    
    // Configurer les écouteurs d'événements
    console.log('[VelocitAI SEO][POPUP] Configuration des écouteurs d\'événements...');
    setupEventListeners();
    
    console.log('[VelocitAI SEO][POPUP] Initialisation terminée avec succès');
  } catch (error) {
    console.error('[VelocitAI SEO][POPUP] Erreur lors de l\'initialisation:', error);
  }
});

/**
 * Configure les écouteurs d'événements de l'interface utilisateur
 */
function setupEventListeners() {
  // Écouter les messages du script de fond
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
  
  console.log('[VelocitAI SEO] Écouteurs d\'événements configurés');
}

/**
 * Gère les messages reçus du script de fond
 * @param {Object} message - Message reçu
 * @param {Object} sender - Expéditeur du message
 * @param {Function} sendResponse - Fonction de réponse
 */
function handleBackgroundMessage(message, sender, sendResponse) {
  const requestId = message.requestId || 'N/A';
  console.log(`[VelocitAI SEO][POPUP] Message reçu (ID: ${requestId}):`, {
    type: message.type,
    hasData: !!message.data,
    error: message.error || 'none',
    sender: sender.id
  });
  
  try {
    switch (message.type) {
      case 'ANALYSIS_RESULT':
        console.log(`[VelocitAI SEO][POPUP] Traitement des résultats d'analyse (ID: ${requestId})`);
        handleAnalysisResult(message.data);
        break;
        
      case 'ANALYSIS_ERROR':
        console.error(`[VelocitAI SEO][POPUP] Erreur d'analyse (ID: ${requestId}):`, message.error);
        showError(message.error || 'Erreur lors de l\'analyse de la page');
        break;
        
      default:
        console.warn(`[VelocitAI SEO][POPUP] Type de message inconnu (ID: ${requestId}):`, message.type);
    }
  } catch (error) {
    console.error(`[VelocitAI SEO][POPUP] Erreur lors du traitement du message (ID: ${requestId}):`, error);
    showError('Erreur lors du traitement des résultats');
  }
  
  // Indiquer que la réponse sera envoyée de manière asynchrone
  return true;
}

/**
 * Démarre l'analyse de la page active
 */
function startAnalysis() {
  const requestId = Date.now();
  console.log(`[VelocitAI SEO][POPUP] Début de startAnalysis (ID: ${requestId})`);
  
  // Vérifier si une analyse est déjà en cours
  const now = Date.now();
  if (isAnalyzing) {
    console.warn(`[VelocitAI SEO][POPUP] Analyse déjà en cours (ID: ${requestId})`);
    return;
  }
  
  if (now - lastAnalysisTimestamp < ANALYSIS_COOLDOWN_MS) {
    console.warn(`[VelocitAI SEO][POPUP] Délai entre les analyses non écoulé (ID: ${requestId})`);
    return;
  }
  
  console.log(`[VelocitAI SEO][POPUP] Démarrage de l'analyse (ID: ${requestId})`);
  isAnalyzing = true;
  lastAnalysisTimestamp = now;
  
  // Afficher l'indicateur de chargement
  const loadingIndicator = document.getElementById('loading-indicator');
  const resultsContainer = document.getElementById('results');
  const errorMessage = document.getElementById('error-message');
  
  console.log(`[VelocitAI SEO][POPUP] Mise à jour de l'UI (ID: ${requestId}):`, {
    loadingIndicator: !!loadingIndicator,
    resultsContainer: !!resultsContainer,
    errorMessage: !!errorMessage
  });
  
  if (loadingIndicator) loadingIndicator.style.display = 'block';
  if (resultsContainer) resultsContainer.style.display = 'none';
  if (errorMessage) errorMessage.style.display = 'none';
  
  // Envoyer un message au script de fond pour démarrer l'analyse
  console.log(`[VelocitAI SEO][POPUP] Recherche de l'onglet actif (ID: ${requestId})`);
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      const errorMsg = `Erreur lors de la récupération de l'onglet actif: ${chrome.runtime.lastError.message}`;
      console.error(`[VelocitAI SEO][POPUP] ${errorMsg} (ID: ${requestId})`);
      showError('Impossible d\'accéder à l\'onglet actif');
      isAnalyzing = false;
      return;
    }
    
    if (!tabs || tabs.length === 0) {
      console.error(`[VelocitAI SEO][POPUP] Aucun onglet actif trouvé (ID: ${requestId})`);
      showError('Aucun onglet actif trouvé');
      isAnalyzing = false;
      return;
    }
    
    const currentTab = tabs[0];
    console.log(`[VelocitAI SEO][POPUP] Onglet actif trouvé (ID: ${requestId}):`, {
      tabId: currentTab.id,
      url: currentTab.url,
      title: currentTab.title
    });
    
    // Vérifier si l'URL est valide (http ou https)
    if (!currentTab.url || !currentTab.url.startsWith('http')) {
      console.warn(`[VelocitAI SEO][POPUP] URL non valide pour l'analyse (ID: ${requestId}):`, currentTab.url);
      showError('Impossible d\'analyser cette page');
      isAnalyzing = false;
      return;
    }
    
    // Envoyer le message au script de fond
    const message = { 
      type: 'START_ANALYSIS',
      tabId: currentTab.id,
      url: currentTab.url,
      requestId: requestId
    };
    
    console.log(`[VelocitAI SEO][POPUP] Envoi du message au script de fond (ID: ${requestId}):`, message);
    
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error(`[VelocitAI SEO][POPUP] Erreur lors de l'envoi du message (ID: ${requestId}):`, chrome.runtime.lastError);
        showError('Erreur de communication avec l\'extension');
        isAnalyzing = false;
        return;
      }
      
      console.log(`[VelocitAI SEO][POPUP] Réponse du script de fond (ID: ${requestId}):`, {
        type: response?.type,
        hasData: !!response?.data,
        hasError: !!response?.error,
        requestId: response?.requestId
      });
      
      // Traiter la réponse directement
      if (!response) {
        const errorMsg = 'Aucune réponse reçue du script de fond';
        console.error(`[VelocitAI SEO][POPUP] ${errorMsg} (ID: ${requestId})`);
        showError('Erreur lors de la réception des résultats');
        isAnalyzing = false;
        return;
      }
      
      if (response.type === 'ANALYSIS_ERROR') {
        const errorMsg = response.error || 'Erreur inconnue lors de l\'analyse';
        console.error(`[VelocitAI SEO][POPUP] Erreur d'analyse (ID: ${requestId}):`, errorMsg);
        showError(errorMsg);
        isAnalyzing = false;
      } else if (response.type === 'ANALYSIS_RESULT' && response.data) {
        console.log(`[VelocitAI SEO][POPUP] Résultats reçus, traitement... (ID: ${requestId})`);
        handleAnalysisResult(response.data, requestId);
      } else {
        console.warn(`[VelocitAI SEO][POPUP] Réponse inattendue (ID: ${requestId}):`, response);
        showError('Format de réponse inattendu');
        isAnalyzing = false;
      }
    });
  });
}

/**
 * Gère les résultats de l'analyse
 * @param {Object} data - Données d'analyse
 * @param {number} requestId - ID de la requête
 */
function handleAnalysisResult(data, requestId = 'N/A') {
  console.log(`[VelocitAI SEO][POPUP] === Début de handleAnalysisResult (ID: ${requestId}) ===`);
  console.log(`[VelocitAI SEO][POPUP] Données reçues:`, {
    hasData: !!data,
    dataType: data ? typeof data : 'undefined',
    dataKeys: data ? Object.keys(data) : []
  });
  
  try {
    // Vérifier si les données sont valides
    if (!data) {
      const errorMsg = 'Aucune donnée reçue pour l\'analyse';
      console.error(`[VelocitAI SEO][POPUP] ${errorMsg} (ID: ${requestId})`);
      throw new Error(errorMsg);
    }
    
    // Cacher l'indicateur de chargement
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsContainer = document.getElementById('results');
    const errorElement = document.getElementById('error-message');
    
    console.log(`[VelocitAI SEO][POPUP] Éléments DOM (ID: ${requestId}):`, {
      loadingIndicator: loadingIndicator ? 'Trouvé' : 'Non trouvé',
      resultsContainer: resultsContainer ? 'Trouvé' : 'Non trouvé',
      errorElement: errorElement ? 'Trouvé' : 'Non trouvé',
      windowDisplayResults: typeof window.displayResults
    });
    
    // Mettre à jour l'interface utilisateur
    if (loadingIndicator) {
      console.log(`[VelocitAI SEO][POPUP] Masquage de l'indicateur de chargement (ID: ${requestId})`);
      loadingIndicator.style.display = 'none';
    }
    
    if (resultsContainer) {
      console.log(`[VelocitAI SEO][POPUP] Affichage du conteneur de résultats (ID: ${requestId})`);
      resultsContainer.style.display = 'block';
    }
    
    if (errorElement) {
      console.log(`[VelocitAI SEO][POPUP] Masquage des messages d'erreur (ID: ${requestId})`);
      errorElement.style.display = 'none';
    }
    
    // Vérifier si displayResults est disponible
    if (typeof window.displayResults !== 'function') {
      const errorMsg = 'La fonction displayResults n\'est pas disponible dans la portée de window';
      console.error(`[VelocitAI SEO][POPUP] ${errorMsg} (ID: ${requestId})`);
      console.log('[VelocitAI SEO][POPUP] Propriétés de window:', Object.keys(window).filter(k => k.startsWith('display') || k === 'VelocitAI'));
      throw new Error(errorMsg);
    }
    
    console.log(`[VelocitAI SEO][POPUP] Appel de displayResults avec les données (ID: ${requestId})`);
    
    // Appel direct sans setTimeout pour simplifier le débogage
    try {
      window.displayResults(data);
      console.log(`[VelocitAI SEO][POPUP] Affichage des résultats terminé avec succès (ID: ${requestId})`);
    } catch (displayError) {
      console.error(`[VelocitAI SEO][POPUP] Erreur lors de l'appel à displayResults (ID: ${requestId}):`, displayError);
      console.error('[VelocitAI SEO][POPUP] Stack trace:', displayError.stack);
      throw new Error(`Erreur d'affichage: ${displayError.message}`);
    }
    
  } catch (error) {
    console.error(`[VelocitAI SEO][POPUP] Erreur dans handleAnalysisResult (ID: ${requestId}):`, error);
    showError(error.message || 'Erreur lors du traitement des résultats');
  } finally {
    // Toujours réinitialiser l'état de l'analyse, même en cas d'erreur
    console.log(`[VelocitAI SEO][POPUP] Réinitialisation de l'état d'analyse (ID: ${requestId})`);
    isAnalyzing = false;
  }
}

/**
 * Affiche un message d'erreur dans l'interface utilisateur
 * @param {string} message - Message d'erreur à afficher
 */
function showError(message) {
  console.error(`[VelocitAI SEO] Erreur: ${message}`);
  
  const errorMessage = document.getElementById('error-message');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // Masquer l'indicateur de chargement
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  // Afficher le message d'erreur
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  }
  
  isAnalysisInProgress = false;
}

// Exposer les fonctions dans la portée globale
window.handleAnalysisResult = handleAnalysisResult;
window.showError = showError;
window.startAnalysis = startAnalysis;
