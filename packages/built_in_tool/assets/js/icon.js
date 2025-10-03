const shadowDOM = dataBase.get('CreatePackageShadowDOM')('top-bar-left')
shadowDOM.host.style.order = '-1';

const img = document.createElement('img');

img.src = '/assets/image/icon.png';
img.style.padding = '5px';
img.style.width = '40px';

shadowDOM.appendChild(img);