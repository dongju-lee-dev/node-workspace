const element = document.createElement('div');

element.classList.add('icon');
element.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/setting_icon.png)';
element.style.backgroundSize = 'cover';
element.style.order = '100000000';

dataBase.get('layout')['rightTop'].appendChild(element);

const response = await fetch('/packages/assets/built_in_tool/assets/html/setting-content.html');
const text = await response.text();

dataBase.get('SetSidePanelEvent')(element, 'built_in_tool_setting', 'Setting', text, 400, 800, null, null);
