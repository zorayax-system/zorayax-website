/**
 * Zorayax Webchat Widget
 * Placeholder — collegare al webhook n8n del cliente specifico
 *
 * Uso:
 *   <script src="webchat-widget.js" data-webhook="https://n8n.zorayax.com/webhook/XXXX"></script>
 *
 * Oppure inizializzare manualmente:
 *   ZorayaxChat.init({ webhook: 'URL', color: '#00CFFF', nome: 'Studio Rossi' });
 */

(function() {
  'use strict';

  const ZorayaxChat = {
    config: {
      webhook: '',
      color: '#00CFFF',
      nome: 'Assistente',
      placeholder: 'Scrivi un messaggio...',
      benvenuto: 'Ciao! Come posso aiutarti?'
    },

    init: function(opts) {
      Object.assign(this.config, opts || {});
      this._inject();
      this._bind();
    },

    _inject: function() {
      const c = this.config;
      const css = `
        #zrx-btn{position:fixed;bottom:24px;right:24px;z-index:9999;
          width:56px;height:56px;border-radius:50%;background:${c.color};
          border:none;cursor:pointer;font-size:24px;box-shadow:0 4px 20px rgba(0,0,0,.25);
          transition:transform .2s}
        #zrx-btn:hover{transform:scale(1.1)}
        #zrx-box{position:fixed;bottom:96px;right:24px;z-index:9999;
          width:340px;max-height:480px;background:#fff;border-radius:16px;
          box-shadow:0 8px 40px rgba(0,0,0,.18);display:none;flex-direction:column;overflow:hidden}
        #zrx-head{background:${c.color};color:#020A14;padding:16px 20px;
          font-family:sans-serif;font-weight:700;font-size:15px}
        #zrx-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;
          font-family:sans-serif;font-size:14px;min-height:200px}
        .zrx-msg{padding:10px 14px;border-radius:12px;max-width:80%;line-height:1.5}
        .zrx-msg.bot{background:#f0f4ff;align-self:flex-start}
        .zrx-msg.usr{background:${c.color};color:#020A14;align-self:flex-end}
        #zrx-inp{display:flex;border-top:1px solid #eee;padding:10px}
        #zrx-inp input{flex:1;border:1px solid #ddd;border-radius:8px;
          padding:10px 14px;font-size:14px;outline:none;font-family:sans-serif}
        #zrx-inp button{background:${c.color};border:none;border-radius:8px;
          padding:10px 16px;margin-left:8px;cursor:pointer;font-size:18px}
      `;
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);

      document.body.insertAdjacentHTML('beforeend', `
        <button id="zrx-btn" title="Chatta con noi">💬</button>
        <div id="zrx-box">
          <div id="zrx-head">${c.nome}</div>
          <div id="zrx-msgs">
            <div class="zrx-msg bot">${c.benvenuto}</div>
          </div>
          <div id="zrx-inp">
            <input type="text" placeholder="${c.placeholder}" id="zrx-text">
            <button id="zrx-send">➤</button>
          </div>
        </div>
      `);
    },

    _bind: function() {
      const btn = document.getElementById('zrx-btn');
      const box = document.getElementById('zrx-box');
      const send = document.getElementById('zrx-send');
      const input = document.getElementById('zrx-text');

      btn.addEventListener('click', () => {
        box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
        if (box.style.display === 'flex') input.focus();
      });

      const sendMsg = () => {
        const text = input.value.trim();
        if (!text) return;
        this._addMsg(text, 'usr');
        input.value = '';
        this._send(text);
      };

      send.addEventListener('click', sendMsg);
      input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
    },

    _addMsg: function(text, type) {
      const msgs = document.getElementById('zrx-msgs');
      const div = document.createElement('div');
      div.className = 'zrx-msg ' + type;
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    _send: function(text) {
      if (!this.config.webhook) {
        this._addMsg('Webhook non configurato. Contatta Zorayax.', 'bot');
        return;
      }
      // TODO: collegare al webhook n8n reale
      fetch(this.config.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, timestamp: new Date().toISOString() })
      })
        .then(r => r.json())
        .then(data => this._addMsg(data.reply || data.message || 'Messaggio ricevuto!', 'bot'))
        .catch(() => this._addMsg('Si è verificato un errore. Riprova.', 'bot'));
    }
  };

  // Auto-init da attributo data-webhook sul tag script
  const scriptTag = document.currentScript;
  if (scriptTag) {
    const webhook = scriptTag.getAttribute('data-webhook');
    const nome = scriptTag.getAttribute('data-nome') || 'Assistente';
    const color = scriptTag.getAttribute('data-color') || '#00CFFF';
    if (webhook) ZorayaxChat.init({ webhook, nome, color });
  }

  window.ZorayaxChat = ZorayaxChat;
})();
