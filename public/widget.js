(function () {
  if (document.getElementById('unicrm-wa-widget-root')) return;

  var currentScript = document.currentScript;
  if (!currentScript) {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
        currentScript = scripts[i];
        break;
      }
    }
  }

  var rawPhone = (currentScript && currentScript.getAttribute('data-phone')) || '';
  var cleanPhone = rawPhone.replace(/\D/g, '');
  var brand = (currentScript && currentScript.getAttribute('data-brand')) || 'Chat with us';
  var greeting = (currentScript && currentScript.getAttribute('data-greeting')) || 'Hi there! 👋 How can we help you today?';
  var defaultMsg = (currentScript && currentScript.getAttribute('data-message')) || '';
  var brandColor = (currentScript && currentScript.getAttribute('data-color')) || '#25D366';
  var position = (currentScript && currentScript.getAttribute('data-position')) === 'left' ? 'left' : 'right';

  var root = document.createElement('div');
  root.id = 'unicrm-wa-widget-root';
  root.style.position = 'fixed';
  root.style.bottom = '20px';
  root.style[position] = '20px';
  root.style.zIndex = '999999';
  root.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  var style = document.createElement('style');
  style.textContent = [
    '#unicrm-wa-widget-btn {',
    '  width: 60px; height: 60px; border-radius: 50%; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center;',
    '  box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: transform 0.2s ease, box-shadow 0.2s ease;',
    '  border: none; outline: none; padding: 0;',
    '}',
    '#unicrm-wa-widget-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }',
    '#unicrm-wa-popup {',
    '  display: none; position: absolute; bottom: 75px; ' + position + ': 0;',
    '  width: 320px; background: #ffffff; border-radius: 16px;',
    '  box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden;',
    '  animation: unicrmFadeIn 0.2s ease-out forwards;',
    '}',
    '@keyframes unicrmFadeIn {',
    '  from { opacity: 0; transform: translateY(10px); }',
    '  to { opacity: 1; transform: translateY(0); }',
    '}',
    '.unicrm-header { padding: 16px; color: #ffffff; display: flex; align-items: center; justify-content: space-between; }',
    '.unicrm-header-info { display: flex; align-items: center; gap: 10px; }',
    '.unicrm-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }',
    '.unicrm-title { font-size: 15px; font-weight: 600; margin: 0; line-height: 1.2; }',
    '.unicrm-status { font-size: 11px; opacity: 0.9; margin-top: 2px; display: flex; align-items: center; gap: 4px; }',
    '.unicrm-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }',
    '.unicrm-close-btn { background: none; border: none; color: #ffffff; font-size: 18px; cursor: pointer; padding: 0; opacity: 0.8; }',
    '.unicrm-close-btn:hover { opacity: 1; }',
    '.unicrm-body { padding: 16px; background: #e5ddd5; background-image: radial-gradient(#d1c7bc 1px, transparent 1px); background-size: 16px 16px; }',
    '.unicrm-bubble { background: #ffffff; border-radius: 0 12px 12px 12px; padding: 12px; font-size: 13px; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.4; position: relative; }',
    '.unicrm-footer { padding: 12px 16px; background: #ffffff; }',
    '.unicrm-chat-btn {',
    '  width: 100%; border-radius: 9999px; padding: 10px 16px; color: #ffffff;',
    '  font-size: 13px; font-weight: 600; text-align: center; display: block;',
    '  text-decoration: none; border: none; cursor: pointer; transition: opacity 0.2s;',
    '}',
    '.unicrm-chat-btn:hover { opacity: 0.92; }'
  ].join('\n');

  var waIcon = '<svg width="34" height="34" viewBox="0 0 24 24" fill="#ffffff"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.29c0-4.51 3.67-8.17 8.18-8.17 2.19 0 4.24.85 5.79 2.4 1.54 1.55 2.4 3.61 2.39 5.8-.01 4.51-3.68 8.12-8.22 8.12zm4.49-6.11c-.24-.12-1.45-.71-1.67-.8-.23-.08-.39-.12-.56.12-.16.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.73-.65-1.22-1.45-1.36-1.69-.15-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.24.24-.4.08-.16.04-.31-.02-.43s-.56-1.36-.77-1.86c-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.45-.59 1.65-1.16.2-.58.2-1.07.14-1.16-.05-.12-.21-.19-.45-.31z"/></svg>';

  var waUrl = 'https://wa.me/' + cleanPhone + (defaultMsg ? '?text=' + encodeURIComponent(defaultMsg) : '');

  root.innerHTML = [
    '<div id="unicrm-wa-popup">',
    '  <div class="unicrm-header" style="background-color: ' + brandColor + ';">',
    '    <div class="unicrm-info-wrap">',
    '      <div class="unicrm-header-info">',
    '        <div class="unicrm-avatar">' + waIcon.replace('width="34"', 'width="22"').replace('height="34"', 'height="22"') + '</div>',
    '        <div>',
    '          <h3 class="unicrm-title">' + brand + '</h3>',
    '          <span class="unicrm-status"><span class="unicrm-dot"></span> Online</span>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <button type="button" class="unicrm-close-btn" id="unicrm-wa-close">&times;</button>',
    '  </div>',
    '  <div class="unicrm-body">',
    '    <div class="unicrm-bubble">' + greeting + '</div>',
    '  </div>',
    '  <div class="unicrm-footer">',
    '    <a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" class="unicrm-chat-btn" style="background-color: ' + brandColor + ';">',
    '      Start Chat on WhatsApp',
    '    </a>',
    '  </div>',
    '</div>',
    '<button id="unicrm-wa-widget-btn" type="button" aria-label="Open WhatsApp Chat" style="background-color: ' + brandColor + ';">',
    '  ' + waIcon,
    '</button>'
  ].join('\n');

  document.head.appendChild(style);
  document.body.appendChild(root);

  var btn = document.getElementById('unicrm-wa-widget-btn');
  var popup = document.getElementById('unicrm-wa-popup');
  var closeBtn = document.getElementById('unicrm-wa-close');

  if (btn && popup) {
    btn.addEventListener('click', function () {
      popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    });
  }

  if (closeBtn && popup) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      popup.style.display = 'none';
    });
  }
})();
