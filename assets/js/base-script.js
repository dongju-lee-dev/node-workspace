import { Sidepanel } from "./side-panel.js";
import { Workspace } from "./work-space.js";

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

customElements.define('side-panel', Sidepanel);
customElements.define('work-space', Workspace);


let dataBase = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    let nodeResponse = fetch('/packages/node?command=list');
    let toolResponse = fetch('/packages/tool?command=list');

    const layout = {
        "leftTop": document.querySelector('#top-bar-left-point'),
        "rightTop": document.querySelector('#top-bar-right-point'),
        "leftBottom": document.querySelector('#bottom-bar-left-point'),
        "rightBottom": document.querySelector('#bottom-bar-right-point'),
    }

    const sidePanel = document.querySelectorAll('side-panel');

    sidePanel[0].setOtherSidepanel(sidePanel[1]);
    sidePanel[1].setOtherSidepanel(sidePanel[0]);

    let toolLoadEnd = [];

    //변수
    dataBase.set('layout', layout);
    dataBase.set('workSpace', document.querySelector('work-space'));
    dataBase.set('workSpaceTop', document.querySelector('#work-space-top'));
    dataBase.set('workSpaceBottom', document.querySelector('#work-space-bottom'));
    dataBase.set('window-field', document.querySelector('#window-field'));
    dataBase.set('leftSidePanel', sidePanel[0]);
    dataBase.set('rightSidePanel', sidePanel[1]);

    //함수
    dataBase.set('SetSidePanelEvent', SetSidePanelEvent);

    let nodeBuff = (await (await nodeResponse).text()).split('#');
    let node = {};

    if (nodeBuff[0] !== '') {
        for (let i = 0; i < nodeBuff.length; ++i) {
            if (nodeBuff[i] === '0') continue;

            let buff = nodeBuff[i].split('.');

            node[buff[0]] = buff[1].split(',');
        }
    }

    dataBase.set('node', node);

    let tool = (await (await toolResponse).text()).split(',');

    if (tool[0] !== '') {
        dataBase.set('toolLoadEnd', toolLoadEnd);

        await Promise.all(tool.map(async key => {
            const response = await fetch(`/packages/tool?command=load&name=${key}`);
            const text = await response.text();

            await new AsyncFunction('dataBase', text)(dataBase);
        }));

        await Promise.all(toolLoadEnd.map(func => {
            func();
        }));

        dataBase.delete('toolLoadEnd');
    }

    dataBase.set('tool', tool);

    sidePanel[0].reload(dataBase);
    sidePanel[1].reload(dataBase);
});

window.addEventListener('beforeunload', (e) => {
    dataBase.get('tool').forEach(key => {
        fetch(`/packages/tool?command=unload&name=${key}`);
    });
});


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