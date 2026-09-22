/* ================================================================
   PREMIUM.JS - Module Premium pour Gestion Pro
   Auteur : DAS PRO STUDIO
   ================================================================ */
(function() {
  'use strict';

  const CONFIG = {
    SECRET: 'DASPRO2026NATITIA',
    MAX_PRODUITS_GRATUIT: 3,
    MAX_VENTES_GRATUIT: 5,
    PRIX: '10.000 FCFA',
    WHATSAPP: '22794929210',
    PREFIX: 'GP'
  };

  function estPremium() {
    return localStorage.getItem('gestionPro_premium') === 'true';
  }

  function activerPremium() {
    localStorage.setItem('gestionPro_premium', 'true');
    localStorage.setItem('gestionPro_date_activation', new Date().toISOString());
  }

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

  function compterVentes() {
    try { return (JSON.parse(localStorage.getItem('gestionPro_commandes')) || []).length; }
    catch(e) { return 0; }
  }

  function compterProduits() {
    try { return (JSON.parse(localStorage.getItem('gestionPro_produits')) || []).length; }
    catch(e) { return 0; }
  }

  function ouvrirEcranPremium() {
    let ecran = document.getElementById('screenPremium');
    if (!ecran) {
      ecran = document.createElement('div');
      ecran.className = 'screen';
      ecran.id = 'screenPremium';
      ecran.innerHTML = `
        <div class="screen-title">✨ Version Premium</div>
        <div class="card" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none">
          <div style="font-size:22px;font-weight:800;margin-bottom:8px">🚀 Débloquez tout Gestion Pro</div>
          <div style="font-size:14px;opacity:.95">Passez à la version Premium et profitez de toutes les fonctionnalités sans limite.</div>
        </div>
        <div class="card">
          <div class="card-title">🎁 Ce que vous obtenez</div>
          <ul style="list-style:none;padding:0;font-size:14px;line-height:2;color:var(--text)">
            <li>✅ Produits illimités <span style="color:#94a3b8">(gratuit : ${CONFIG.MAX_PRODUITS_GRATUIT} max)</span></li>
            <li>✅ Ventes illimitées <span style="color:#94a3b8">(gratuit : ${CONFIG.MAX_VENTES_GRATUIT} max)</span></li>
            <li>✅ Toutes les fonctionnalités débloquées</li>
            <li>✅ Mises à jour gratuites</li>
            <li>✅ Support prioritaire</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title">💰 Prix</div>
          <div style="font-size:28px;font-weight:800;color:#10b981;text-align:center;margin:12px 0">${CONFIG.PRIX}</div>
          <div style="font-size:13px;color:var(--text-muted);text-align:center">Paiement unique - À vie</div>
        </div>
        <div class="card">
          <div class="card-title">📞 Comment acheter</div>
          <div style="font-size:14px;line-height:1.7;color:var(--text)">
            1. Cliquez sur <strong>"Acheter via WhatsApp"</strong><br>
            2. Payez par <strong>MyNita</strong> ou <strong>Wave</strong><br>
            3. Recevez votre <strong>code d'activation</strong><br>
            4. Entrez-le ci-dessous pour débloquer
          </div>
          <button class="btn btn-success" onclick="acheterViaWhatsApp()" style="margin-top:12px">💬 Acheter via WhatsApp</button>
        </div>
        <div class="card">
          <div class="card-title">🔑 Activer avec un code</div>
          <div class="form-group">
            <input class="input-field" id="codeActivationInput" placeholder="GP-XXXXX-XXXXX" style="text-transform:uppercase;font-family:monospace;font-size:16px;text-align:center;letter-spacing:2px" autocomplete="off"/>
          </div>
          <button class="btn btn-primary" onclick="validerCodeActivation()">✨ Activer Premium</button>
          <div id="messageActivation" style="text-align:center;margin-top:12px;font-size:13px"></div>
        </div>
        <button class="btn btn-outline" onclick="openScreen('screenAccueil')" style="margin-top:8px">⬅️ Retour</button>
      `;
      document.querySelector('.app-container').insertBefore(ecran, document.querySelector('.bottom-nav'));
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    ecran.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function acheterViaWhatsApp() {
    const message = encodeURIComponent(
      'Bonjour ! Je souhaite acheter la version Premium de Gestion Pro (' + CONFIG.PRIX + ').\n\n' +
      'Mon nom : \nMon pays : \n\n' +
      'Merci de m\'envoyer les instructions de paiement (MyNita ou Wave).'
    );
    window.open('https://wa.me/' + CONFIG.WHATSAPP + '?text=' + message, '_blank');
  }

  function validerCodeActivation() {
    const input = document.getElementById('codeActivationInput');
    const message = document.getElementById('messageActivation');
    const code = input.value.trim();
    if (!code) {
      message.style.color = '#ef4444';
      message.textContent = '⚠️ Veuillez entrer un code';
      return;
    }
    if (verifierCode(code)) {
      activerPremium();
      message.style.color = '#10b981';
      message.textContent = '✅ Code valide ! Activation...';
      setTimeout(() => {
        alert('🎉 Félicitations ! Votre version Premium est activée.');
        openScreen('screenAccueil');
        setTimeout(() => { window.location.reload(); }, 300);
      }, 800);
    } else {
      message.style.color = '#ef4444';
      message.textContent = '❌ Code invalide. Vérifiez et réessayez.';
    }
  }

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
      <div style="font-weight:800;font-size:16px;margin-bottom:6px">🚀 Version Gratuite</div>
      <div style="font-size:13px;opacity:.95;margin-bottom:10px">
        Produits : ${compterProduits()}/${CONFIG.MAX_PRODUITS_GRATUIT} · Ventes : ${compterVentes()}/${CONFIG.MAX_VENTES_GRATUIT}
      </div>
      <button style="background:#fff;color:#d97706;border:none;border-radius:10px;padding:10px 16px;font-weight:700;font-size:13px;cursor:pointer">✨ Activer Premium - ${CONFIG.PRIX}</button>
    `;
    banner.onclick = ouvrirEcranPremium;
    container.insertBefore(banner, container.firstChild);
  }

  const _enregistrerProduit = window.enregistrerProduit;
  const _validerCommande = window.validerCommande;
  const _openScreen = window.openScreen;

  window.enregistrerProduit = function() {
    if (!estPremium()) {
      const nom = document.getElementById('nomProduit').value.trim();
      const cb = document.getElementById('codeBarresProduit').value.trim();
      const produits = getProduits();
      let index = -1;
      if (cb) index = produits.findIndex(p => p.codeBarres === cb);
      if (index === -1 && nom) index = produits.findIndex(p => p.nom.toLowerCase() === nom.toLowerCase());
      if (index === -1 && produits.length >= CONFIG.MAX_PRODUITS_GRATUIT) {
        alert('⚠️ Limite gratuite atteinte : ' + CONFIG.MAX_PRODUITS_GRATUIT + ' produits maximum.\n\nPassez à la version Premium pour ajouter des produits illimités.');
        ouvrirEcranPremium();
        return;
      }
    }
    return _enregistrerProduit.apply(this, arguments);
  };

  window.validerCommande = function() {
    if (!estPremium() && compterVentes() >= CONFIG.MAX_VENTES_GRATUIT) {
      alert('⚠️ Limite gratuite atteinte : ' + CONFIG.MAX_VENTES_GRATUIT + ' ventes maximum.\n\nPassez à la version Premium pour enregistrer des ventes illimitées.');
      ouvrirEcranPremium();
      return;
    }
    return _validerCommande.apply(this, arguments);
  };

  window.openScreen = function(id) {
    _openScreen.apply(this, arguments);
    if (id === 'screenAccueil') setTimeout(injecterBanniere, 100);
  };

  window.ouvrirEcranPremium = ouvrirEcranPremium;
  window.acheterViaWhatsApp = acheterViaWhatsApp;
  window.validerCodeActivation = validerCodeActivation;
  window.estPremium = estPremium;

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(injecterBanniere, 2200);
  });

  console.log('✅ Premium chargé | Statut:', estPremium() ? 'PREMIUM' : 'GRATUIT');
})();