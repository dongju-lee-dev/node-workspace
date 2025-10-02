const shadowDOM = dataBase.get('CreatePackageShadowDOM')('top-bar-left')

const img = document.createElement('img');

img.src = '/assets/image/icon.png';
img.style.padding = '5px';
img.style.width = '40px';
img.style.order = '-1';

shadowDOM.appendChild(img);