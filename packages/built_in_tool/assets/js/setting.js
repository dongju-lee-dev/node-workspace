const shadowDOM_tbr = dataBase.get('CreatePackageShadowDOM')('top-bar-right');
shadowDOM_tbr.host.style.display = 'flex';
shadowDOM_tbr.host.style.justifyContent = 'flex-start';
shadowDOM_tbr.host.style.width = '36px';
shadowDOM_tbr.host.style.heigth = '36px';
shadowDOM_tbr.host.style.margin = '6px';

const icon = document.createElement('div');

icon.classList.add('icon');
icon.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/setting_icon.png)';
icon.style.backgroundSize = 'cover';
icon.style.order = '100000000';
icon.style.width = '100%';

shadowDOM_tbr.appendChild(icon);

const response = await fetch('/packages/assets/built_in_tool/assets/html/setting-content.html');

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_setting', 'Setting', await response.text(), 400, 800, async doc => {
    const add = doc.querySelector('#add-btn');
    const remove = doc.querySelector('#remove-btn');

    add.addEventListener('click', e => {

    });

    remove.addEventListener('click', e => {

    });

    const setting = doc.querySelector('#setting-content');

    
}, null);
