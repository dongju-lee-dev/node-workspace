const element = document.createElement('div');

element.classList.add('icon');
element.style.backgroundImage = 'url(/packages/assets/built_in_ui/assets/image/package_icon.png)';
element.style.backgroundSize = 'cover';

dataBase.get('layout')['rightTop'].appendChild(element);

const response = await fetch('/packages/assets/built_in_ui/assets/html/package-content.html');
const text = await response.text();

dataBase.get('SetSidePanelEvent')(element, 'built_in_ui_package', 'Package', text, 400, 800, null, null);