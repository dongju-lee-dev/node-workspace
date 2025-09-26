const workSpace = dataBase.get('workSpace');

//시작과 동시에 fetch로 workspace lastOpen을 통해서 연다.

// == text == 

const text = document.createElement('div');

text.textContent = 'This is workspace name';
text.style.color = 'var(--text-color)';
text.style.fontSize = '24px';
text.style.margin = '8px 5px 10px 5px';

dataBase.get('layout')['leftTop'].appendChild(text);

// == icon ==

const icon = document.createElement('div');

icon.classList.add('icon');
icon.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/workspace_save_icon.png)';
icon.style.backgroundSize = 'cover';

dataBase.get('layout')['leftTop'].appendChild(icon);

// == content ==

const response_wc = await fetch('/packages/assets/built_in_tool/assets/html/workspace-content.html');
const html_wc = await response_wc.text();

dataBase.get('SetSidePanelEvent')(icon, 'built_in_tool_workspace', 'Workspace', html_wc, 400, 800, (doc) => {
    fetch('/workspace?command=list')
        .then(response => response.text())
        .then(data => {
            const list = doc.querySelector('#workspace-list')
            const button = doc.querySelector('#workspace-add-btn');

            button.addEventListener('click', () => {
                const name = `${Math.random() * 10000000000000000}`;

                fetch(`/workspace?command=new&name=${name}`);

                list.appendChild(createItem(name));
                list.appendChild(button);
            });

            if (data === '') return;

            data.split(',').forEach(name => {
                list.appendChild(createItem(name));
                list.appendChild(button);
            });
        });
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
        text.textContent = name;

            const response = await fetch(`/workspace?command=load&name=${name}`);
            const json = await response.json();

            workSpace.unload();
            workSpace.load(name, json);
        
    });

    img1.addEventListener('click', (e) => {
        e.stopPropagation();

        if (currentInput) currentInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

        const input = document.createElement('input');
        input.type = 'text';
        input.value = nameNode.textContent;
        input.name = 'workspace-rename';
        input.style.fontSize = 'inherit';
        input.style.width = '70%';

        input.addEventListener('keydown', (e) => {
            e.stopPropagation();

            if (e.key === 'Enter') {
                fetch(`/workspace?command=rename&old_name=${nameNode.textContent}&new_name=${input.value}`);

                nameNode.textContent = input.value;
                li.replaceChild(nameNode, input);
                currentInput = null;
            }
        });

        li.replaceChild(input, nameNode);
        input.focus();
        currentInput = input;
    });

    img2.addEventListener('click', (e) => {
        e.stopPropagation();

        if (confirm(`'${nameNode.textContent}' Are you sure you want to delete the workspace?`)) {
            fetch(`/workspace?command=delete&name=${nameNode.textContent}`);

            li.remove();
        }
    });

    span.appendChild(img1);
    span.appendChild(img2);
    li.appendChild(nameNode);
    li.appendChild(span);

    return li;
}

// == save workspace ==

const save = document.createElement('div');

save.classList.add('icon');
save.style.backgroundImage = 'url(/packages/assets/built_in_tool/assets/image/workspace_file_save_icon.png)'
save.style.backgroundSize = 'cover';

save.addEventListener('mousedown', async e => {
    if (workSpace.name === null) {
        workSpace.name = prompt('Please define the name of the workspace file to be saved.');

        const response = await fetch(`/workspace?command=new&name=${workSpace.name}`);
        const text = await response.text();

        if (text !== '') {
            alert(`save error: ${text}`);

            return;
        }
    }

    const response = await fetch(`/workspace?command=save&name=${workSpace.name}`);
    const text = await response.text();

    if (text === '')
        alert('save success');
    else
        alert(`save error: ${text}`);
});

dataBase.get('layout')['leftTop'].appendChild(save);

// == control bar ==

const response_wcb = await fetch('/packages/assets/built_in_tool/assets/html/workspace-control-bar.html');
const html_wcb = await response_wcb.text();

const workSpaceTop = dataBase.get('workSpaceTop');

workSpaceTop.insertAdjacentHTML('beforeend', html_wcb);

const wcb = workSpaceTop.lastElementChild;

wcb.addEventListener('mousedown', e => {
    // workspace run
});

// == workspace node == 

const response_wnn = await fetch('/packages/assets/built_in_tool/assets/html/workspace-new-node.html');
const html_wnn = await response_wnn.text();

const windowsField = dataBase.get('window-field');
const node = dataBase.get('nodeKey');

windowsField.insertAdjacentHTML('beforeend', html_wnn);

const wnn = windowsField.lastElementChild;
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
    ['new node', (e) => {
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
    ['delete node', (e) => {
        if (workSpace.nodeSelect !== null) {
            workSpace.deleteNode(workSpace.nodeSelect.id);
        }
    }]
]);

document.addEventListener('keydown', e => wnn.style.display = 'none');
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