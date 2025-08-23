//시작과 동시에 fetch로 workspace lastOpen을 통해서 연다.

const text = document.createElement('div');

text.textContent = 'This is workspace name';
text.style.color = 'var(--text-color)';
text.style.fontSize = '24px';
text.style.margin = '8px 5px 10px 5px';

dataBase.get('layout')['leftTop'].appendChild(text);

const icon = document.createElement('div');

icon.classList.add('icon');
icon.style.backgroundImage = 'url(/packages/assets/built_in_ui/assets/image/workspace_save_icon.png)';
icon.style.backgroundSize = 'cover';

dataBase.get('layout')['leftTop'].appendChild(icon);

const response = await fetch('/packages/assets/built_in_ui/assets/html/workspace-content.html');
const data = await response.text();

dataBase.get('SetSidePanelEvent')(
    icon,
    'built_in_ui_workspace',
    'Workspace',
    data,
    400,
    800,
    (doc) => {
        fetch('/workspace/save?command=list')
            .then(response => response.text())
            .then(data => init(doc, data));
    },
    null
);

let currentInput = null;

function init(doc, data) {
    const list = doc.querySelector('#list')
    const button = doc.querySelector('#add-btn');

    button.addEventListener('click', () => {
        list.appendChild(createItem(`workspace ${list.children.length}`));
        list.appendChild(button);
    });

    if (data === '') return;

    data.split(',').forEach(name => {
        list.appendChild(createItem(name));
        list.appendChild(button);
    });
}

function createItem(name) {
    fetch(`/workspace/save?command=new&name=${name}`);

    const li = document.createElement('li');
    const span = document.createElement('span');
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');

    li.classList.add('item');
    span.classList.add('icon-layout');
    img1.classList.add('icon');
    img2.classList.add('icon');
    img1.src = '/packages/assets/built_in_ui/assets/image/workspace_rename_icon.png';
    img2.src = '/packages/assets/built_in_ui/assets/image/workspace_delete_icon.png';

    const nameNode = document.createElement('span');
    nameNode.textContent = name;
    nameNode.style.marginRight = '10px';

    li.addEventListener('click', (e) => {
        //dataBase.get('workSpace')
        // 여기에요 ==============================================

        console.log('open')
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
                fetch(`/workspace/save?command=new&old_name=${nameNode.textContent}&new_name=${input.value}`);

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
            fetch(`/workspace/save?command=delete&name=${nameNode.textContent}`);
    
            li.remove();
        }
    });

    span.appendChild(img1);
    span.appendChild(img2);
    li.appendChild(nameNode);
    li.appendChild(span);

    return li;
}