/* Instalação como aplicativo + atualização automática segura do PDV Manu.
   Regra de ouro: nunca recarrega no meio de uma venda. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  const CHECK_EVERY_MS = 10 * 60 * 1000;   // procura versão nova a cada 10 min
  const IDLE_BEFORE_AUTO_MS = 2 * 60 * 1000; // atualiza sozinho após 2 min parado e sem venda aberta
  let waitingWorker = null;
  let reloading = false;
  let lastActivity = Date.now();
  let banner = null;

  ['keydown', 'pointerdown', 'touchstart', 'wheel'].forEach(ev =>
    window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true, capture: true }));

  // Está seguro trocar de versão agora?
  function safeToReload() {
    try {
      if (typeof DB !== 'undefined' && DB && DB.cart && Array.isArray(DB.cart.items) && DB.cart.items.length) return false;
      if (typeof modalState !== 'undefined' && modalState) return false;
      if (typeof saving !== 'undefined' && saving) return false;
      if (typeof dirty !== 'undefined' && dirty) return false;
    } catch (e) { return false; }
    if (document.querySelector('.modal-backdrop:not(.hidden), dialog[open]')) return false;
    return true;
  }

  function applyUpdate() {
    if (!waitingWorker) return;
    if (!safeToReload()) {
      setBannerText('Termine a venda atual. A nova versão será aplicada logo depois.');
      return;
    }
    waitingWorker.postMessage('SKIP_WAITING');
  }

  function setBannerText(t) { if (banner) banner.querySelector('span').textContent = t; }

  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.setAttribute('role', 'status');
    banner.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;' +
      'background:#fff;color:#5a3340;border:1px solid #e7b9c3;box-shadow:0 8px 30px rgba(120,40,60,.18);' +
      'border-radius:14px;padding:10px 12px 10px 16px;display:flex;gap:12px;align-items:center;' +
      'font:500 14px Montserrat,system-ui,sans-serif;max-width:calc(100vw - 32px)';
    banner.innerHTML = '<span>✨ Nova versão do sistema disponível.</span>' +
      '<button type="button" style="border:0;border-radius:10px;padding:8px 14px;cursor:pointer;' +
      'background:linear-gradient(135deg,#d48a9a,#b76e79);color:#fff;font:600 13px Montserrat,system-ui,sans-serif">Atualizar agora</button>' +
      '<button type="button" aria-label="Depois" title="Depois" style="border:0;background:none;cursor:pointer;color:#9a6b77;font-size:18px;padding:4px">×</button>';
    const [btnNow, btnLater] = banner.querySelectorAll('button');
    btnNow.addEventListener('click', applyUpdate);
    btnLater.addEventListener('click', () => { banner.style.display = 'none'; });
    document.body.appendChild(banner);
  }

  function onWaiting(worker) {
    waitingWorker = worker;
    showBanner();
  }

  // Se parado há 2 min, sem venda aberta, aplica sozinho.
  setInterval(() => {
    if (waitingWorker && !reloading && Date.now() - lastActivity > IDLE_BEFORE_AUTO_MS && safeToReload()) {
      waitingWorker.postMessage('SKIP_WAITING');
    }
  }, 15 * 1000);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (reg.waiting && hadController) onWaiting(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          // Só avisa se já havia uma versão rodando (na primeira instalação não há o que atualizar).
          if (nw.state === 'installed' && navigator.serviceWorker.controller) onWaiting(nw);
        });
      });
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      setInterval(check, CHECK_EVERY_MS);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      window.addEventListener('online', check);
    }).catch(err => console.warn('[PWA] registro falhou', err));
  });
})();
