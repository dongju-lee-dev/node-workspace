const shadowDOM_tbr = dataBase.get('CreatePackageShadowDOM')('top-bar-right');
shadowDOM_tbr.host.style.display = 'flex';
shadowDOM_tbr.host.style.justifyContent = 'flex-start';
shadowDOM_tbr.host.order = '99999999';

const icon = document.createElement('div');

icon.classList.add('icon');
icon.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/package_icon.png)';
icon.style.backgroundSize = 'cover';
icon.style.margin = '6px';
icon.style.height = '36px';
icon.style.width = '36px';

shadowDOM_tbr.appendChild(icon);

const response = await fetch('/packages/assets/built_in_tool/assets/html/package-content.html');

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_package', 'Package', await response.text(), 400, 800, null, null);