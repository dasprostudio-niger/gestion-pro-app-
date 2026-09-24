/* ================================================================
   PREMIUM.JS - Module Premium pour Gestion Pro (v5.1 - Multilingue)
   Auteur : DAS PRO STUDIO
   ================================================================ */
(function() {
  'use strict';

  // ============ CONFIGURATION ============
  const CONFIG = {
    SECRET: 'DASPRO2026NATITIA',
    MAX_PRODUITS_GRATUIT: 3,
    MAX_VENTES_GRATUIT: 5,
    WHATSAPP: '22794929210',
    PREFIX: 'GP'
  };

  // Prix affiché selon la langue (Option A : FCFA + équivalent local)
  const PRIX_PAR_LANGUE = {
    fr: '10.000 FCFA',
    en: '10.000 FCFA (~$15)',
    es: '10.000 FCFA (~15 €)',
    de: '10.000 FCFA (~15 €)',
    it: '10.000 FCFA (~15 €)',
    pt: '10.000 FCFA (~15 €)',
    ru: '10.000 FCFA (~1400 ₽)',
    zh: '10.000 FCFA (~110 ¥)',
    ar: '10.000 FCFA (~60 ﷼)',
    hi: '10.000 FCFA (~1300 ₹)',
    ja: '10.000 FCFA (~2300 ¥)'
  };

  // Prix réel facturé (toujours en FCFA pour le paiement)
  const PRIX_REEEL = '10.000 FCFA';

  function getPrix() {
    let lang = 'fr';
    try {
      const storedLang = localStorage.getItem('gestionPro_langue');
      if (storedLang) lang = storedLang;
    } catch(e) {}
    return PRIX_PAR_LANGUE[lang] || PRIX_PAR_LANGUE.fr;
}

  // ============ TRADUCTION ============
  function t(key, params) {
    if (typeof window.translate === 'function') {
      return window.translate(key, params);
    }
    return key;
  }

  // ============ ÉTAT PREMIUM ============
  function estPremium() {
    return localStorage.getItem('gestionPro_premium') === 'true';
  }

  function activerPremium() {
    localStorage.setItem('gestionPro_premium', 'true');
    localStorage.setItem('gestionPro_date_activation', new Date().toISOString());
  }

  // ============ VÉRIFICATION DU CODE ============
  function calculerChecksum(part1) {
    const str = part1 + CONFIG.SECRET;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    let result = Math.abs(hash).toString(36).toUpperCase();
    while (result.length < 5) result = '0' + result;
    return result.substring(0, 5).padEnd(5, '0');
  }

  function verifierCode(code) {
    const clean = (code || '').trim().toUpperCase().replace(/[\s\-]/g, '');
    if (clean.length !== 12) return false;
    const prefix = clean.substring(0, 2);
    const part1 = clean.substring(2, 7);
    const part2 = clean.substring(7, 12);
    if (prefix !== CONFIG.PREFIX) return false;
    return part2 === calculerChecksum(part1);
  }

  // ============ COMPTEURS ============
  function compterVentes() {
    try { return (JSON.parse(localStorage.getItem('gestionPro_commandes')) || []).length; }
    catch(e) { return 0; }
  }

  function compterProduits() {
    try { return (JSON.parse(localStorage.getItem('gestionPro_produits')) || []).length; }
    catch(e) { return 0; }
  }

  // ============ ÉCRAN PREMIUM ============
  function ouvrirEcranPremium() {
    let ecran = document.getElementById('screenPremium');
    if (ecran) ecran.remove();
    ecran = document.createElement('div');
    ecran.className = 'screen';
    ecran.id = 'screenPremium';
    ecran.innerHTML = `
      <div class="screen-title">${t('premium_title')}</div>
      <div class="card" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none">
        <div style="font-size:22px;font-weight:800;margin-bottom:8px">${t('premium_unlock_title')}</div>
        <div style="font-size:14px;opacity:.95">${t('premium_unlock_desc')}</div>
      </div>
      <div class="card">
        <div class="card-title">${t('premium_what_you_get')}</div>
        <ul style="list-style:none;padding:0;font-size:14px;line-height:2;color:var(--text)">
          <li>${t('premium_unlimited_products')} <span style="color:#94a3b8">(${t('premium_free_max',{n:CONFIG.MAX_PRODUITS_GRATUIT})})</span></li>
          <li>${t('premium_unlimited_sales')} <span style="color:#94a3b8">(${t('premium_free_max',{n:CONFIG.MAX_VENTES_GRATUIT})})</span></li>
          <li>${t('premium_all_features')}</li>
          <li>${t('premium_free_updates')}</li>
          <li>${t('premium_priority_support')}</li>
        </ul>
      </div>
      <div class="card">
        <div class="card-title">${t('premium_price')}</div>
        <div style="font-size:28px;font-weight:800;color:#10b981;text-align:center;margin:12px 0">${getPrix()}</div>
        <div style="font-size:13px;color:var(--text-muted);text-align:center">${t('premium_one_time')}</div>
      </div>
      <div class="card">
        <div class="card-title">${t('premium_how_to_buy')}</div>
        <div style="font-size:14px;line-height:1.7;color:var(--text)">
          ${t('premium_step_buy')}<br>
          ${t('premium_step_pay')}<br>
          ${t('premium_step_receive')}<br>
          ${t('premium_step_enter')}
        </div>
        <button class="btn btn-success" onclick="acheterViaWhatsApp()" style="margin-top:12px">${t('premium_buy_whatsapp')}</button>
      </div>
      <div class="card">
        <div class="card-title">${t('premium_activate_with_code')}</div>
        <div class="form-group">
          <input class="input-field" id="codeActivationInput" placeholder="GP-XXXXX-XXXXX" style="text-transform:uppercase;font-family:monospace;font-size:16px;text-align:center;letter-spacing:2px" autocomplete="off"/>
        </div>
        <button class="btn btn-primary" onclick="validerCodeActivation()">${t('premium_activate_btn')}</button>
        <div id="messageActivation" style="text-align:center;margin-top:12px;font-size:13px"></div>
      </div>
      <button class="btn btn-outline" onclick="openScreen('screenAccueil')" style="margin-top:8px">${t('premium_back')}</button>
    `;
    document.querySelector('.app-container').insertBefore(ecran, document.querySelector('.bottom-nav'));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    ecran.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // ============ ACHAT VIA WHATSAPP ============
  function acheterViaWhatsApp() {
    const msgTemplate = t('premium_wa_msg', {price: PRIX_REEEL});
    const message = encodeURIComponent(msgTemplate);
    window.open('https://wa.me/' + CONFIG.WHATSAPP + '?text=' + message, '_blank');
  }

  // ============ VALIDATION DU CODE ============
  function validerCodeActivation() {
    const input = document.getElementById('codeActivationInput');
    const message = document.getElementById('messageActivation');
    const code = input.value.trim();
    if (!code) {
      message.style.color = '#ef4444';
      message.textContent = t('premium_enter_code');
      return;
    }
    if (verifierCode(code)) {
      activerPremium();
      message.style.color = '#10b981';
      message.textContent = t('premium_valid_code');
      setTimeout(() => {
        alert(t('premium_congrats'));
        openScreen('screenAccueil');
        setTimeout(() => { window.location.reload(); }, 300);
      }, 800);
    } else {
      message.style.color = '#ef4444';
      message.textContent = t('premium_invalid_code');
    }
  }

  // ============ INJECTION DE LA BANNIÈRE ============
  function injecterBanniere() {
    const ancien = document.getElementById('bannerPremium');
    if (ancien) ancien.remove();
    if (estPremium()) return;
    const container = document.getElementById('screenAccueil');
    if (!container) return;
    const banner = document.createElement('div');
    banner.id = 'bannerPremium';
    banner.style.cssText = 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-radius:16px;padding:16px;margin-bottom:16px;cursor:pointer';
    banner.innerHTML = `
      <div style="font-weight:800;font-size:16px;margin-bottom:6px">🚀 ${t('premium_free_version')}</div>
      <div style="font-size:13px;opacity:.95;margin-bottom:10px">
        ${t('products_menu')} : ${compterProduits()}/${CONFIG.MAX_PRODUITS_GRATUIT} · ${t('sales')} : ${compterVentes()}/${CONFIG.MAX_VENTES_GRATUIT}
      </div>
      <button style="background:#fff;color:#d97706;border:none;border-radius:10px;padding:10px 16px;font-weight:700;font-size:13px;cursor:pointer">✨ ${t('premium_activate')} - ${getPrix()}</button>
    `;
    banner.onclick = ouvrirEcranPremium;
    container.insertBefore(banner, container.firstChild);
  }

  // ============ INTERCEPTION DES FONCTIONS ============
  const _enregistrerProduit = window.enregistrerProduit;
  const _validerCommande = window.validerCommande;
  const _openScreen = window.openScreen;
  const _changerLangue = window.changerLangue;

  // Blocage produits
  window.enregistrerProduit = function() {
    if (!estPremium()) {
      const nom = document.getElementById('nomProduit').value.trim();
      const cb = document.getElementById('codeBarresProduit').value.trim();
      const produits = getProduits();
      let index = -1;
      if (cb) index = produits.findIndex(p => p.codeBarres === cb);
      if (index === -1 && nom) index = produits.findIndex(p => p.nom.toLowerCase() === nom.toLowerCase());
      if (index === -1 && produits.length >= CONFIG.MAX_PRODUITS_GRATUIT) {
        alert(t('premium_limit_products',{n:CONFIG.MAX_PRODUITS_GRATUIT}) + '\n\n' + t('premium_limit_products_2'));
        ouvrirEcranPremium();
        return;
      }
    }
    return _enregistrerProduit.apply(this, arguments);
  };

  // Blocage ventes
  window.validerCommande = function() {
    if (!estPremium() && compterVentes() >= CONFIG.MAX_VENTES_GRATUIT) {
      alert(t('premium_limit_sales',{n:CONFIG.MAX_VENTES_GRATUIT}) + '\n\n' + t('premium_limit_sales_2'));
      ouvrirEcranPremium();
      return;
    }
    return _validerCommande.apply(this, arguments);
  };

  // Réinjection bannière à chaque retour accueil
  window.openScreen = function(id) {
    _openScreen.apply(this, arguments);
    if (id === 'screenAccueil') setTimeout(injecterBanniere, 100);
  };

  // Réinjection bannière après changement de langue
  window.changerLangue = function(lang) {
    if (typeof _changerLangue === 'function') {
      _changerLangue.apply(this, arguments);
      setTimeout(injecterBanniere, 200);
    }
  };

  // Exposition globale
  window.ouvrirEcranPremium = ouvrirEcranPremium;
  window.acheterViaWhatsApp = acheterViaWhatsApp;
  window.validerCodeActivation = validerCodeActivation;
  window.estPremium = estPremium;
  window.injecterBanniere = injecterBanniere;
  window.getPrix = getPrix;

  // ============ INITIALISATION ============
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(injecterBanniere, 2200);
  });

  console.log('✅ Premium v5.1 chargé | Statut:', estPremium() ? 'PREMIUM' : 'GRATUIT');
})();