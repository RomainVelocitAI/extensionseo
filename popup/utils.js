// Détection du thème
function detectTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Mise à jour du cercle de score
function updateScoreCircle(score) {
  const circleFill = document.querySelector('.circle-fill');
  if (!circleFill) return;
  
  const circumference = 2 * Math.PI * 15.9155;
  const offset = circumference - (score / 100) * circumference;
  circleFill.style.strokeDasharray = `${circumference} ${circumference}`;
  circleFill.style.strokeDashoffset = offset;
  
  // Mise à jour de la couleur en fonction du score
  if (score >= 70) {
    circleFill.style.stroke = 'var(--success-color)';
  } else if (score >= 40) {
    circleFill.style.stroke = 'var(--warning-color)';
  } else {
    circleFill.style.stroke = 'var(--danger-color)';
  }
}

// Création d'un élément de résultat
function createResultItem(label, value, status, details = '') {
  const statusIcons = {
    pass: 'check-circle',
    warning: 'exclamation-triangle',
    fail: 'times-circle',
    error: 'times-circle',
    info: 'info-circle'
  };
  const icon = statusIcons[status] || 'info-circle';
  
  // Créer l'élément conteneur
  const resultItem = document.createElement('div');
  resultItem.className = 'result-item';
  
  // Créer l'icône
  const iconEl = document.createElement('i');
  iconEl.className = `fas fa-${icon} status-${status}`;
  iconEl.title = status;
  
  // Créer le label
  const labelEl = document.createElement('div');
  labelEl.className = 'result-label';
  labelEl.textContent = label;
  
  // Créer la valeur
  const valueEl = document.createElement('div');
  valueEl.className = 'result-value';
  valueEl.textContent = value;
  
  // Ajouter les éléments au conteneur
  resultItem.appendChild(iconEl);
  resultItem.appendChild(labelEl);
  resultItem.appendChild(valueEl);
  
  // Ajouter les détails si présents
  if (details) {
    const detailsEl = document.createElement('div');
    detailsEl.className = 'result-details';
    detailsEl.textContent = details;
    resultItem.appendChild(detailsEl);
  }
  
  return resultItem;
}
