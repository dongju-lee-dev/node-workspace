const workSpace = dataBase.get('workSpace');
const shadowDOM_tbl = dataBase.get('CreatePackageShadowDOM')('top-bar-left')

shadowDOM_tbl.host.style.display = 'flex';
shadowDOM_tbl.host.style.justifyContent = 'flex-start';
shadowDOM_tbl.host.style.order = '0';

// == text == 
const text = document.createElement('div');

text.textContent = 'This is workspace name';
text.style.color = 'var(--text-color)';
text.style.fontSize = '24px';
text.style.margin = '8px 5px 10px 5px';

shadowDOM_tbl.appendChild(text);

// == save folder ==
const saveFolder = document.createElement('div');

saveFolder.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/workspace_save_icon.png)';
saveFolder.style.backgroundSize = 'cover';
saveFolder.style.margin = '6px';
saveFolder.style.height = '36px';
saveFolder.style.width = '36px';

shadowDOM_tbl.appendChild(saveFolder);

// == save ==
const save = document.createElement('div');

save.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/workspace_file_save_icon.png)'
save.style.backgroundSize = 'cover';
save.style.margin = '6px';
save.style.height = '36px';
save.style.width = '36px';

save.addEventListener('click', async e => {
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    if (workSpace.name === null) {
        workSpace.name = prompt('Please define the name of the workspace file to be saved.');

        if (workSpace.name === null) return;

        const response = await fetch(`/workspace`,
            {
                method: "POST",
                body: JSON.stringify({
                    name: workSpace.name,
                })
            });

        if (response.status !== 200) {
            alert(`save error: ${await response.text()}`);
            return;
        }
    }

    const response = await fetch(`/workspace/save`,
        {
            method: "POST",
            body: JSON.stringify({
                name: workSpace.name,
            })
        });

    if (response.status === 200)
        alert('save success');
    else
        alert(`save error: ${await response.text()}`);
});

shadowDOM_tbl.appendChild(save);

// == side panel content ==

const response_wc = await fetch('/packages/assets/built_in_tool/assets/html/workspace-content.html');
const html_wc = await response_wc.text();

dataBase.get('SetSidePanelEvent')(saveFolder, 'built_in_tool_workspace', 'Workspace', html_wc, 400, 800, async doc => {
    const response = await fetch('/workspace')

    if (response.status !== 200) {
        console.log(await response.text());
        return;
    }

    const list = doc.querySelector('#workspace-list')
    const button = doc.querySelector('#workspace-add-btn');

    button.addEventListener('click', async e => {
        const name = `${Math.random() * 100000000000000000}`;

        const response = await fetch(`/workspace`,
            {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                })
            });

        if (response.status !== 200) {
            console.log(await response.text());
            return;
        }

        list.appendChild(createItem(name));
        list.appendChild(button);
    });

    for (const name of await response.json()) {
        list.appendChild(createItem(name));
        list.appendChild(button);
    }
}, null);

let currentInput = null;

function createItem(name) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');

    li.classList.add('workspace-item');
    span.classList.add('workspace-icon-layout');
    img1.classList.add('workspace-icon');
    img2.classList.add('workspace-icon');
    img1.src = '/packages/assets/built_in_tool/assets/image/workspace_rename_icon.png';
    img2.src = '/packages/assets/built_in_tool/assets/image/workspace_delete_icon.png';

    const nameNode = document.createElement('span');
    nameNode.textContent = name;
    nameNode.style.marginRight = '10px';

    li.addEventListener('click', async e => {
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        text.textContent = name;

        const response = await fetch(`/workspace/load?name=${name}`, { method: "GET" });

        if (response.status !== 200) {
            console.log(await response.text())
            return;
        }

        const responseN = await fetch('/workspace/node', { method: "GET" });

        if (responseN.status !== 200) {
            console.log(await response.text())
            return;
        }

        workSpace.unload();
        workSpace.load(name, await responseN.json());

    });

    img1.addEventListener('click', (e) => {
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        if (currentInput) currentInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        const input = document.createElement('input');
        input.type = 'text';
        input.value = nameNode.textContent;
        input.name = 'workspace-rename';
        input.style.fontSize = 'inherit';
        input.style.width = '70%';

        input.addEventListener('keydown', async e => {
            e.stopPropagation();

            if (e.key === 'Enter') {
                const response = await fetch(`/workspace/rename`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            old_name: nameNode.textContent,
                            new_name: input.value,
                        })
                    });

                if (response.status !== 200) {
                    console.log(await response.text())
                    return;
                }

                name = input.value;
                nameNode.textContent = input.value;
                li.replaceChild(nameNode, input);
                currentInput = null;
            }
        });

        li.replaceChild(input, nameNode);
        input.focus();
        currentInput = input;
    });

    img2.addEventListener('click', async e => {
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        if (confirm(`'${nameNode.textContent}' Are you sure you want to delete the workspace?`)) {
            const response = await fetch(`/workspace?name=${nameNode.textContent}`, { method: "DELETE" });

            if (response.status !== 200) {
                console.log(await response.text())
                return;
            }

            li.remove();
        }
    });

    span.appendChild(img1);
    span.appendChild(img2);
    li.appendChild(nameNode);
    li.appendChild(span);

    return li;
}

// == work space top control bar ==

const response_wcb = await fetch('/packages/assets/built_in_tool/assets/html/workspace-control-bar.html');
const wcb = dataBase.get('CreatePackageShadowDOM')('work-space-top', await response_wcb.text());

wcb.addEventListener('click', e => {
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    if (workSpace.nodeSelect !== null && workSpace.nodeSelect.classList.contains('node'))
        workSpace.runNode(workSpace.nodeSelect.id, null, null, null, null);
});

// == workspace node == 

const response_wnn = await fetch('/packages/assets/built_in_tool/assets/html/workspace-new-node.html');
const node = dataBase.get('nodeKey');
const wnn = dataBase.get('CreatePackageShadowDOM')('window-field', await response_wnn.text()).querySelector('#workspace-new-node');

let list = [];
let len = Object.keys(node).length;
let wnnSelect = false;
let wnnGroup = "";

for (const key in node) {
    if (len < node[key].length)
        len = node[key].length;
}

for (let i = 0; i < len; ++i) {
    const element = document.createElement('div');

    element.classList.add('workspace-node');
    element.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        if (wnnSelect) {
            workSpace.createNode(
                wnnGroup,
                element.textContent,
                (e.clientX - workSpace.spacePositionX) / workSpace.spaceScale,
                (e.clientY - workSpace.spacePositionY) / workSpace.spaceScale);
            wnn.style.display = 'none';

        } else {
            wnnSelect = true;
            wnnGroup = element.textContent;
            wnnInit(node[element.textContent]);
        }
    });

    wnn.appendChild(element);
    list.push(element);
}

workSpace.setCommand([
    [
        'new node', e => {
            let posX = e.clientX;
            let posY = e.clientY;

            if (posX + wnn.offsetWidth > window.innerWidth)
                posX -= wnn.offsetWidth;
            if (posY + wnn.offsetHeight > window.innerHeight)
                posY -= wnn.offsetHeight;

            wnn.style.display = 'flex';
            wnn.style.top = `${posY}px`;
            wnn.style.left = `${posX}px`;
            wnnSelect = false;
            wnnGroup = "";

            wnnInit(Object.keys(node));
        }],
    [
        'delete node', e => {
            if (workSpace.nodeSelect !== null && workSpace.nodeSelect.classList.contains('node'))
                workSpace.deleteNode(workSpace.nodeSelect.id);
        }
    ],
    [
        'delete node link', e => {
            if (workSpace.nodeSelect !== null && workSpace.nodeSelect.classList.contains('node-link'))
                workSpace.unlinkNode(workSpace.nodeSelect);
        }
    ]
]);

document.addEventListener('keyup', e => wnn.style.display = 'none');
document.addEventListener('mousedown', e => wnn.style.display = 'none');

function wnnInit(textList) {
    let i = 0;

    for (; i < textList.length; ++i) {

        list[i].textContent = textList[i];
        list[i].style.display = 'flex';
    }

    for (; i < list.length; ++i) {
        list[i].style.display = 'none';
    }
}