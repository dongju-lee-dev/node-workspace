export class Workspace extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const workSpaceHTML = await fetch('/assets/html/work-space.html')
            .then(response => response.text());

        this.shadowRoot.innerHTML = workSpaceHTML;

        this.space = this.shadowRoot.querySelector('#space');
        this.spaceNode = this.shadowRoot.querySelector('#space-node');
        this.spaceNodeLink = this.shadowRoot.querySelector('#space-nodelink');
        this.spacePositionX = 0;
        this.spacePositionY = 0;
        this.spaceScale = 1;

        this.stateUpdate();

        this.addEventListener('mousedown', this.spaceMovementHeader);
        this.addEventListener('wheel', this.spaceZoomHeader);

        this.command = this.shadowRoot.querySelector('#command');

        this.addEventListener('contextmenu', this.commandHeader);

        const nodeHTML = await fetch('/assets/html/node.html')
            .then(response => response.text());

        this.nodePrefab = new DOMParser().parseFromString(nodeHTML, 'text/html');
        this.nodeSelect = null;
        this.nodeSelectEnd = null;
        this.node = {}
        this.name = null;

        this.space.appendChild(this.nodePrefab.querySelector('style'));

        fetch('/workspace?command=unload');
    }

    spaceMovementHeader = e => {
        if (e.button != 1) return;

        e.preventDefault();
        e.stopPropagation();

        let anim = null;

        const startX = e.clientX - this.spacePositionX;
        const startY = e.clientY - this.spacePositionY;

        const mousemove = e => {
            if (anim) cancelAnimationFrame(anim);

            anim = requestAnimationFrame(() => {
                this.spacePositionX = e.clientX - startX;
                this.spacePositionY = e.clientY - startY;

                this.stateUpdate();

                anim = null;
            });
        };

        const mouseup = e => {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        };

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    spaceZoomHeader = (e => {
        let anim = null;

        return e => {
            e.preventDefault();
            e.stopPropagation();

            const newScale = e.deltaY < 0 ? this.spaceScale * 1.1 : this.spaceScale * 0.9;

            if (newScale < 0.1 || newScale > 4) return;

            if (anim) cancelAnimationFrame(anim);

            anim = requestAnimationFrame(() => {

                const worldX = (e.clientX - this.spacePositionX) / this.spaceScale;
                const worldY = (e.clientY - this.spacePositionY) / this.spaceScale;

                this.spacePositionX = e.clientX - worldX * newScale;
                this.spacePositionY = e.clientY - worldY * newScale;
                this.spaceScale = newScale;

                this.stateUpdate();

                anim = null;
            });
        }
    })()

    stateUpdate = () => this.space.style.transform = `translate(${this.spacePositionX}px, ${this.spacePositionY}px) scale(${this.spaceScale})`;

    commandHeader = e => {
        e.preventDefault();
        e.stopPropagation();

        this.command.style.display = 'flex';

        let posX = e.clientX;
        let posY = e.clientY;

        if (posX + this.command.offsetWidth > window.innerWidth)
            posX -= this.command.offsetWidth;
        if (posY + this.command.offsetHeight > window.innerHeight)
            posY -= this.command.offsetHeight;

        this.command.style.left = `${posX}px`;
        this.command.style.top = `${posY}px`;

        const click = e => {
            this.command.style.display = 'none';

            document.removeEventListener('click', click);
        };

        document.addEventListener('click', click);
    }

    setCommand(command, order) {
        if (this.command.children.length > 0) {
            const line = document.createElement('div');

            line.classList.add('command-line');

            this.command.appendChild(line);
        }

        const group = document.createElement('div');

        group.classList.add('comamnd-menu-group');
        group.style.order = order;

        for (let i = 0; i < command.length; ++i) {
            const menu = document.createElement('div')

            menu.classList.add('command-menu');
            menu.textContent = command[i][0];
            menu.addEventListener('click', (e) => {
                if (e.button !== 0) return;

                e.preventDefault();
                e.stopPropagation();

                this.command.style.display = 'none';

                command[i][1](e);
            });

            group.appendChild(menu);
        }

        this.command.appendChild(group);
    }

    nodeHeader = (element, e) => {
        if (e.button != 0) return;

        e.preventDefault();
        e.stopPropagation();

        let anim = null;
        let time = null;

        let posX = element.positionX;
        let posY = element.positionY;

        const startX = (e.clientX - this.spacePositionX) / this.spaceScale - posX;
        const startY = (e.clientY - this.spacePositionY) / this.spaceScale - posY;

        const inputLink = element.children[1].children[0].querySelectorAll('.node-input');
        const outputLink = element.children[1].children[2].querySelectorAll('.node-output');

        const mousemove = e => {
            if (anim) cancelAnimationFrame(anim);

            anim = requestAnimationFrame(() => {
                posX = (e.clientX - this.spacePositionX) / this.spaceScale - startX;
                posY = (e.clientY - this.spacePositionY) / this.spaceScale - startY;

                element.style.transform = `translate(${posX}px, ${posY}px)`;

                for (let i = 0; i < inputLink.length; ++i) {
                    const ol = inputLink[i];
                    const rect = ol.getBoundingClientRect();
                    const posX = ((rect.left + rect.right) / 2 - this.spacePositionX) / this.spaceScale;
                    const posY = ((rect.top + rect.bottom) / 2 - this.spacePositionY) / this.spaceScale;

                    if (ol.link !== null) {
                        const d = ol.link.getAttribute('d');
                        const m = d.match(/M\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/);
                        const c = d.match(/C\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d+)/);

                        ol.link.setAttribute('d', `M ${m[1]} ${m[2]} C ${c[1]} ${c[2]}, ${posX - 200} ${posY}, ${posX} ${posY}`);
                    }
                }

                for (let i = 0; i < outputLink.length; ++i) {
                    const ol = outputLink[i];
                    const rect = ol.getBoundingClientRect();
                    const posX = ((rect.left + rect.right) / 2 - this.spacePositionX) / this.spaceScale;
                    const posY = ((rect.top + rect.bottom) / 2 - this.spacePositionY) / this.spaceScale;

                    for (let j = 0; j < ol.link.length; ++j) {
                        if (ol.link[j] !== null) {

                            const d = ol.link[j].getAttribute('d');
                            const c = d.match(/C\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d+)/);

                            ol.link[j].setAttribute('d', `M ${posX} ${posY} C ${posX + 200} ${posY}, ${c[3]} ${c[4]}, ${c[5]} ${c[6]}`);
                        }
                    }
                }

                anim = null;
            });
        };

        const mouseup = e => {
            element.positionX = posX;
            element.positionY = posY;

            if (time) clearTimeout(time);

            time = setTimeout(() => {
                this.movementNode(element.id, element.positionX, element.positionY);

                time = null;
            }, 500);

            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        };

        element.classList.add('node-select');

        this.selectNodeOrNodeLink(element, () => {
            element.classList.remove('node-select');
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        });

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    nodeInputHeader = (element, elementPort, elementColor, e) => {
        if (e.button != 0) return;

        e.preventDefault();
        e.stopPropagation();

        let anim = null;

        const link = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        const rect = elementColor.getBoundingClientRect();
        const startX = ((rect.left + rect.right) / 2 - this.spacePositionX) / this.spaceScale;
        const startY = ((rect.top + rect.bottom) / 2 - this.spacePositionY) / this.spaceScale;

        this.spaceNodeLink.appendChild(link);

        const mousemove = e => {
            if (anim) cancelAnimationFrame(anim);

            anim = requestAnimationFrame(() => {
                link.setAttribute('d', `M ${startX} ${startY} Q ${startX - 200} ${startY}, ${(e.clientX - this.spacePositionX) / this.spaceScale} ${(e.clientY - this.spacePositionY) / this.spaceScale}`);

                anim = null;
            });
        };

        const mouseup = e => {
            const composed = e.composedPath();

            if (composed[1].classList.contains('node-output')) {
                if (elementPort.link !== null) this.unlinkNode(elementPort.link);

                const node = composed[4];
                const port = composed[1];
                const colorRect = composed[0].getBoundingClientRect();

                if (this.linkNode(
                    port,
                    node.id,
                    port.port,
                    ((colorRect.left + colorRect.right) / 2 - this.spacePositionX) / this.spaceScale,
                    ((colorRect.top + colorRect.bottom) / 2 - this.spacePositionY) / this.spaceScale,
                    elementPort,
                    element.id,
                    elementPort.port,
                    startX,
                    startY,
                    link
                ) === false) link.remove()
            } else
                link.remove();

            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    nodeOutputHeader = (element, elementPort, elementColor, e) => {
        if (e.button != 0) return;

        e.preventDefault();
        e.stopPropagation();

        let anim = null;

        const link = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        const rect = elementColor.getBoundingClientRect();
        const startX = ((rect.left + rect.right) / 2 - this.spacePositionX) / this.spaceScale;
        const startY = ((rect.top + rect.bottom) / 2 - this.spacePositionY) / this.spaceScale;

        this.spaceNodeLink.appendChild(link);

        const mousemove = e => {
            if (anim) cancelAnimationFrame(anim);

            anim = requestAnimationFrame(() => {
                link.setAttribute('d', `M ${startX} ${startY} Q ${startX + 200} ${startY}, ${(e.clientX - this.spacePositionX) / this.spaceScale} ${(e.clientY - this.spacePositionY) / this.spaceScale}`);

                anim = null;
            });
        };

        const mouseup = e => {
            const composed = e.composedPath();

            if (composed[1].classList.contains('node-input')) {
                const node = composed[4];
                const port = composed[1];
                const colorRect = composed[0].getBoundingClientRect();

                if (port.link !== null) this.unlinkNode(port.link);

                if (this.linkNode(
                    elementPort,
                    element.id,
                    elementPort.port,
                    startX,
                    startY,
                    port,
                    node.id,
                    port.port,
                    ((colorRect.left + colorRect.right) / 2 - this.spacePositionX) / this.spaceScale,
                    ((colorRect.top + colorRect.bottom) / 2 - this.spacePositionY) / this.spaceScale,
                    link
                ) === false) link.remove();
            } else
                link.remove();

            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    nodeLinkHeader = (element, e) => {
        if (e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        element.style.filter = 'url(#space-nodelink-select)'

        this.selectNodeOrNodeLink(element, () => element.style.filter = '');
    }

    selectNodeOrNodeLink(select, selectEnd) {
        if (this.nodeSelectEnd && this.nodeSelect)
            this.nodeSelectEnd();

        this.nodeSelectEnd = selectEnd;
        this.nodeSelect = select;
    }

    unload() {
        this.spaceNodeLink.replaceChildren();
        this.spaceNode.replaceChildren();
    }

    load(name, space) {
        this.name = name;

        for (const key in space) {
            const nodeData = this.dataBase.get('nodeValue')[space[key].group][space[key].name];

            const element = this.nodePrefab.querySelector('.node').cloneNode(true);
            const nameN = element.querySelector('#name');
            const input = element.querySelector('#input');
            const output = element.querySelector('#output');
            const content = element.querySelector('#content');

            element.addEventListener('mousedown', e => this.nodeHeader(element, e));
            element.style.transform = `translate(${space[key].position_x}px, ${space[key].position_y}px)`;
            element.id = key;
            element.positionX = space[key].position_x;
            element.positionY = space[key].position_y;

            nameN.textContent = space[key].name;

            for (let i = 0; i < nodeData.input.length; ++i) {

                if (i !== 0 && i !== nodeData.input.length)
                    input.appendChild(this.nodePrefab.querySelector('.node-box').cloneNode(true));

                const pe = this.nodePrefab.querySelector('.node-input').cloneNode(true);

                pe.addEventListener('mousedown', e => this.nodeInputHeader(element, pe, pe.querySelector('#color'), e));
                pe.querySelector('#color').style.backgroundColor = nodeData.input[i].color;
                pe.querySelector('#name').textContent = nodeData.input[i].name;
                pe.port = i;
                pe.link = null;

                input.appendChild(pe);
            }

            for (let i = 0; i < nodeData.output.length; ++i) {
                if (i !== 0 && i !== nodeData.output.length)
                    output.appendChild(this.nodePrefab.querySelector('.node-box').cloneNode(true));

                const pe = this.nodePrefab.querySelector('.node-output').cloneNode(true);

                pe.addEventListener('mousedown', e => this.nodeOutputHeader(element, pe, pe.querySelector('#color'), e));
                pe.querySelector('#color').style.backgroundColor = nodeData.output[i].color;
                pe.querySelector('#name').textContent = nodeData.output[i].name;
                pe.port = i;
                pe.link = [];

                output.appendChild(pe);
            }

            content.innerHTML = nodeData.content;
            content.querySelectorAll('script').forEach(script => {
                new Function('dataBase', 'node', 'content', script.textContent)(this.dataBase, element, space[key].content);
            });

            this.spaceNode.appendChild(element);
            this.node[element.id] = element;
        }

        for (const nk in this.node) {
            if (!('input' in space[nk])) continue;

            const pa = space[nk].input;
            const p = this.node[nk].querySelectorAll('.node-input');

            for (let i = 0; i < p.length; ++i) {
                if (pa[i].id === null) continue;

                const svg = document.createElementNS("http://www.w3.org/2000/svg", 'path');

                const output = this.node[pa[i].id].querySelectorAll('.node-output')[pa[i].port];
                const outputColorRect = output.children[0].getBoundingClientRect();
                const outputColorPositionX = ((outputColorRect.left + outputColorRect.right) / 2 - this.spacePositionX) / this.spaceScale;
                const outputColorPositionY = ((outputColorRect.top + outputColorRect.bottom) / 2 - this.spacePositionY) / this.spaceScale;

                const inputColorRect = p[i].children[0].getBoundingClientRect();
                const inputColorPositionX = ((inputColorRect.left + inputColorRect.right) / 2 - this.spacePositionX) / this.spaceScale;
                const inputColorPositionY = ((inputColorRect.top + inputColorRect.bottom) / 2 - this.spacePositionY) / this.spaceScale;

                output.link.push(svg)
                p[i].link = svg;

                svg.addEventListener('mousedown', e => this.nodeLinkHeader(svg, e));
                svg.outputId = pa[i].id;
                svg.outputPort = pa[i].port;
                svg.inputId = parseInt(nk, 10);
                svg.inputPort = i;
                svg.setAttribute('d', `
                    M ${outputColorPositionX} ${outputColorPositionY}
                    C ${outputColorPositionX + 200} ${outputColorPositionY},
                    ${inputColorPositionX - 200} ${inputColorPositionY},
                    ${inputColorPositionX} ${inputColorPositionY}
                `);

                this.spaceNodeLink.appendChild(svg);
            }
        }
    }

    async createNode(group, name, positionX, positionY) {
        const response = await fetch(`/workspace/editor?command=create&node_group=${group}&node_name=${name}&position_x=${positionX}&position_y=${positionY}`);
        const param = new URLSearchParams(await response.text());

        if (param.get('status') !== "success") {
            console.log(param.get("message"));

            return;
        }

        const nodeData = this.dataBase.get('nodeValue')[group][name];

        const element = this.nodePrefab.querySelector('.node').cloneNode(true);
        const nameN = element.querySelector('#name');
        const input = element.querySelector('#input');
        const output = element.querySelector('#output');
        const content = element.querySelector('#content');

        element.addEventListener('mousedown', e => this.nodeHeader(element, e));
        element.style.transform = `translate(${positionX}px, ${positionY}px)`;
        element.id = parseInt(param.get('id'), 10);
        element.positionX = positionX;
        element.positionY = positionY;

        nameN.textContent = name;

        for (let i = 0; i < nodeData.input.length; ++i) {

            if (i !== 0 && i !== nodeData.input.length)
                input.appendChild(this.nodePrefab.querySelector('.node-box').cloneNode(true));

            const pe = this.nodePrefab.querySelector('.node-input').cloneNode(true);

            pe.addEventListener('mousedown', e => this.nodeInputHeader(element, pe, pe.querySelector('#color'), e));
            pe.querySelector('#color').style.backgroundColor = nodeData.input[i].color;
            pe.querySelector('#name').textContent = nodeData.input[i].name;
            pe.port = i;
            pe.link = null;

            input.appendChild(pe);
        }

        for (let i = 0; i < nodeData.output.length; ++i) {
            if (i !== 0 && i !== nodeData.output.length)
                output.appendChild(this.nodePrefab.querySelector('.node-box').cloneNode(true));

            const pe = this.nodePrefab.querySelector('.node-output').cloneNode(true);

            pe.addEventListener('mousedown', e => this.nodeOutputHeader(element, pe, pe.querySelector('#color'), e));
            pe.querySelector('#color').style.backgroundColor = nodeData.output[i].color;
            pe.querySelector('#name').textContent = nodeData.output[i].name;
            pe.port = i;
            pe.link = [];

            output.appendChild(pe);
        }

        content.innerHTML = nodeData.content;
        content.querySelectorAll('script').forEach(script => {
            new Function('dataBase', 'node', 'content', script.textContent)(this.dataBase, element, null);
        });

        this.spaceNode.appendChild(element);
        this.node[element.id] = element;
    }

    async deleteNode(id) {
        const n = this.node[id];

        const input = n.querySelectorAll('.node-input');
        const output = n.querySelectorAll('.node-output');

        for (let i = 0; i < input.length; ++i) {
            if (input[i].link !== null) await this.unlinkNode(input[i].link)
        }
        for (let i = 0; i < output.length; ++i) {
            for (let j = output[i].link.length - 1; j >= 0; --j) {
                if (output[i].link[j] !== null) await this.unlinkNode(output[i].link[j]);
            }
        }

        const response = await fetch(`/workspace/editor?command=delete&id=${id}`);
        const param = new URLSearchParams(await response.text());

        if (param.get("status") === "success")
            n.remove();
        else
            console.log(param.get("message"));
    }

    async movementNode(id, positionX, positionY) {
        const response = await fetch(`/workspace/editor?command=movement&id=${id}&position_x=${positionX}&position_y=${positionY}`);
        const param = new URLSearchParams(await response.text());

        if (param.get("status") !== "success")
            console.log(param.get("message"));
    }

    async contentNode(id, content) {
        const response = await fetch(`/workspace/editor?command=content&id=${id}&content=${content}`);
        const param = new URLSearchParams(await response.text());

        if (param.get("status") !== "success")
            console.log(param.get("message"));
    }

    async linkNode(outputPortElement, outputId, outputPort, outputPositionX, outputPositionY, inputPortElement, inputId, inputPort, inputPositionX, inputPositionY, svg = null) {
        const response = await fetch(`/workspace/editor?command=link&id_o=${outputId}&port_o=${outputPort}&id_i=${inputId}&port_i=${inputPort}`);
        const param = new URLSearchParams(await response.text());

        if (param.get('status') !== "success") {
            console.log(param.get("message"));

            return false;
        }

        if (svg === null)
            svg = document.createElementNS("http://www.w3.org/2000/svg", 'path');

        outputPortElement.link.push(svg);
        inputPortElement.link = svg;

        svg.addEventListener('mousedown', e => this.nodeLinkHeader(svg, e));
        svg.outputId = outputId;
        svg.outputPort = outputPort;
        svg.inputId = inputId;
        svg.inputPort = inputPort;
        svg.setAttribute('d', `
            M ${outputPositionX} ${outputPositionY}
            C ${outputPositionX + 200} ${outputPositionY},
            ${inputPositionX - 200} ${inputPositionY},
            ${inputPositionX} ${inputPositionY}
            `);

        this.spaceNodeLink.appendChild(svg);

        return true;
    }

    async unlinkNode(nodelink) {
        const response = await fetch(`/workspace/editor?command=unlink&id_o=${nodelink.outputId}&port_o=${nodelink.outputPort}&id_i=${nodelink.inputId}&port_i=${nodelink.inputPort}`);
        const param = new URLSearchParams(await response.text());

        if (param.get('status') !== "success") {
            console.log(param.get("message"));

            return;
        }

        this.node[nodelink.outputId].children[1].children[2].children[nodelink.outputPort].link = this.node[nodelink.outputId].children[1].children[2].children[nodelink.outputPort].link.filter(item => item !== nodelink);
        this.node[nodelink.inputId].children[1].children[0].children[nodelink.inputPort].link = null;

        nodelink.remove();
    }

    async runNode(selectNodeID, open = null, message = null, error = null, close = null) {
        const socket = new WebSocket(`/workspace/runtime`);

        socket.addEventListener('open', e => {
            if (typeof open !== 'function') {
                socket.send(`${selectNodeID}`);
            }
            else open(e);
        });

        socket.addEventListener('message', e => {
            if (typeof message !== 'funciton') {
                const param = new URLSearchParams(e.data);

                if (param.get('status') === 'success') {
                    const node = this.node[parseInt(param.get('id'), 10)];
                    const content = param.get('content');

                    node.classList.remove('node-error')
                    node.querySelector('#content').querySelectorAll('script').forEach(script => {
                        new Function('dataBase', 'node', 'content', script.textContent)(this.dataBase, node, content);
                    });
                }
                else
                    this.node[parseInt(param.get('id'), 10)].classList.add('node-error')
            }
            else message(e);
        });

        socket.addEventListener('error', e => {
            if (typeof error !== 'function') { } else error(e);
        });

        socket.addEventListener('close', e => {
            if (typeof close !== 'function') { } else close(e);
        });
    }
}