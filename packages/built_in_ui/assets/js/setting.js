const element = document.createElement('div');

element.classList.add('icon');
element.style.backgroundImage = 'url(/packages/assets/built_in_ui/assets/image/setting_icon.png)';
element.style.backgroundSize = 'cover';

dataBase.get('layout')['rightTop'].appendChild(element);

fetch('/packages/assets/built_in_ui/assets/html/setting-content.html')
    .then(response => {
        return response.text();
    })
    .then(data => {
        dataBase.get('SetSidePanelEvent')(element, 'Setting', data, 400, null, null);
    });