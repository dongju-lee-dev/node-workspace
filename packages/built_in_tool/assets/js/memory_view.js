const shadowDOM_tbl = dataBase.get('CreatePackageShadowDOM')('top-bar-left');
shadowDOM_tbl.host.style.display = 'flex';
shadowDOM_tbl.host.style.justifyContent = 'flex-start';
shadowDOM_tbl.host.style.order = '1';

const icon = document.createElement('div');

icon.classList.add('icon');
icon.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/memory_view_icon.png)';
icon.style.backgroundSize = 'cover';
icon.style.margin = '6px';
icon.style.height = '36px';
icon.style.width = '36px';

shadowDOM_tbl.appendChild(icon);

const response = await fetch('/packages/assets/built_in_tool/assets/html/memory_view.html');

let parent = null;
let intervalID = null;

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_memory_view', 'Memory View', await response.text(), 400, 600,
    async doc => {
        parent = doc.querySelector('#memory-table');
        intervalID = setInterval(ServerMemoryRead, 2000);
    },
    doc => {
        parent = null;
        clearInterval(intervalID);
    });

async function ServerMemoryRead() {
    const response = await fetch('/packages/tool',
        {
            method: "POST",
            body: JSON.stringify({
                command: 'work',
                key: 'built_in_tool_memory_view',
            })
        }
    );
    if (response.status !== 200) return;

    const json = await response.json();

    parent.textContent = '';

    for (const [key, value] of Object.entries(json)) {
        const tr = document.createElement('tr');
        const tdk = document.createElement('td');
        const tdv = document.createElement('td');

        tdk.textContent = key;
        tdv.textContent = value;

        tr.appendChild(tdk);
        tr.appendChild(tdv);
        parent.appendChild(tr);
    }
}