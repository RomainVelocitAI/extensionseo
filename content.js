/**
 * Script de contenu pour VelocitAI SEO Checker
 * Ce script est injecté dans la page web pour permettre l'analyse SEO
 * La communication se fait principalement entre popup.js et background.js
 */

// Journalisation du chargement (uniquement en mode développement)
if (process.env.NODE_ENV === 'development') {
  console.log('[VelocitAI SEO] Script de contenu chargé');
}
