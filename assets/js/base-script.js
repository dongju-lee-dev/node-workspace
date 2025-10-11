import { Sidepanel } from "./side-panel.js";
import { Workspace } from "./work-space.js";

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

customElements.define('side-panel', Sidepanel);
customElements.define('work-space', Workspace);


let dataBase = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    let nodeResponse = fetch('/packages/node?group=_all_key&name=', { method: "GET" }).then(response => response.json());
    let toolResponse = fetch('/packages/tool?key=_all_key', { method: "GET" }).then(response => response.json());

    const layout = {
        "leftTop": document.querySelector('#top-bar-left-point'),
        "rightTop": document.querySelector('#top-bar-right-point'),
        "leftBottom": document.querySelector('#bottom-bar-left-point'),
        "rightBottom": document.querySelector('#bottom-bar-right-point'),
    }

    const workSpace = document.querySelector('work-space');

    workSpace.dataBase = dataBase;

    const sidePanel = document.querySelectorAll('side-panel');

    sidePanel[0].setOtherSidepanel(sidePanel[1]);
    sidePanel[1].setOtherSidepanel(sidePanel[0]);

    // variable
    dataBase.set('layout', layout);
    dataBase.set('workSpace', workSpace);
    dataBase.set('workSpaceTop', document.querySelector('#work-space-top'));
    dataBase.set('workSpaceBottom', document.querySelector('#work-space-bottom'));
    dataBase.set('windowField', document.querySelector('#window-field'));
    dataBase.set('leftSidePanel', sidePanel[0]);
    dataBase.set('rightSidePanel', sidePanel[1]);
    dataBase.set('messageField', document.querySelector('#message-field'));

    // function
    dataBase.set('CreatePackageShadowDOM', CreatePackageShadowDOM);
    dataBase.set('SetSidePanelEvent', SetSidePanelEvent);
    dataBase.set('SetMessage', SetMessage);

    // 노드 초기화
    let nodeKey = await nodeResponse;
    let nodeValue = {};

    // Node initialization
    await Promise.all(Object.entries(nodeKey).map(async ([group, names]) => {
        const nodeGroup = {}

        await Promise.all(names.map(async name => {
            const response = await fetch(`/packages/node?group=${group}&name=${name}`, { method: "GET" });
            const json = await response.json();

            nodeGroup[name] = json;
        }));

        nodeValue[group] = nodeGroup;
    }));

    // Add node
    dataBase.set('nodeKey', nodeKey);
    dataBase.set('nodeValue', nodeValue);

    // Tool initialization
    let tool = await toolResponse;
    let toolLoadEnd = [];

    // Tool assignment
    dataBase.set('toolLoadEnd', toolLoadEnd);

    await Promise.all(tool.map(async key => {
        const text = await fetch(`/packages/tool`,
            {
                method: "POST",
                body: JSON.stringify({
                    command: 'load',
                    key: key
                })
            })
            .then(response => response.text());

        await new AsyncFunction('dataBase', text)(dataBase);
    }));

    await Promise.all(toolLoadEnd.map(func => {
        func();
    }));

    dataBase.delete('toolLoadEnd');

    // Add tool
    dataBase.set('tool', tool);

    // side panel rod
    sidePanel[0].reload(dataBase);
    sidePanel[1].reload(dataBase);
});

window.addEventListener('beforeunload', (e) => {
    dataBase.get('tool').forEach(key => {
        fetch(`/packages/tool`,
            {
                method: "POST",
                body: JSON.stringify({
                    command: 'unload',
                    key: key
                })
            }
        );
    });
});

// Create and return ShadowDOM at the desired location
function CreatePackageShadowDOM(target, html = null) {
    let div = document.createElement('div');

    div.attachShadow({ mode: 'open' });

    if (target === 'window-field')
        dataBase.get('windowField').appendChild(div);
    else if (target === 'work-space-top')
        dataBase.get('workSpaceTop').appendChild(div);
    else if (target === 'work-space-bottom')
        dataBase.get('workSpaceBottom').appendChild(div);
    else if (target === 'top-bar-left')
        dataBase.get('layout')['leftTop'].appendChild(div);
    else if (target === 'top-bar-right')
        dataBase.get('layout')['rightTop'].appendChild(div);
    else if (target === 'bottom-bar-left')
        dataBase.get('layout')['leftBottom'].appendChild(div);
    else if (target === 'bottom-bar-right')
        dataBase.get('layout')['rightBottom'].appendChild(div);

    if (html != null) div.shadowRoot.innerHTML = html;

    return div.shadowRoot;
}

// Functions registered in the side panel
function SetSidePanelEvent(element, key, name, content, minWidth, maxWidth, start, exit) {
    if (!dataBase.has('sidePanel-setTool')) dataBase.set('sidePanel-setTool', new Map());

    dataBase.get('sidePanel-setTool').set(key, { key, name, content, minWidth, maxWidth, start, exit });

    element.addEventListener('click', (e) => {
        if (e.button !== 0) return;

        e.preventDefault();

        dataBase.get('leftSidePanel').setTool(key, name, content, minWidth, maxWidth, start, exit);
    });

    element.addEventListener('contextmenu', (e) => {
        if (e.button !== 2) return;

        e.preventDefault();

        dataBase.get('rightSidePanel').setTool(key, name, content, minWidth, maxWidth, start, exit);
    });
}

// Message output function
function SetMessage(message, color = null) {
    const element = document.createElement('div');

    element.classList.add('message');
    element.textContent = message;

    const elementExit = document.createElement('div');

    elementExit.classList.add('message-exit');
    elementExit.addEventListener('click', e => {
        if (e.button !== 0) return;

        element.remove();
    });

    element.appendChild(elementExit);

    dataBase.get('messageField').appendChild(element);

    if (color !== null) element.style.color = color;
}