const img = document.createElement('img');

img.src = '/assets/image/icon.png';
img.style.padding = '5px';
img.style.width = '40px';

dataBase.get('layout')['leftTop'].appendChild(img);