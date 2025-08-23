import { Sidepanel } from "./side-panel.js";
import { Workspace } from "./work-space.js";

customElements.define('side-panel', Sidepanel);
customElements.define('work-space', Workspace);

let dataBase = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    let nodeResponse = fetch('/packages/node?command=all_node_key');
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

    //변수
    dataBase.set('layout', layout);
    dataBase.set('workSpace', document.querySelector('work-space'));
    dataBase.set('leftSidePanel', sidePanel[0]);
    dataBase.set('rightSidePanel', sidePanel[1]);

    //함수
    dataBase.set('SetSidePanelEvent', SetSidePanelEvent);

    let nodeBuff = (await (await nodeResponse).text()).split();
    let node = {};

    if (nodeBuff[0] !== '') {
        for (let nodeTextGroup in nodeBuff) {
            if (nodeTextGroup === '0') continue;

            let buff = nodeTextGroup.split('.');

            node[buff[0]] = buff[1].split(',');
        }
    }

    dataBase.set('node', node);

    let tool = (await (await toolResponse).text()).split(',');

    if (tool[0] !== '') {
        tool.forEach(key => {
            fetch(`/packages/tool?command=load&name=${key}`)
                .then(response => {
                    return response.text();
                })
                .then(script => {
                    new Function('dataBase', script)(dataBase);
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }

    dataBase.set('tool', tool);
});

window.addEventListener('beforeunload', (e) => {
    dataBase.get('tool').forEach(key => {
        fetch(`/packages/tool?command=unload&name=${key}`);
    });
});


function SetSidePanelEvent(element, name, content, width, start, exit) {
    if (!dataBase.has('sidePanel-setTool')) dataBase.set('sidePanel-setTool', new Map());

    element.addEventListener('click', (e) => {
        if (e.button !== 0) return;

        e.preventDefault();

        dataBase.get('leftSidePanel').setTool(name, content, width, start, exit);
    });

    element.addEventListener('contextmenu', (e) => {
        if (e.button !== 2) return;

        e.preventDefault();

        dataBase.get('rightSidePanel').setTool(name, content, width, start, exit);
    });
}