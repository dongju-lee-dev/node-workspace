import { Sidepanel } from "./side-panel.js";
import { Workspace } from "./work-space.js";

customElements.define('side-panel', Sidepanel);
customElements.define('work-space', Workspace);

let dataBase = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    let nodeResponse = fetch('/packages/node?command=all_node_key');
    let toolResponse = fetch('/packages/tool?command=list');

    const layout = {
        "leftTop":document.querySelector('#top-bar-left-point'),
        "rightTop":document.querySelector('#top-bar-right-point'),
        "leftBottom":document.querySelector('#bottom-bar-left-point'),
        "rightBottom":document.querySelector('#bottom-bar-right-point'),
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

    let toolBuff = (await (await toolResponse).text()).split();

    if (toolBuff[0] !== '') {
        Promise.all(
            toolBuff.map(key =>
                fetch(`${window.location.origin}/packages/tool?command=load&name=${key}`)
                    .then(response => {
                        return response.text();
                    })
            ))
            .then(script => {
                new Function('globalDataBase', script)(dataBase);
            });
    }

    sidePanel[0].reloadTool(dataBase);
    sidePanel[1].reloadTool(dataBase);
});

function SetSidePanelEvent(element, key, name, content, exit) {
    if (!dataBase.has('sidePanel-setTool')) dataBase.set('sidePanel-setTool', new Map());

    dataBase.get('sidePanel-setTool').set(key, () => {
        let sidePanel;

        if (e.button === 0)
            sidePanel = dataBase.get('leftSidePanel');
        else if (e.button === 2)
            sidePanel = dataBase.get('rightSidePanel');

        sidePanel.set(key, name, content, exit)
    });

    element.addEventListener('click', (e) => {
        dataBase.get('sidePanel-setTool').get(key)();
    });
}