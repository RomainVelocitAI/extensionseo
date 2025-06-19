/**
 * Évalue l'état du titre de la page
 * @param {Object} titleData - Données du titre (text, length, hasKeywords)
 * @returns {Object} Statut et recommandations
 */
function getTitleStatus(titleData) {
  // Vérifier si les données de titre sont valides
  if (!titleData) {
    return {
      status: 'error',
      message: 'Données de titre manquantes',
      tips: 'Impossible d\'analyser le titre de la page. Les données nécessaires sont manquantes.'
    };
  }
  
  const title = titleData.text || '';
  const length = titleData.length || 0;
  const hasKeywords = titleData.hasKeywords || false;
  
  // Si le titre est vide
  if (!title && length === 0) {
    return {
      status: 'fail',
      message: 'Aucun titre trouvé',
      tips: 'Ajoutez une balise <title> descriptive contenant votre mot-clé principal.'
    };
  }
  
  // Vérifier la longueur du titre
  let status = 'pass';
  let message = 'Titre optimal';
  let tips = 'Parfait ! Votre titre a une longueur optimale pour le référencement.';
  
  if (length < 30) {
    status = 'warning';
    message = 'Titre trop court';
    tips = `Votre titre fait ${length} caractères. Essayez d'atteindre 50-60 caractères en ajoutant des mots-clés pertinents.`;
  } else if (length > 60) {
    status = 'warning';
    message = 'Titre trop long';
    tips = `Votre titre fait ${length} caractères. Essayez de le réduire à 60 caractères maximum pour éviter la troncature dans les résultats de recherche.`;
  }
  
  // Vérifier la présence de mots-clés
  if (hasKeywords) {
    tips += ' Les mots-clés pertinents ont été détectés dans votre titre.';
  } else {
    tips += ' Essayez d\'inclure des mots-clés pertinents dans votre titre pour améliorer le référencement.';
  }
  
  return { status, message, tips };
}

/**
 * Évalue l'état de la méta description
 * @param {Object} metaData - Données de la méta description (text, length)
 * @returns {Object} Statut et recommandations
 */
function getMetaDescriptionStatus(metaData) {
  const description = metaData.text || '';
  const length = description.length;
  
  if (!description) {
    return {
      status: 'fail',
      message: 'Aucune méta description',
      tips: 'Ajoutez une méta description attrayante qui résume le contenu de la page.'
    };
  }
  
  if (length < 70) {
    return {
      status: 'warning',
      message: 'Description trop courte',
      tips: `Votre description fait ${length} caractères. Essayez d'atteindre 120-150 caractères pour une meilleure lisibilité.`
    };
  }
  
  if (length > 160) {
    return {
      status: 'warning',
      message: 'Description trop longue',
      tips: `Votre description fait ${length} caractères. Essayez de la réduire à 160 caractères maximum pour éviter la troncature.`
    };
  }
  
  return {
    status: 'pass',
}

/**
 * Met à jour une section spécifique avec les résultats d'analyse
 * @param {string} sectionId - Identifiant de la section à mettre à jour
 * @param {Object} data - Données d'analyse complètes
 */
function updateSection(sectionId, data) {
  try {
    const sectionElement = document.getElementById(`${sectionId}-content`);
    if (!sectionElement) {
      console.warn(`[VelocitAI SEO] Élément de section non trouvé : ${sectionId}-content`);
      return;
    }
    
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
 * @returns {Object} Statut et recommandations
 */
function getHeadingsStatus(headingStructure, headings) {
  // Vérifier la présence d'au moins un H1
  if (!headings.h1 || headings.h1 === 0) {
    return {
      status: 'fail',
      title: 'Structure hiérarchique manquante',
      message: 'Aucune balise H1 trouvée',
      tips: 'Ajoutez une balise H1 principale qui décrit le contenu de la page.'
    };
  }
  
  // Vérifier la structure hiérarchique
  if (headingStructure && headingStructure.length > 0) {
    const issues = headingStructure
      .filter(h => h.issue)
      .map(h => `- ${h.issue}`)
      .join('\n');
      
    if (issues) {
      return {
        status: 'warning',
        title: 'Structure hiérarchique à améliorer',
        message: 'Problème(s) détecté(s) dans la hiérarchie des titres',
        tips: `Corrigez les problèmes suivants :\n${issues}`
      };
    }
  }
  
  // Vérifier la présence d'autres niveaux de titres
  const hasSubheadings = Object.entries(headings)
    .filter(([key]) => key !== 'h1')
    .some(([_, count]) => count > 0);
    
  if (!hasSubheadings) {
    return {
      status: 'info',
      title: 'Structure hiérarchique basique',
      message: 'Aucun sous-titre (H2-H6) détecté',
      tips: 'Envisagez d\'ajouter des sous-titres pour structurer votre contenu.'
    };
  }
  
  // Structure optimale
  return {
    status: 'pass',
    title: 'Structure hiérarchique optimale',
    message: 'La hiérarchie des titres est bien structurée',
    tips: 'Parfait ! Votre structure de titres est bien organisée pour le référencement.'
  };
}

/**
 * Évalue l'état de la connexion HTTPS
 * @param {boolean} isHTTPS - Indique si la page utilise HTTPS
 * @returns {Object} Statut et recommandations
 */
function getHttpsStatus(isHTTPS) {
  if (!isHTTPS) {
    return {
      status: 'fail',
      message: 'Connexion non sécurisée',
      tips: 'Passez à HTTPS pour sécuriser les données de vos utilisateurs et améliorer votre classement dans les moteurs de recherche.'
    };
  }
  
  return {
    status: 'pass',
    message: 'Connexion sécurisée',
    tips: 'Parfait ! Votre site utilise une connexion sécurisée HTTPS.'
  };
}

/**
 * Évalue l'état de la balise viewport
 * @param {Object} viewportData - Données de la balise viewport
 * @returns {Object} Statut et recommandations
 */
function getViewportStatus(viewportData) {
  const hasViewport = viewportData.present || false;
  const viewportContent = viewportData.content || '';
  
  if (!hasViewport) {
    return {
      status: 'fail',
      message: 'Balise viewport manquante',
      tips: 'Ajoutez une balise viewport pour assurer un affichage correct sur mobile : <meta name="viewport" content="width=device-width, initial-scale=1">'
    };
  }
  
  // Vérifier si la balise viewport contient les attributs essentiels
  const hasWidth = viewportContent.includes('width=');
  const hasInitialScale = viewportContent.includes('initial-scale=');
  
  if (!hasWidth || !hasInitialScale) {
    return {
      status: 'warning',
      message: 'Balise viewport incomplète',
      tips: 'Votre balise viewport devrait inclure au moins width=device-width et initial-scale=1 pour un affichage optimal sur mobile.'
    };
  }
  
  return {
    status: 'pass',
    message: 'Balise viewport optimale',
    tips: 'Parfait ! Votre balise viewport est correctement configurée pour le responsive design.'
  };
}

/**
 * Évalue l'état de la balise canonique
 * @param {string} canonicalUrl - URL canonique de la page
 * @returns {Object} Statut et recommandations
 */
function getCanonicalStatus(canonicalUrl) {
  if (!canonicalUrl) {
    return {
      status: 'warning',
      message: 'Aucune balise canonique',
      tips: 'Envisagez d\'ajouter une balise canonique pour éviter le contenu en double : <link rel="canonical" href="https://votresite.com/page" />'
    };
  }
  
  // Vérifier si l'URL canonique est absolue
  if (!canonicalUrl.startsWith('http')) {
    return {
      status: 'warning',
      message: 'URL canonique relative',
      tips: 'Utilisez une URL canonique absolue (commençant par http:// ou https://) pour plus de fiabilité.'
    };
  }
  
  // Vérifier si l'URL canonique pointe vers la page actuelle
  const currentUrl = window.location.href.split('?')[0].split('#')[0];
  if (canonicalUrl !== currentUrl) {
    return {
      status: 'info',
      message: 'URL canonique différente',
      tips: `La balise canonique pointe vers une autre URL que la page actuelle. Assurez-vous que c'est intentionnel.\nCanonique: ${canonicalUrl}\nActuelle: ${currentUrl}`
    };
  }
  
  return {
    status: 'pass',
    message: 'Balise canonique optimale',
    tips: 'Parfait ! Votre balise canonique est correctement configurée.'
  };
}

/**
 * Évalue l'état des balises meta robots
 * @param {string} robotsContent - Contenu de la balise meta robots
 * @returns {Object} Statut et recommandations
 */
function getRobotsStatus(robotsContent) {
  if (!robotsContent) {
    return {
      status: 'info',
      message: 'Aucune directive robots',
      tips: 'Aucune balise meta robots trouvée. Par défaut, les moteurs de recherche indexeront la page et suivront les liens.'
    };
  }
  
  const directives = robotsContent.toLowerCase().split(',').map(d => d.trim());
  const hasNoIndex = directives.includes('noindex');
  const hasNoFollow = directives.includes('nofollow');
  
  if (hasNoIndex) {
    return {
      status: 'warning',
      message: 'Page non indexée',
      tips: 'Cette page ne sera pas indexée par les moteurs de recherche. Supprimez "noindex" si vous voulez qu\'elle soit référencée.'
    };
  }
  
  if (hasNoFollow) {
    return {
      status: 'info',
      message: 'Liens non suivis',
      tips: 'Les liens de cette page ne seront pas suivis par les moteurs de recherche (nofollow).'
    };
  }
  
  return {
    status: 'pass',
    message: 'Directives robots optimales',
    tips: 'Parfait ! Votre page est configurée pour être indexée et ses liens suivis.'
  };
}

/**
 * Évalue l'état des images de la page
 * @param {Object} imagesData - Données sur les images de la page
 * @returns {Object} Statut et recommandations
 */
function getImagesStatus(imagesData) {
  const total = imagesData.total || 0;
  const withAlt = imagesData.withAlt || 0;
  const withoutAlt = imagesData.withoutAlt || 0;
  const ratio = imagesData.altTextRatio || 0;
  const largeImages = imagesData.largeImages || 0;
  
  if (total === 0) {
    return {
      status: 'info',
      message: 'Aucune image trouvée',
      tips: 'Envisagez d\'ajouter des images pertinentes pour améliorer l\'engagement des utilisateurs.'
    };
  }
  
  if (withoutAlt > 0) {
    return {
      status: 'warning',
      message: `${withAlt}/${total} images avec texte alternatif`,
      tips: `${withoutAlt} image(s) n'ont pas d'attribut alt. Ajoutez des descriptions textuelles pour améliorer l'accessibilité et le référencement.`
    };
  }
  
  if (largeImages > 0) {
    return {
      status: 'warning',
      message: `${largeImages} image(s) potentiellement trop grande(s)`,
      tips: 'Les images de plus de 2000px de largeur ou hauteur peuvent ralentir le chargement de la page. Redimensionnez ou compressez ces images.'
    };
  }
  
  return {
    status: 'pass',
    message: `${withAlt}/${total} images avec texte alternatif`,
    tips: 'Parfait ! Toutes vos images ont un attribut alt descriptif.'
  };
}

/**
 * Évalue la qualité globale du contenu
 * @param {Object} contentData - Données sur le contenu de la page
 * @returns {Object} Statut et recommandations
 */
function getContentStatus(contentData) {
  const wordCount = contentData.wordCount || 0;
  const paragraphCount = contentData.paragraphs || 0;
  const headingCount = contentData.headings || 0;
  const hasLists = contentData.hasLists || false;
  
  if (wordCount < 300) {
    return {
      status: 'warning',
      message: 'Contenu court',
      tips: `Votre page contient ${wordCount} mots. Essayez d'atteindre au moins 300 mots pour un meilleur référencement.`
    };
  }
  
  if (paragraphCount < 3) {
    return {
      status: 'info',
      message: 'Peu de paragraphes',
      tips: `Votre page ne contient que ${paragraphCount} paragraphe(s). Structurez votre contenu en plusieurs paragraphes pour une meilleure lisibilité.`
    };
  }
  
  if (headingCount < 2) {
    return {
      status: 'info',
      message: 'Peu de titres',
      tips: `Seulement ${headingCount} niveau(x) de titres détecté(s). Utilisez des titres (H2, H3, etc.) pour structurer votre contenu.`
    };
  }
  
  if (!hasLists) {
    return {
      status: 'info',
      message: 'Aucune liste détectée',
      tips: 'Envisagez d\'ajouter des listes à puces ou numérotées pour améliorer la lisibilité de votre contenu.'
    };
  }
  
  return {
    status: 'pass',
    message: 'Contenu bien structuré',
    tips: 'Votre contenu est bien structuré avec des paragraphes, des titres et des listes.'
  };
}

/**
 * Évalue les liens de la page
 * @param {Object} linksData - Données sur les liens de la page
 * @returns {Object} Statut et recommandations
 */
function getLinksStatus(linksData) {
  const total = linksData.total || 0;
  const internal = linksData.internal || 0;
  const external = linksData.external || 0;
  const noFollow = linksData.noFollow || 0;
  const noHref = linksData.noHref || 0;
  const withTitle = linksData.withTitle || 0;
  const broken = linksData.broken || 0;
  
  if (total === 0) {
    return {
      status: 'warning',
      message: 'Aucun lien trouvé',
      tips: 'Envisagez d\'ajouter des liens pertinents vers d\'autres pages de votre site ou vers des ressources externes.'
    };
  }
  
  const issues = [];
  
  if (noHref > 0) {
    issues.push(`${noHref} lien(s) sans attribut href`);
  }
  
  if (broken > 0) {
    issues.push(`${broken} lien(s) brisé(s) détecté(s)`);
  }
  
  const titleRatio = total > 0 ? Math.round((withTitle / total) * 100) : 0;
  if (titleRatio < 50) {
    issues.push(`Seulement ${titleRatio}% des liens ont un attribut title`);
  }
  
  if (issues.length > 0) {
    return {
      status: 'warning',
      message: `${internal} liens internes, ${external} liens externes`,
      tips: `Problèmes détectés :\n- ${issues.join('\n- ')}`
    };
  }
  
  return {
    status: 'pass',
    message: `${internal} liens internes, ${external} liens externes`,
    tips: 'Vos liens sont bien configurés avec des attributs title et des URL valides.'
  };
}

/**
 * Évalue l'état des balises Open Graph
 * @param {Object} ogData - Données sur les balises Open Graph
 * @returns {Object} Statut et recommandations
 */
function getOpenGraphStatus(ogData) {
  const hasOgTitle = ogData.title !== undefined;
  const hasOgDescription = ogData.description !== undefined;
  const hasOgImage = ogData.image !== undefined;
  const hasOgUrl = ogData.url !== undefined;
  const hasOgType = ogData.type !== undefined;
  
  const missing = [];
  if (!hasOgTitle) missing.push('og:title');
  if (!hasOgDescription) missing.push('og:description');
  if (!hasOgImage) missing.push('og:image');
  if (!hasOgUrl) missing.push('og:url');
  if (!hasOgType) missing.push('og:type');
  
  if (missing.length > 3) {
    return {
      status: 'fail',
      message: 'Balises Open Graph manquantes',
      tips: `Balises Open Graph recommandées manquantes : ${missing.join(', ')}. Ces balises améliorent l'aperçu de votre page sur les réseaux sociaux.`
    };
  }
  
  if (missing.length > 0) {
    return {
      status: 'warning',
      message: 'Certaines balises Open Graph manquent',
      tips: `Balises Open Graph manquantes : ${missing.join(', ')}. Envisagez de les ajouter pour un meilleur partage sur les réseaux sociaux.`
    };
  }
  
  // Vérifier la longueur de la description
  const descLength = ogData.description ? ogData.description.length : 0;
  if (descLength < 50 || descLength > 300) {
    return {
      status: 'warning',
      message: 'Description Open Graph non optimale',
      tips: `Votre description Open Graph fait ${descLength} caractères. Essayez de la maintenir entre 50 et 300 caractères pour un affichage optimal.`
    };
  }
  
  return {
    status: 'pass',
    message: 'Balises Open Graph complètes',
    tips: 'Parfait ! Vos balises Open Graph sont bien configurées pour le partage sur les réseaux sociaux.'
  };
}

/**
 * Évalue l'état des balises Twitter Card
 * @param {Object} twitterData - Données sur les balises Twitter Card
 * @returns {Object} Statut et recommandations
 */
function getTwitterCardStatus(twitterData) {
  const hasCard = twitterData.card !== undefined;
  const hasTitle = twitterData.title !== undefined;
  const hasDescription = twitterData.description !== undefined;
  const hasImage = twitterData.image !== undefined;
  
  if (!hasCard) {
    return {
      status: 'info',
      message: 'Aucune carte Twitter détectée',
      tips: 'Envisagez d\'ajouter des balises Twitter Card pour améliorer l\'apparence de vos liens sur Twitter.'
    };
  }
  
  const missing = [];
  if (!hasTitle) missing.push('twitter:title');
  if (!hasDescription) missing.push('twitter:description');
  if (!hasImage) missing.push('twitter:image');
  
  if (missing.length > 0) {
    return {
      status: 'warning',
      message: 'Balises Twitter Card incomplètes',
      tips: `Balises Twitter Card recommandées manquantes : ${missing.join(', ')}.`
    };
  }
  
  // Vérifier la taille de l'image
  const imageSize = twitterData.imageSize || {};
  const minSize = 120;
  const maxSize = 4096;
  
  if (imageSize.width < minSize || imageSize.height < minSize) {
    return {
      status: 'warning',
      message: 'Image Twitter trop petite',
      tips: `Votre image Twitter (${imageSize.width}x${imageSize.height}px) est inférieure à la taille minimale recommandée (${minSize}x${minSize}px).`
    };
  }
  
  if (imageSize.width > maxSize || imageSize.height > maxSize) {
    return {
      status: 'warning',
      message: 'Image Twitter trop grande',
      tips: `Votre image Twitter (${imageSize.width}x${imageSize.height}px) dépasse la taille maximale recommandée (${maxSize}x${maxSize}px).`
    };
  }
  
  return {
    status: 'pass',
    message: 'Cartes Twitter bien configurées',
    tips: 'Parfait ! Vos balises Twitter Card sont correctement configurées.'
  };
}

/**
 * Évalue l'utilisation des mots-clés dans la page
 * @param {Object} keywordsData - Données sur les mots-clés
 * @returns {Object} Statut et recommandations
 */
function getKeywordsStatus(keywordsData) {
  const metaKeywords = keywordsData.metaKeywords || [];
  const contentKeywords = keywordsData.contentKeywords || [];
  const titleKeywords = keywordsData.titleKeywords || [];
  const headingKeywords = keywordsData.headingKeywords || [];
  
  // Vérifier la présence de mots-clés dans la balise meta keywords
  if (metaKeywords.length === 0) {
    return {
      status: 'info',
      message: 'Aucun mot-clé défini',
      tips: 'Bien que moins important qu\'avant, vous pouvez toujours ajouter des mots-clés dans la balise meta keywords.'
    };
  }
  
  // Vérifier la correspondance entre les mots-clés et le contenu
  const missingInContent = metaKeywords.filter(kw => !contentKeywords.includes(kw));
  const missingInTitle = metaKeywords.filter(kw => !titleKeywords.some(tk => tk.includes(kw)));
  const missingInHeadings = metaKeywords.filter(kw => !headingKeywords.some(hk => hk.includes(kw)));
  
  const issues = [];
  
  if (missingInContent.length > 0) {
    issues.push(`Mots-clés manquants dans le contenu : ${missingInContent.join(', ')}`);
  }
  
  if (missingInTitle.length > 0) {
    issues.push(`Mots-clés manquants dans le titre : ${missingInTitle.join(', ')}`);
  }
  
  if (missingInHeadings.length > 0) {
    issues.push(`Mots-clés manquants dans les titres : ${missingInHeadings.join(', ')}`);
  }
  
  if (issues.length > 0) {
    return {
      status: 'warning',
      message: 'Optimisation des mots-clés à améliorer',
      tips: `Problèmes détectés :\n- ${issues.join('\n- ')}`
    };
  }
  
  return {
    status: 'pass',
    message: 'Mots-clés bien optimisés',
    tips: 'Parfait ! Vos mots-clés sont bien répartis dans le contenu, le titre et les en-têtes.'
  };
}

/**
 * Met à jour toutes les sections d'analyse avec les données fournies
 * @param {Object} data - Données d'analyse complètes
 */
function updateSections(data) {
  if (!data) {
    console.error('Aucune donnée fournie pour la mise à jour des sections');
    return;
  }
  
  // Mettre à jour chaque section
  updateSection('structure', data);
  updateSection('security', data);
  updateSection('content', data);
  updateSection('performance', data);
}

// Initialiser les accordéons
function initAccordions() {
  console.log('[VelocitAI SEO] Initialisation des accordéons...');
  
  // Sélectionner tous les éléments d'accordéon
  const accordionItems = document.querySelectorAll('.accordion-item');
  console.log(`[VelocitAI SEO] ${accordionItems.length} accordéons trouvés`);
  
  if (accordionItems.length === 0) {
    console.error('[VelocitAI SEO] Aucun accordéon trouvé dans le DOM');
    return;
  }
  
  // Fonction pour ouvrir un accordéon
  const openAccordion = (item) => {
    console.log(`[VelocitAI SEO] Ouverture de l'accordéon`, item);
    const content = item.querySelector('.accordion-content');
    const arrow = item.querySelector('.fa-chevron-down');
    
    if (content) {
      // S'assurer que le contenu est visible pour calculer la hauteur
      content.style.display = 'block';
      content.style.visibility = 'hidden';
      content.style.position = 'absolute';
      
      // Forcer un recalcul du style pour s'assurer que le contenu est rendu
      void content.offsetHeight; // Déclenche un reflow
      
      // Stocker la hauteur calculée
      const contentHeight = content.scrollHeight;
      console.log(`[VelocitAI SEO] Hauteur calculée: ${contentHeight}px`);
      
      // Réinitialiser les styles pour l'animation
      content.style.visibility = '';
      content.style.position = '';
      content.style.maxHeight = '0';
      
      // Attendre le prochain frame pour démarrer l'animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          content.style.maxHeight = contentHeight + 'px';
          content.style.overflow = 'hidden';
          item.setAttribute('aria-expanded', 'true');
          
          // Réinitialiser la hauteur après l'animation
          setTimeout(() => {
            if (content.style.maxHeight !== '0px') {
              content.style.maxHeight = 'none';
            }
          }, 300);
        });
      });
    } else {
      console.error('[VelocitAI SEO] Élément .accordion-content non trouvé dans l\'accordéon');
    }
    
    if (arrow) {
      arrow.style.transform = 'rotate(180deg)';
    } else {
      console.error('[VelocitAI SEO] Flèche de l\'accordéon non trouvée');
    }
  };
  
  // Fonction pour fermer un accordéon
  const closeAccordion = (item) => {
    console.log(`[VelocitAI SEO] Fermeture de l'accordéon`, item);
    const content = item.querySelector('.accordion-content');
    const arrow = item.querySelector('.fa-chevron-down');
    
    if (content) {
      content.style.maxHeight = '0';
      content.style.padding = '0 16px';
      item.setAttribute('aria-expanded', 'false');
      
      // Réinitialiser le display après l'animation
      setTimeout(() => {
        if (content.style.maxHeight === '0px') { // Vérifier que l'accordéon n'a pas été rouvert
          content.style.display = 'none';
        }
      }, 300);
    }
    
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }
  };
  
  // Initialiser chaque accordéon
  accordionItems.forEach((item, index) => {
    console.log(`[VelocitAI SEO] Initialisation de l'accordéon #${index}`, item);
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    
    if (header && content) {
      console.log(`[VelocitAI SEO] En-tête et contenu trouvés pour l'accordéon #${index}`);
      
      // Ajouter l'attribut ARIA pour l'accessibilité
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('aria-controls', content.id || `accordion-${index}-content`);
      
      // S'assurer que le contenu est initialement masqué
      content.style.display = 'none';
      content.style.maxHeight = '0';
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
      
      // Gérer le clic sur l'en-tête
      header.addEventListener('click', (e) => {
        console.log(`[VelocitAI SEO] Clic sur l'en-tête de l'accordéon #${index}`);
        e.stopPropagation();
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        // Fermer tous les autres accordéons
        if (!isExpanded) {
          document.querySelectorAll('.accordion-item').forEach(accItem => {
            if (accItem !== item) {
              closeAccordion(accItem);
            }
          });
        }
        
        // Basculer l'état de l'accordéon actuel
        if (isExpanded) {
          closeAccordion(item);
        } else {
          openAccordion(item);
        }
      });
      
      // Gérer la touche Entrée pour l'accessibilité
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log(`[VelocitAI SEO] Touche ${e.key} pressée sur l'accordéon #${index}`);
          header.click();
        }
      });
    } else {
      console.error(`[VelocitAI SEO] En-tête ou contenu manquant pour l'accordéon #${index}`, { header, content });
    }
  });
  
  // Ouvrir le premier accordéon par défaut
  const firstAccordion = document.querySelector('.accordion-item');
  if (firstAccordion) {
    console.log('[VelocitAI SEO] Préparation de l\'ouverture du premier accordéon');
    // Utiliser requestAnimationFrame pour s'assurer que tout est bien rendu
    // avec un délai supplémentaire pour laisser le temps au contenu de se mettre à jour
    const openFirstAccordion = () => {
      requestAnimationFrame(() => {
        console.log('[VelocitAI SEO] Ouverture du premier accordéon');
        openAccordion(firstAccordion);
      });
    };
    
    // Attendre que le contenu soit mis à jour
    if (document.readyState === 'complete') {
      openFirstAccordion();
    } else {
      window.addEventListener('load', openFirstAccordion, { once: true });
    }
  } else {
    console.error('[VelocitAI SEO] Impossible de trouver le premier accordéon');
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
  }
}

/**
 * Affiche les résultats de l'analyse
 * @param {Object} data - Données d'analyse
 */
async function displayResults(data) {
  console.log('[VelocitAI SEO] Affichage des résultats');
  
  try {
    // Masquer l'indicateur de chargement
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Afficher le conteneur des résultats
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
    }
          if (checkContainer()) {
            console.log('[VelocitAI SEO] Conteneur détecté par vérification périodique');
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            resolve();
          }
        }, 100);
        
        // Écouter l'événement DOMContentLoaded
        const onReady = () => {
          console.log('[VelocitAI SEO] Événement DOMContentLoaded déclenché');
          document.removeEventListener('DOMContentLoaded', onReady);
          
          // Vérifier immédiatement après DOMContentLoaded
          if (checkContainer()) {
            console.log('[VelocitAI SEO] Conteneur trouvé après DOMContentLoaded');
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            resolve();
          } else {
            console.log('[VelocitAI SEO] Conteneur non trouvé après DOMContentLoaded, poursuite de la vérification...');
          }
        };
        
        document.addEventListener('DOMContentLoaded', onReady);
        
        // Timeout de sécurité
        const timeoutId = setTimeout(() => {
          console.warn('[VelocitAI SEO] Timeout de chargement du DOM, continuation malgré tout');
          clearInterval(checkInterval);
          resolve();
        }, 5000);
        
        // Vérifier immédiatement au cas où le DOM serait déjà chargé
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          onReady();
        }
      });
    }

    // Essayer de trouver le conteneur des résultats
    let resultsContainer = null;
    
    // Attendre que le DOM soit prêt avant de chercher les éléments
    console.log('[VelocitAI SEO] Attente du chargement du DOM...');
    await waitForDOM();
    console.log('[VelocitAI SEO] DOM chargé, recherche du conteneur...');
    
    // Fonction pour essayer de trouver le conteneur avec plusieurs méthodes
    const findContainer = () => {
      console.log('[VelocitAI SEO] Recherche du conteneur...');
      
      // Essayer plusieurs méthodes de recherche
      const selectors = [
        () => document.getElementById('accordion-container'),
        () => document.querySelector('#accordion-container'),
        () => document.querySelector('.section-accordion'),
        () => document.querySelector('.results-container #accordion-container'),
        () => document.querySelector('.results-container .section-accordion'),
        () => document.querySelector('body > .section-accordion'),
        () => document.querySelector('body > #accordion-container')
      ];
      
      // Essayer chaque sélecteur jusqu'à ce qu'on trouve le conteneur
      for (const selector of selectors) {
        try {
          const container = selector();
          if (container) {
            console.log('[VelocitAI SEO] Conteneur trouvé avec le sélecteur:', selector.toString());
            return container;
          }
        } catch (e) {
          console.warn('[VelocitAI SEO] Erreur avec le sélecteur:', selector, e);
        }
      }
      
      return null;
    };
    
    // Essayer de trouver le conteneur plusieurs fois avec des délais
    const maxTries = 5;
    const retryDelay = 100; // ms
    
    for (let i = 0; i < maxTries; i++) {
      resultsContainer = findContainer();
      if (resultsContainer) break;
      
      if (i < maxTries - 1) {
        console.log(`[VelocitAI SEO] Tentative ${i + 1}/${maxTries} - Conteneur non trouvé, nouvelle tentative dans ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // Si le conteneur n'est toujours pas trouvé, essayer de le créer dynamiquement
    if (!resultsContainer) {
      console.warn('[VelocitAI SEO] Conteneur des résultats non trouvé, tentative de récupération...');
      
      // Afficher des informations de débogage détaillées
      const debugInfo = {
        readyState: document.readyState,
        body: document.body ? 'body exists' : 'no body',
        head: document.head ? 'head exists' : 'no head',
        allElements: document.querySelectorAll('*').length,
        seoResultsExists: !!document.getElementById('seo-results'),
        resultsContainerExists: !!document.querySelector('.results-container'),
        accordionContainerExists: !!document.getElementById('accordion-container'),
        sectionAccordionExists: !!document.querySelector('.section-accordion')
      };
      
      console.log('[VelocitAI SEO] État du document:', debugInfo);
      
      // Essayer de récupérer l'élément parent avec plusieurs méthodes
      console.log('[VelocitAI SEO] Recherche de seo-results...');
      let seoResults = document.getElementById('seo-results');
      
      if (!seoResults) {
        console.log('[VelocitAI SEO] seo-results non trouvé, essai avec la classe results-container...');
        seoResults = document.querySelector('.results-container');
      }
      
      if (!seoResults) {
        console.log('[VelocitAI SEO] Aucun conteneur parent trouvé, création d\'un nouveau conteneur...');
        
        // Créer un nouveau conteneur parent si aucun n'existe
        seoResults = document.createElement('div');
        seoResults.id = 'seo-results';
        seoResults.className = 'results-container';
        seoResults.style.display = 'block';
        
        // Trouver le conteneur principal ou utiliser le body
        const mainContainer = document.querySelector('.container') || document.body;
        mainContainer.appendChild(seoResults);
        
        console.log('[VelocitAI SEO] Nouveau conteneur parent créé:', seoResults);
      }
      
      if (!seoResults) {
        seoResults = document.querySelector('.results-container') || 
                    document.querySelector('.container') || 
                    document.body;
      }
      if (seoResults) {
        console.log('[VelocitAI SEO] Élément parent trouvé:', seoResults);
        
        // Vérifier si l'élément a été créé mais pas encore dans le DOM
        resultsContainer = seoResults.querySelector('#accordion-container');
        
        // Si toujours pas trouvé, essayer de le recréer
        if (!resultsContainer) {
          console.log('[VelocitAI SEO] Création dynamique de l\'interface des résultats dans:', seoResults);
          
          // Créer le conteneur principal
          resultsContainer = document.createElement('div');
          resultsContainer.id = 'accordion-container';
          resultsContainer.className = 'section-accordion';
          resultsContainer.style.display = 'block'; // S'assurer qu'il est visible
          resultsContainer.style.visibility = 'visible';
          resultsContainer.style.opacity = '1';
          resultsContainer.style.height = 'auto';
          
          // S'assurer que le conteneur parent est visible
          seoResults.style.display = 'block';
          seoResults.style.visibility = 'visible';
          seoResults.style.opacity = '1';
          seoResults.style.height = 'auto';
          
          // Créer les sections d'accordéon
          const sections = [
            { id: 'structure', icon: 'code', title: 'Structure HTML' },
            { id: 'security', icon: 'shield-alt', title: 'Sécurité & Canonical' },
            { id: 'content', icon: 'file-alt', title: 'Contenu & Accessibilité' },
            { id: 'performance', icon: 'tachometer-alt', title: 'Performance' }
          ];
          
          // Créer un fragment de document pour améliorer les performances
          const fragment = document.createDocumentFragment();
          
          // Ajouter chaque section au fragment
          sections.forEach(section => {
            // Créer les éléments du DOM manuellement
            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.setAttribute('data-section', section.id);
            
            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.setAttribute('role', 'button');
            header.setAttribute('tabindex', '0');
            
            const icon = document.createElement('i');
            icon.className = `fas fa-${section.icon}`;
            
            const title = document.createElement('h3');
            title.textContent = section.title;
            
            const arrow = document.createElement('i');
            arrow.className = 'fas fa-chevron-down';
            
            const content = document.createElement('div');
            content.className = 'accordion-content';
            content.id = `${section.id}-content`;
            
            // Assembler la structure
            header.appendChild(icon);
            header.appendChild(title);
            header.appendChild(arrow);
            
            item.appendChild(header);
            item.appendChild(content);
            
            // Ajouter l'item au fragment
            fragment.appendChild(item);
          });
          
          // Ajouter tous les éléments au conteneur en une seule opération
          resultsContainer.appendChild(fragment);
          
          // Vérifier si le conteneur n'est pas déjà dans le DOM
          if (!resultsContainer.parentNode) {
            console.log('[VelocitAI SEO] Ajout du conteneur au DOM...');
            seoResults.appendChild(resultsContainer);
            console.log('[VelocitAI SEO] Structure de l\'accordéon créée avec succès dans:', seoResults);
            
            // Vérifier que le conteneur est bien dans le DOM
            const checkContainer = document.getElementById('accordion-container');
            console.log('[VelocitAI SEO] Vérification du conteneur dans le DOM:', {
              found: !!checkContainer,
              parent: checkContainer ? checkContainer.parentNode : null,
              isConnected: checkContainer ? checkContainer.isConnected : false
            });
          } else {
            console.log('[VelocitAI SEO] Le conteneur est déjà dans le DOM');
          }
        }
      }
      
      // Si on n'a toujours pas de conteneur, c'est une erreur critique
      if (!resultsContainer) {
        console.error('Impossible de trouver ou de créer le conteneur accordion');
        throw new Error('Impossible d\'initialiser l\'interface des résultats');
      }
    }
    
    // S'assurer que le conteneur est visible et vide
    console.log('[VelocitAI SEO] Affichage du conteneur des résultats:', resultsContainer);
    resultsContainer.style.display = 'block';
    resultsContainer.style.visibility = 'visible';
    resultsContainer.style.opacity = '1';
    
    // Vérifier si le conteneur est dans le DOM
    if (!resultsContainer.isConnected) {
      console.warn('[VelocitAI SEO] Le conteneur des résultats n\'est pas dans le DOM, tentative de correction...');
      document.body.appendChild(resultsContainer);
    }
    
    console.log('[VelocitAI SEO] État du conteneur après affichage:', {
      display: window.getComputedStyle(resultsContainer).display,
      visibility: window.getComputedStyle(resultsContainer).visibility,
      opacity: window.getComputedStyle(resultsContainer).opacity,
      isConnected: resultsContainer.isConnected,
      parent: resultsContainer.parentNode
    });
    
    // Vérifier si des données valides ont été fournies
    if (!data) {
      console.error('Aucune donnée valide fournie à displayResults');
      const errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.style.display = 'block';
      }
      return;
    }
    
    // Mettre à jour chaque section avec les données d'analyse
    console.log('[VelocitAI SEO] Mise à jour des sections...');
    updateSections(data);
    
    // Mettre à jour le score global
    console.log('[VelocitAI SEO] Mise à jour du score global...');
    updateGlobalScore(data);
    
    console.log('[VelocitAI SEO] === Affichage des résultats terminé avec succès ===');
    
    // Vérifier l'état final du conteneur
    const finalContainer = document.getElementById('accordion-container');
    console.log('[VelocitAI SEO] État final du conteneur:', {
      exists: !!finalContainer,
      isConnected: finalContainer?.isConnected,
      parent: finalContainer?.parentNode?.id || finalContainer?.parentNode?.className || 'no-parent',
      display: finalContainer ? window.getComputedStyle(finalContainer).display : 'n/a',
      visibility: finalContainer ? window.getComputedStyle(finalContainer).visibility : 'n/a',
      opacity: finalContainer ? window.getComputedStyle(finalContainer).opacity : 'n/a',
      height: finalContainer ? window.getComputedStyle(finalContainer).height : 'n/a'
    });
    if (firstSection) {
      // Ouverture de la première section par défaut
      firstSection.click();
    }
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur lors de l\'affichage des résultats :', error.message);
  }
}

/**
 * Met à jour le contenu d'une section spécifique avec les résultats d'analyse
 * @param {string} sectionId - Identifiant de la section à mettre à jour
 * @param {Object} data - Données d'analyse complètes
 */
function updateSection(sectionId, data) {
  try {
    // Vérifier d'abord avec l'ID complet, puis avec l'ID de base
    let section = document.getElementById(`${sectionId}-content`);
    
    // Si non trouvé, essayer avec l'ID de base seul
    if (!section) {
      section = document.getElementById(sectionId);
    }
    
    // Si toujours pas trouvé, essayer de trouver par data-section
    if (!section) {
      const sectionElement = document.querySelector(`[data-section="${sectionId}"]`);
      if (sectionElement) {
        section = sectionElement.querySelector('.accordion-content');
      }
    }
    
    if (!section) {
      console.error(`Section ${sectionId} non trouvée`);
      return;
    }
    
    // Vider la section
    section.innerHTML = '';
    
    // Mettre à jour la section appropriée
    switch (sectionId) {
      case 'structure':
        updateStructureSection(section, data);
        break;
      case 'security':
        updateSecuritySection(section, data);
        break;
      case 'content':
        updateContentSection(section, data);
        break;
      case 'performance':
        updatePerformanceSection(section, data);
        break;
      default:
        console.warn(`Section inconnue : ${sectionId}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la section ${sectionId} :`, error);
  }
}

/**
 * Met à jour la section "Structure HTML"
 * @param {HTMLElement} section - Élément DOM de la section
 * @param {Object} data - Données d'analyse
 */
function updateStructureSection(section, data) {
  // Vérifier si les données nécessaires sont présentes
  if (!data) {
    console.error('Aucune donnée fournie pour la mise à jour de la section Structure');
    section.innerHTML = '<div class="error">Aucune donnée disponible pour l\'analyse de la structure</div>';
    return;
  }

  // Vider la section
  section.innerHTML = '';
  
  // Vérifier si les données de titre sont disponibles
  if (!data.title) {
    console.warn('Aucune donnée de titre disponible');
    section.appendChild(createResultItem(
      'Titre de la page',
      'Non disponible',
      'error',
      'Données manquantes: Impossible de récupérer les informations du titre de la page.'
    ));
  } else {
    // Titre de la page
    const titleStatus = getTitleStatus(data.title);
    section.appendChild(createResultItem(
      'Titre de la page',
      data.title.text ? 
        (data.title.text.length > 60 ? 
          data.title.text.substring(0, 57) + '...' : 
          data.title.text) : 
        'Non défini',
      titleStatus.status,
      `${titleStatus.message}: ${titleStatus.tips}`
    ));
  }
  
  // Vérifier si les données de méta description sont disponibles
  if (!data.metaDescription) {
    console.warn('Aucune donnée de méta description disponible');
    section.appendChild(createResultItem(
      'Meta description',
      'Non disponible',
      'error',
      'Données manquantes: Impossible de récupérer les informations de la méta description.'
    ));
  } else {
    // Meta description
    const metaStatus = getMetaDescriptionStatus(data.metaDescription);
    section.appendChild(createResultItem(
      'Meta description',
      data.metaDescription.text ? 
        (data.metaDescription.text.length > 100 ? 
          data.metaDescription.text.substring(0, 97) + '...' : 
          data.metaDescription.text) : 
        'Non définie',
      metaStatus.status,
      `${metaStatus.message}: ${metaStatus.tips}`
    ));
  }
  
  // Vérifier si les données de balise H1 sont disponibles
  if (!data.h1) {
    console.warn('Aucune donnée de balise H1 disponible');
    section.appendChild(createResultItem(
      'Balise H1',
      'Non disponible',
      'error',
      'Données manquantes: Impossible de récupérer les informations de la balise H1.'
    ));
  } else {
    // Balise H1
    const h1Status = getH1Status(data.h1);
    section.appendChild(createResultItem(
      'Balise H1',
      data.h1.text ? 
        (data.h1.text.length > 70 ? 
          data.h1.text.substring(0, 67) + '...' : 
          data.h1.text) : 
        'Non trouvée',
      h1Status.status,
      `${h1Status.message}: ${h1Status.tips}`
    ));
  }
  
  // Vérifier si les données de structure des en-têtes sont disponibles
  if (!data.headingStructure && !data.headings) {
    console.warn('Aucune donnée de structure des en-têtes disponible');
    section.appendChild(createResultItem(
      'Structure des en-têtes',
      'Non disponible',
      'error',
      'Données manquantes: Impossible de récupérer les informations de la structure des en-têtes.'
    ));
  } else {
    // Structure des en-têtes
    const headingsStatus = getHeadingsStatus(data.headingStructure || [], data.headings || {});
    section.appendChild(createResultItem(
      'Structure des en-têtes',
      headingsStatus.title || 'Analyse de la structure',
      headingsStatus.status,
      `${headingsStatus.message}: ${headingsStatus.tips}`
    ));
  }
  
  // Ajouter un indicateur visuel pour les problèmes critiques
  const criticalIssues = [];
  if (data.title) criticalIssues.push(getTitleStatus(data.title));
  if (data.metaDescription) criticalIssues.push(getMetaDescriptionStatus(data.metaDescription));
  if (data.h1) criticalIssues.push(getH1Status(data.h1));
  if (data.headingStructure || data.headings) {
    criticalIssues.push(getHeadingsStatus(data.headingStructure || [], data.headings || {}));
  }
  const criticalCount = criticalIssues.filter(status => status.status === 'fail').length;
    
  if (criticalIssues > 0) {
    const criticalWarning = document.createElement('div');
    criticalWarning.className = 'critical-warning';
    criticalWarning.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>${criticalIssues} problème(s) critique(s) détecté(s) dans la structure de la page</span>
    `;
    section.insertBefore(criticalWarning, section.firstChild);
  }
}

/**
 * Met à jour la section "Sécurité & Canonical"
 * @param {HTMLElement} section - Élément DOM de la section
 * @param {Object} data - Données d'analyse
 */
function updateSecuritySection(section, data) {
  // Vérifier si les données nécessaires sont présentes
  if (!data) {
    console.error('Aucune donnée fournie pour la mise à jour de la section Sécurité');
    return;
  }

  // HTTPS
  const httpsStatus = getHttpsStatus(data.isHTTPS || false);
  section.appendChild(createResultItem(
    'Connexion sécurisée (HTTPS)',
    data.isHTTPS ? 'Oui' : 'Non',
    httpsStatus.status,
    `${httpsStatus.message}: ${httpsStatus.tips}`
  ));
  
  // Viewport
  const viewportStatus = getViewportStatus(data.viewport || {});
  section.appendChild(createResultItem(
    'Balise viewport',
    (data.viewport && data.viewport.present) ? 
      (data.viewport.content || 'Présente') : 
      'Absente',
    viewportStatus.status,
    `${viewportStatus.message}: ${viewportStatus.tips}`
  ));
  
  // Balise canonique
  const canonicalStatus = getCanonicalStatus(data.canonical || '');
  section.appendChild(createResultItem(
    'Balise canonique',
    data.canonical ? 
      (data.canonical.length > 50 ? 
        '...' + data.canonical.substring(data.canonical.length - 47) : 
        data.canonical) : 
      'Absente',
    canonicalStatus.status,
    `${canonicalStatus.message}: ${canonicalStatus.tips}`
  ));
  
  // Balises meta robots
  const robotsStatus = getRobotsStatus((data.meta && data.meta.robots) ? data.meta.robots : '');
  section.appendChild(createResultItem(
    'Balise meta robots',
    (data.meta && data.meta.robots) ? 
      (data.meta.robots.length > 30 ? 
        data.meta.robots.substring(0, 27) + '...' : 
        data.meta.robots) : 
      'Non définie',
    robotsStatus.status,
    `${robotsStatus.message}: ${robotsStatus.tips}`
  ));
  
  // Ajouter un indicateur visuel pour les problèmes critiques
  const securityIssues = [httpsStatus, viewportStatus, canonicalStatus, robotsStatus]
    .filter(status => status.status === 'fail').length;
    
  if (securityIssues > 0) {
    const securityWarning = document.createElement('div');
    securityWarning.className = 'critical-warning';
    securityWarning.innerHTML = `
      <i class="fas fa-shield-alt"></i>
      <span>${securityIssues} problème(s) de sécurité détecté(s) nécessitant votre attention</span>
    `;
    section.insertBefore(securityWarning, section.firstChild);
  }
}

/**
 * Met à jour la section "Contenu & Accessibilité"
 * @param {HTMLElement} section - Élément DOM de la section
 * @param {Object} data - Données d'analyse
 */
function updateContentSection(section, data) {
  // Vérifier si les données nécessaires sont présentes
  if (!data) {
    console.error('Aucune donnée fournie pour la mise à jour de la section Contenu');
    return;
  }

  // Préparer les données avec des valeurs par défaut si nécessaire
  const imagesData = data.images || { withoutAlt: 0, total: 0, withAlt: 0 };
  const contentData = data.content || { wordCount: 0, paragraphs: 0, headings: [], lists: 0 };
  const linksData = data.links || { internal: 0, external: 0, broken: 0, noTitle: 0 };
  
  // Images
  const imagesStatus = getImagesStatus(imagesData);
  section.appendChild(createResultItem(
    'Images',
    imagesData.total > 0 ? 
      `${imagesData.withAlt}/${imagesData.total} avec attribut alt` : 
      'Aucune image trouvée',
    imagesStatus.status,
    imagesData.withoutAlt > 0 ? 
      `${imagesData.withoutAlt} image(s) sans attribut alt - ${imagesStatus.message}: ${imagesStatus.tips}` : 
      `${imagesStatus.message}: ${imagesStatus.tips}`
  ));
  
  // Contenu
  const contentStatus = getContentStatus(contentData);
  const contentDetails = [];
  
  if (contentData.wordCount > 0) {
    contentDetails.push(`${contentData.wordCount} mots`);
  }
  if (contentData.paragraphs > 0) {
    contentDetails.push(`${contentData.paragraphs} paragraphe(s)`);
  }
  if (contentData.lists > 0) {
    contentDetails.push(`${contentData.lists} liste(s)`);
  }
  
  section.appendChild(createResultItem(
    'Contenu',
    contentDetails.length > 0 ? contentDetails.join(', ') : 'Aucun contenu textuel',
    contentStatus.status,
    `${contentStatus.message}: ${contentStatus.tips}`
  ));
  
  // Liens
  const linksStatus = getLinksStatus(linksData);
  const linksDetails = [];
  
  if (linksData.internal > 0) linksDetails.push(`${linksData.internal} interne(s)`);
  if (linksData.external > 0) linksDetails.push(`${linksData.external} externe(s)`);
  if (linksData.broken > 0) linksDetails.push(`${linksData.broken} brisé(s)`);
  
  section.appendChild(createResultItem(
    'Liens',
    linksDetails.length > 0 ? linksDetails.join(', ') : 'Aucun lien trouvé',
    linksStatus.status,
    linksData.broken > 0 ? 
      `${linksData.broken} lien(s) brisé(s) détecté(s) - ${linksStatus.message}: ${linksStatus.tips}` : 
      `${linksStatus.message}: ${linksStatus.tips}`
  ));
  
  // Ajouter un indicateur visuel pour les problèmes critiques
  const contentIssues = [imagesStatus, contentStatus, linksStatus]
    .filter(status => status.status === 'fail' || status.status === 'warning').length;
    
  if (contentIssues > 0) {
    const contentWarning = document.createElement('div');
    contentWarning.className = 'content-warning';
    contentWarning.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${contentIssues} point(s) à améliorer dans le contenu et l'accessibilité</span>
    `;
    section.insertBefore(contentWarning, section.firstChild);
  }
}

/**
 * Met à jour la section "Performances"
 * @param {HTMLElement} section - Élément DOM de la section
 * @param {Object} data - Données d'analyse
 */
function updatePerformanceSection(section, data) {
  // Vérifier si les données nécessaires sont présentes
  if (!data) {
    console.error('Aucune donnée fournie pour la mise à jour de la section Performances');
    return;
  }

  // Préparer les données avec des valeurs par défaut si nécessaire
  const ogData = data.openGraph || {};
  const twitterData = data.twitterCard || {};
  const keywordsData = data.keywords || {};
  
  // Balises Open Graph
  const ogStatus = getOpenGraphStatus(ogData);
  const ogDetails = [];
  if (ogData.title) ogDetails.push('titre');
  if (ogData.description) ogDetails.push('description');
  if (ogData.image) ogDetails.push('image');
  
  section.appendChild(createResultItem(
    'Balises Open Graph',
    ogDetails.length > 0 ? 
      `${ogDetails.join(', ')}` : 
      'Aucune balise détectée',
    ogStatus.status,
    ogDetails.length > 0 ? 
      `${ogStatus.message}: ${ogStatus.tips}` : 
      'Aucune balise Open Graph détectée'
  ));
  
  // Cartes Twitter
  const twitterStatus = getTwitterCardStatus(twitterData);
  const twitterDetails = [];
  if (twitterData.card) twitterDetails.push('carte');
  if (twitterData.title) twitterDetails.push('titre');
  if (twitterData.image) twitterDetails.push('image');
  
  section.appendChild(createResultItem(
    'Cartes Twitter',
    twitterDetails.length > 0 ? 
      twitterDetails.join(', ') : 
      'Aucune carte détectée',
    twitterStatus.status,
    twitterDetails.length > 0 ? 
      `${twitterStatus.message}: ${twitterStatus.tips}` : 
      'Aucune carte Twitter détectée'
  ));
  
  // Mots-clés
  const keywordsStatus = getKeywordsStatus(keywordsData);
  const keywordsList = keywordsData.metaKeywords || [];
  
  section.appendChild(createResultItem(
    'Mots-clés',
    keywordsList.length > 0 ? 
      (keywordsList.length > 3 ? 
        `${keywordsList.slice(0, 3).join(', ')}... (+${keywordsList.length - 3} autres)` : 
        keywordsList.join(', ')) : 
      'Aucun mot-clé défini',
    keywordsStatus.status,
    keywordsList.length > 0 ? 
      `${keywordsList.length} mot(s)-clé(s) défini(s) - ${keywordsStatus.message}: ${keywordsStatus.tips}` : 
      `${keywordsStatus.message}: ${keywordsStatus.tips}`
  ));
  
  // Ajouter un indicateur visuel pour les problèmes
  const performanceIssues = [ogStatus, twitterStatus, keywordsStatus]
    .filter(status => status.status === 'fail' || status.status === 'warning').length;
    
  if (performanceIssues > 0) {
    const performanceWarning = document.createElement('div');
    performanceWarning.className = 'performance-warning';
    performanceWarning.innerHTML = `
      <i class="fas fa-tachometer-alt"></i>
      <span>${performanceIssues} point(s) d'optimisation pour les réseaux sociaux</span>
    `;
    section.insertBefore(performanceWarning, section.firstChild);
  }
}

/**
 * Calcule un score SEO global basé sur plusieurs critères
 * @param {Object} data - Données d'analyse de la page
 * @returns {number} Score SEO sur 100 points
 */
function calculateScore(data) {
  try {
    console.log('Données reçues par calculateScore :', JSON.stringify(data, null, 2));
    let score = 0;
    const maxScore = 100;
    const scores = {
      title: 0,
      metaDescription: 0,
      h1: 0,
      https: 0,
      viewport: 0,
      images: 0,
      headings: 0,
      links: 0,
      content: 0,
      seoMeta: 0
    };
    
    // 1. Analyse du titre (15 points max)
    if (data.title) {
      // Longueur optimale entre 30 et 60 caractères
      if (data.title.length >= 30 && data.title.length <= 60) {
        scores.title += 10; // 10 points pour la longueur optimale
      } else if (data.title.length > 0) {
        // Note dégressive pour les titres trop courts ou trop longs
        scores.title += Math.max(0, 10 - Math.abs(45 - data.title.length) * 0.2);
      }
      
      // 5 points supplémentaires si le titre contient des mots-clés pertinents
      if (data.title.hasKeywords) {
        scores.title += 5;
      }
    }
    
    // 2. Meta description (10 points max)
    if (data.metaDescription) {
      // Longueur optimale entre 70 et 160 caractères
      if (data.metaDescription.length >= 70 && data.metaDescription.length <= 160) {
        scores.metaDescription += 7; // 7 points pour la longueur optimale
      } else if (data.metaDescription.length > 0) {
        // Note dégressive pour les descriptions trop courtes ou trop longues
        scores.metaDescription += Math.max(0, 7 - Math.abs(115 - data.metaDescription.length) * 0.05);
      }
      
      // 3 points supplémentaires si la description contient des mots-clés pertinents
      if (data.metaDescription.hasKeywords) {
        scores.metaDescription += 3;
      }
    }
    
    // 3. Balise H1 (10 points max)
    if (data.h1.count === 1) {
      scores.h1 = 10; // 10 points pour une seule balise H1
      
      // Vérifier la longueur du H1 (entre 20 et 70 caractères)
      if (data.h1.length < 20 || data.h1.length > 70) {
        scores.h1 -= 2; // Pénalité pour H1 trop court ou trop long
      }
    } else if (data.h1.count === 0) {
      scores.h1 = 0; // 0 point si pas de H1
    } else {
      scores.h1 = 5; // 5 points si plusieurs H1 (meilleur que rien mais pas optimal)
    }
    
    // 4. HTTPS (10 points)
    scores.https = data.isHTTPS ? 10 : 0;
    
    // 5. Viewport (5 points)
    scores.viewport = data.viewport.present ? 5 : 0;
    
    // 6. Images (10 points max)
    // Points pour les attributs alt (6 points max)
    scores.images += Math.min(6, (data.images.altTextRatio / 100) * 6);
    
    // Points pour les dimensions (2 points)
    if (data.images.withDimensions > 0) {
      scores.images += 2 * (data.images.withDimensions / data.images.total);
    }
    
    // Pénalité pour les images trop grandes (2 points)
    if (data.images.largeImages > 0) {
      scores.images -= Math.min(2, (data.images.largeImages / data.images.total) * 2);
    }
    
    // 7. Structure des en-têtes (10 points max)
    // Points pour la présence d'au moins un H1 et des H2 (5 points)
    if (data.h1.count > 0 && data.headings.h2 > 0) {
      scores.headings += 5;
    }
    
    // Points pour la structure hiérarchique (5 points)
    if (data.headingStructure.length === 0) {
      scores.headings += 5; // Structure parfaite
    } else {
      // Pénalité pour les sauts de niveau
      scores.headings += Math.max(0, 5 - data.headingStructure.length);
    }
    
    // 8. Liens (10 points max)
    // Points pour la présence de liens internes et externes (3 points)
    if (data.links.internal > 0 && data.links.external > 0) {
      scores.links += 3;
    }
    
    // Points pour les attributs title sur les liens (3 points max)
    scores.links += Math.min(3, (data.links.withTitle / data.links.total) * 3);
    
    // Points pour un bon ratio de liens nofollow (2 points)
    if (data.links.noFollowRatio >= 10 && data.links.noFollowRatio <= 50) {
      scores.links += 2;
    }
    
    // Pénalité pour les liens cassés (2 points)
    if (data.links.broken > 0) {
      scores.links -= Math.min(2, (data.links.broken / data.links.total) * 2);
    }
    
    // 9. Contenu (10 points max)
    // Points pour la longueur du contenu (5 points max)
    if (data.wordCount >= 300) {
      scores.content += 5;
    } else {
      scores.content += (data.wordCount / 300) * 5;
    }
    
    // Points pour la densité de mots-clés (5 points max)
    // (simplifié ici, idéalement on analyserait la densité réelle)
    if (data.title.hasKeywords || data.metaDescription.hasKeywords) {
      scores.content += 3;
    }
    
    // 10. Balises meta SEO (10 points max)
    // Balise canonique (3 points)
    if (data.canonical) {
      scores.seoMeta += 3;
    }
    
    // Balises meta robots (2 points)
    if (data.meta.robots) {
      scores.seoMeta += 2;
    }
    
    // Balises Open Graph (3 points)
    if (data.meta.hasOpenGraph) {
      scores.seoMeta += 3;
    }
    
    // Balises Twitter Card (2 points)
    if (data.meta.hasTwitterCard) {
      scores.seoMeta += 2;
    }
    
    // Calcul du score total
    const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);
    
    // Arrondir à l'entier le plus proche et limiter à 100
    return Math.min(Math.round(totalScore), maxScore);
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur dans la mise à jour de la section:', error.message);
    return 0;
  }
}

/**
 * Exporte le rapport d'analyse SEO au format texte
 * @param {Object} data - Données d'analyse complètes
 */
function exportReport(data) {
  try {
    // Vérifier si les données sont disponibles
    if (!data) {
      console.error('Aucune donnée à exporter');
      alert('Erreur : Aucune donnée d\'analyse disponible pour l\'exportation.');
      return;
    }

    // Créer l'en-tête du rapport
    let report = '=== RAPPORT D\'ANALYSE SEO ===\n\n';
    
    // Informations générales
    report += `URL analysée : ${data.url || 'Non disponible'}\n`;
    report += `Date d'analyse : ${new Date().toLocaleString()}\n`;
    report += `Score SEO : ${data.score || 0}/100\n\n`;
    
    // Fonction utilitaire pour formater les conseils
    const formatTips = (tips) => {
      if (!tips) return '';
      return `\n   → ${tips.replace(/\n/g, '\n     ')}`;
    };

    // Section Structure
    report += '\n=== 1. STRUCTURE HTML ===\n\n';
    if (data.title) {
      const status = getTitleStatus(data.title);
      report += `Titre de la page : ${data.title.text || 'Non défini'}\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    if (data.metaDescription) {
      const status = getMetaDescriptionStatus(data.metaDescription);
      const desc = data.metaDescription.text || 'Non définie';
      report += `Meta description : ${desc.length > 100 ? desc.substring(0, 97) + '...' : desc}\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    if (data.h1) {
      const status = getH1Status(data.h1);
      report += `Balise H1 : ${data.h1.text || 'Non trouvée'}\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    // Section Sécurité
    report += '\n=== 2. SÉCURITÉ & CANONICAL ===\n\n';
    const httpsStatus = getHttpsStatus(data.isHTTPS || false);
    report += `HTTPS : ${data.isHTTPS ? 'Oui' : 'Non'}\n`;
    report += `Statut : ${httpsStatus.message}${formatTips(httpsStatus.tips)}\n\n`;
    
    // Section Contenu
    report += '\n=== 3. CONTENU & ACCESSIBILITÉ ===\n\n';
    if (data.images) {
      const status = getImagesStatus(data.images);
      report += `Images : ${data.images.withoutAlt || 0} sans alt / ${data.images.total || 0} total\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    if (data.content) {
      const status = getContentStatus(data.content);
      report += `Contenu : ${data.content.wordCount || 0} mots, ${data.content.paragraphs || 0} paragraphes\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    // Section Performances
    report += '\n=== 4. RÉSEAUX SOCIAUX & MÉTADONNÉES ===\n\n';
    if (data.openGraph) {
      const status = getOpenGraphStatus(data.openGraph);
      const ogDetails = [];
      if (data.openGraph.title) ogDetails.push('titre');
      if (data.openGraph.description) ogDetails.push('description');
      if (data.openGraph.image) ogDetails.push('image');
      
      report += `Open Graph : ${ogDetails.length > 0 ? ogDetails.join(', ') : 'Aucune balise'}\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    if (data.keywords && data.keywords.metaKeywords) {
      const status = getKeywordsStatus(data.keywords);
      const keywords = data.keywords.metaKeywords || [];
      report += `Mots-clés : ${keywords.length > 0 ? keywords.join(', ') : 'Aucun'}\n`;
      report += `Statut : ${status.message}${formatTips(status.tips)}\n\n`;
    }
    
    // Pied de page
    report += '\n=== FIN DU RAPPORT ===\n\n';
    report += 'Généré avec VelocitAI SEO Checker\n';
    
    // Créer un blob avec le contenu
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-seo-${data.url ? new URL(data.url).hostname.replace('www.', '') : 'site'}-${new Date().toISOString().split('T')[0]}.txt`;
    
    // Déclencher le téléchargement
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Erreur lors de la génération du rapport :', error);
    alert('Une erreur est survenue lors de la génération du rapport. Veuillez consulter la console pour plus de détails.');
  }
}

/**
 * Met à jour le score global dans l'interface utilisateur
 * @param {Object} data - Données d'analyse
 */
function updateGlobalScore(data) {
  try {
    console.log('[VelocitAI SEO] Mise à jour du score global avec les données:', data);
    
    // Vérifier si les données sont valides
    if (!data) {
      console.error('Aucune donnée fournie pour le calcul du score global');
      return 0; // Retourner un score de 0 si aucune donnée n'est disponible
    }
    
    // Calculer le score global en utilisant la fonction calculateScore
    const finalScore = calculateScore(data);
    console.log(`[VelocitAI SEO] Score global calculé: ${finalScore}%`);
    
    // Mettre à jour l'interface utilisateur
    const scoreElement = document.getElementById('score-value');
    const scoreCircle = document.querySelector('.circle-fill');
    
    if (scoreElement) {
      scoreElement.textContent = finalScore;
    }
    
    if (scoreCircle) {
      // Mettre à jour le cercle de score avec une animation
      const circumference = 2 * Math.PI * 15.9155; // 2πr où r = 15.9155 (rayon du cercle)
      const offset = circumference - (finalScore / 100) * circumference;
      scoreCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      scoreCircle.style.strokeDashoffset = offset;
      
      // Mettre à jour la couleur en fonction du score
      if (finalScore >= 80) {
        scoreCircle.style.stroke = '#4CAF50'; // Vert
      } else if (finalScore >= 50) {
        scoreCircle.style.stroke = '#FFC107'; // Orange
      } else {
        scoreCircle.style.stroke = '#F44336'; // Rouge
      }
    }
    
    return finalScore;
    
  } catch (error) {
    console.error('[VelocitAI SEO] Erreur lors de la mise à jour du score global:', error);
    return 0; // Retourner 0 en cas d'erreur
  }
}

/**
 * Initialise les tooltips pour les éléments avec l'attribut data-tooltip
 */
function initTooltips() {
  console.log('[VelocitAI SEO] Initialisation des tooltips...');
  
  // Sélectionner tous les éléments avec un attribut data-tooltip
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  console.log(`[VelocitAI SEO] ${tooltipElements.length} éléments avec tooltip trouvés`);
  
  if (tooltipElements.length === 0) {
    console.log('[VelocitAI SEO] Aucun élément avec tooltip trouvé');
    return;
  }
  
  // Créer le conteneur des tooltips s'il n'existe pas
  let tooltipContainer = document.getElementById('tooltip-container');
  if (!tooltipContainer) {
    tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'tooltip-container';
    tooltipContainer.className = 'tooltip-container';
    document.body.appendChild(tooltipContainer);
  }
  
  // Fonction pour afficher un tooltip
  const showTooltip = (element, text) => {
    if (!text) return;
    
    // Créer ou mettre à jour le tooltip
    let tooltip = tooltipContainer.querySelector('.tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltipContainer.appendChild(tooltip);
    }
    
    // Positionner le tooltip
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.top = `${rect.bottom + scrollTop + 5}px`;
    tooltip.style.left = `${rect.left + scrollLeft}px`;
    
    // Ajuster pour éviter le débordement à droite
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
      tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
    }
    
    // Ajuster pour éviter le débordement en bas
    if (tooltipRect.bottom > window.innerHeight) {
      tooltip.style.top = `${rect.top + scrollTop - tooltipRect.height - 5}px`;
    }
  };
  
  // Fonction pour masquer le tooltip
  const hideTooltip = () => {
    const tooltip = tooltipContainer.querySelector('.tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };
  
  // Ajouter les écouteurs d'événements pour chaque élément
  tooltipElements.forEach(element => {
    const tooltipText = element.getAttribute('data-tooltip');
    
    // Au survol
    element.addEventListener('mouseenter', () => {
      showTooltip(element, tooltipText);
    });
    
    // À la sortie
    element.addEventListener('mouseleave', hideTooltip);
    
    // Pour l'accessibilité au clavier
    element.addEventListener('focus', () => {
      showTooltip(element, tooltipText);
    });
    
    element.addEventListener('blur', hideTooltip);
    
    // Ajouter un indicateur visuel pour les éléments avec tooltip
    if (!element.querySelector('.tooltip-icon')) {
      const icon = document.createElement('span');
      icon.className = 'tooltip-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'ⓘ';
      element.appendChild(icon);
    }
  });
  
  // Cacher le tooltip lors du défilement
  window.addEventListener('scroll', hideTooltip, true);
}

// Exposer la fonction globalement
window.initTooltips = initTooltips;
