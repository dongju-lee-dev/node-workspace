const shadowDOM_tbl = dataBase.get('CreatePackageShadowDOM')('top-bar-left');
shadowDOM_tbl.host.style.display = 'flex';
shadowDOM_tbl.host.style.justifyContent = 'flex-start';
shadowDOM_tbl.host.style.order = '2';

const icon = document.createElement('div');

icon.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/console_view_icon.png)';
icon.style.backgroundSize = 'cover';
icon.style.margin = '6px';
icon.style.height = '36px';
icon.style.width = '36px';

shadowDOM_tbl.appendChild(icon);

const response = await fetch('/packages/assets/built_in_tool/assets/html/console_view.html');

let content = null;
let content_on = false;
let content_buff = '';

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_console_view', 'Console View', await response.text(), 400, 600,
    async doc => {
        content = doc.querySelector('#content');
        content.textContent = content_buff;
        content_on = true;
    },
    doc => {
        content_on = false;
    });

const intervalIDSVR = setInterval(ServerConsoleRead, 2000);

async function ServerConsoleRead() {
    const response = await fetch('/packages/tool',
        {
            method: "POST",
            body: JSON.stringify({
                command: 'work',
                key: 'built_in_tool_console_view',
            })
        });

    if (response.status !== 200)
        return;

    const text = await response.text();

    if (text === '')
        return;

    content_buff += text;

    if (content_on)
        content.textContent += text;
}