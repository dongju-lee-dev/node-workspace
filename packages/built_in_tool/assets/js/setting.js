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

let settingTable = null;
let addBtn = null;
let removeBtn = null;

let select = null;

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_setting', 'Setting', await response.text(), 400, 1200, async doc => {
    const settingResponse = await fetch('/setting?key=_all');
    const setting = await settingResponse.json();

    settingTable = doc.querySelector('#settings-table');

    for (const [key, value] of Object.entries(setting)) {
        createTR(key, value);
    }

    add = doc.querySelector('#add-setting-btn');

    add.addEventListener('click', async e => {
        const response = await fetch('/setting',
            {
                method: 'POST',
                body: JSON.stringify({ key: '' }),
            });

        if (response.status === 200)
            createTR('', null);
        else
            console.log(await response.text());
    });

    removeBtn = doc.querySelector('#remove-setting-btn');

    removeBtn.style.display = 'none';
    removeBtn.addEventListener('click', async e => {
        if (select === null) return;

        const response = await fetch(`/setting?key=${select.children[0].textContent}`, { method: "DELETE" });

        if (response.status === 200) {
            select.remove();
            removeBtn.style.display = 'none';
        }
        else
            console.log(await response.text());
    });
}, null);

function createTR(key, value) {
    const tr = document.createElement('tr');
    const tdk = document.createElement('td');
    const tdv = document.createElement('td');

    tr.addEventListener('click', e => {
        if (select)
            select.style.backgroundColor = 'var(--background-color)';

        select = tr;
        select.style.backgroundColor = 'var(--background-color-hover)';
        removeBtn.style.display = '';
    });

    tdk.textContent = key;
    tdk.addEventListener('click', () => {
        activateEdit(tdk, 'key');
    });

    tdv.textContent = JSON.stringify(value);
    tdv.addEventListener('click', () => {
        activateEdit(tdv, 'value');
    });

    tr.appendChild(tdk);
    tr.appendChild(tdv);
    settingTable.appendChild(tr);
}

function activateEdit(tdCell, fieldName) {
    if (tdCell.querySelector('input')) return;

    const currentValue = tdCell.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;

    input.style.width = '100%';
    input.style.height = '100%';
    input.style.boxSizing = 'border-box';
    input.style.border = 'none';
    input.style.padding = tdCell.style.padding;
    input.style.fontSize = tdCell.style.fontSize;
    input.style.color = tdCell.style.color;

    tdCell.textContent = '';
    tdCell.appendChild(input);

    input.focus();

    input.addEventListener('blur', () => {
        tdCell.removeChild(input);
        tdCell.textContent = currentValue;
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit(tdCell, input.value, fieldName);
        }
    });
}

async function saveEdit(tdCell, newValue, fieldName) {
    const tr = tdCell.parentNode;
    const tdk = tr.children[0];
    const tdv = tr.children[1];

    tdCell.textContent = newValue;

    if (fieldName === 'key') {
        const fResponse = await fetch(`/setting?key=${tdk.textContent}`, { method: 'DELETE' });

        if (fResponse.status !== 200) {
            console.log(await fResponse.text());
            return;
        }

        const sResponse = await fetch('/setting',
            {
                method: 'POST',
                body: JSON.stringify({
                    key: tdk.textContent,
                    value: tdv.textContent,
                })
            });

        if (sResponse.status !== 200) {
            console.log(await sResponse.text());
            return;
        }
    }
    else {
        const response = await fetch('/setting', {
            method: 'PATCH',
            body: JSON.stringify({ key: tdk.textContent, value: tdv.textContent }),
        });

        if (response.status !== 200) {
            console.log(await response.text());
            return;
        }
    }
}