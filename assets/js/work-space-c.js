// workspace 전체 리펙토링
// 제미나이가 말한 뭔가 한 가지의 작업이 있으면 하나의 이벤트 함수에 다 집어넣어서 추가적인 예외 처리를 제외할 수 있는 형태
// 노드, 노드 연결가 선택되는 것은 뷰포트 좌표를 사용하여 클릭되는 것을 측정하는 방식으로 변경
// dataset에 데이터를 보관하는 방법을 사용
// nodePrefab -> prefab
// nodeSelect -> select로 변경
// node -> (delete)
// 명시적 전역 변수 제거
// 기능에 대해서 조작성 강화 예로 특정 것이 확성화 되어있으면 무언가가 비활성화 된다.
// port의 dataset에 번호 추가
// 연결 방법
// 아웃풋에서 시작하면 기존에 있는 것을 유지하며 추가 인풋이면 기존의 것을 제거하고 추가
// 0. 요소를 하나 만들어 space에 추가
// 1. mousedown으로 뷰포트의 위치값을 이용해서 port에 다였으면 시작
// 2. mousemove로 드레그
// 3. mouseup 위치값으로 port면 성공 아니면 실패
// 4. 데이터는 dataset에서 가져오면 된다.
// 5. 아웃풋과 인풋 포트 모두에 요소가 있다고 dataset에 추가

export class Workspace extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        fetch('/assets/html/work-space.html')
            .then(response => {
                return response.text();
            })
            .then(data => {
                this.shadowRoot.innerHTML = data;

                this.init();
            })
            .catch(error => {
                console.log(error);
            });
    }

    async init() {
        const response = fetch('/setting?command=get&key=workspace-state');

        this.space = this.shadowRoot.getElementById('space');
        this.command = this.shadowRoot.getElementById('command');

        this.addEventListener('mousedown', this.MovementMouseDown);
        this.addEventListener('mousemove', this.MovementMouseMove);
        this.addEventListener('mouseleave', this.MovementMouseLeave);
        document.addEventListener('mouseup', this.MovementMouseUp);
        this.addEventListener('wheel', this.ZoomWheel);
        this.addEventListener('contextmenu', this.CommandContextmenu);
        this.addEventListener('mouseup', this.CommandMouseUp);
        document.addEventListener('keydown', this.CommandKeyDown);
        document.addEventListener('keydown', this.DeleteNodeKeyDown);

        let data = (await (await response).text()).split(',');

        if (data.length != 3) {
            fetch('/setting?command=set&key=workspace-state&data=0,0,1');
            this.positionX = 0;
            this.positionY = 0;
            this.scale = 1;
        }
        else {
            this.positionX = parseFloat(data[0]);
            this.positionY = parseFloat(data[1]);
            this.scale = parseFloat(data[2]);
        }

        this.nodePrefab = new DOMParser().parseFromString(await (await fetch('/assets/html/node.html')).text(), 'text/html');
        this.node = {}
        this.nodeSelect = null;

        this.space.appendChild(this.nodePrefab.querySelector('style'));

        this.updateSpace();
    }

    updateSpace() {
        this.space.style.transform = `translate(${this.positionX}px, ${this.positionY}px) scale(${this.scale})`;
    }

    isMovement = false;
    startMovementX = 0;
    startMovementY = 0;

    MovementMouseDown = (e) => {
        if (e.button != 1) return;
        e.preventDefault();

        this.isMovement = true;
        this.startMovementX = e.clientX - this.positionX;
        this.startMovementY = e.clientY - this.positionY;
    }
    MovementMouseMove = (e) => {
        if (!this.isMovement) return;
        e.preventDefault();

        this.positionX = e.clientX - this.startMovementX;
        this.positionY = e.clientY - this.startMovementY;
        this.updateSpace();
    }
    MovementMouseUp = (e) => {
        if (e.button != 1) return;
        e.preventDefault();

        this.isMovement = false;
    }
    MovementMouseLeave = (e) => {
        e.preventDefault();

        this.isMovement = false;
    }

    ZoomWheel = (e) => {
        e.preventDefault();

        const ratio = 1.1;
        const newScale = e.deltaY < 0 ? this.scale * ratio : this.scale / ratio;

        if (newScale < 0.1 || newScale > 4) return;

        if (this.rafld) {
            cancelAnimationFrame(this.rafId);
        }

        this.rafld = requestAnimationFrame(() => {
            const worldX = (e.clientX - this.positionX) / this.scale;
            const worldY = (e.clientY - this.positionY) / this.scale;

            this.scale = newScale;

            this.positionX = e.clientX - worldX * this.scale;
            this.positionY = e.clientY - worldY * this.scale;

            this.updateSpace();
            this.rafId = null;
        });
    }

    CommandContextmenu = (e) => {
        e.preventDefault();

        this.command.style.display = "flex";

        let posX = e.clientX;
        let posY = e.clientY;

        if (posX + this.command.offsetWidth > window.innerWidth)
            posX -= this.command.offsetWidth;
        if (posY + this.command.offsetHeight > window.innerHeight)
            posY -= this.command.offsetHeight;

        this.command.style.left = `${posX}px`;
        this.command.style.top = `${posY}px`;
    }

    CommandMouseUp = (e) => {
        if (e.button != 2)
            this.command.style.display = "none";
    }

    CommandKeyDown = (e) => {
        if (e.key === 'Escape') {
            this.command.style.display = "none";
        }
    }

    setCommand(command, order) {
        const TEXT_IDX = 0
        const FUNC_IDX = 1

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
            menu.textContent = command[i][TEXT_IDX];
            menu.addEventListener('click', command[i][FUNC_IDX]);
            menu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.command.style.display = 'none';
            });

            group.appendChild(menu);
        }

        this.command.appendChild(group);
    }

    UnselectNodeMouseDown = (e) => {
        e.preventDefault();

        if (this.nodeSelect !== null)
            this.nodeSelect.classList.remove('node-select');
    }

    DeleteNodeKeyDown = (e) => {
        if (e.key === "Delete") {
            e.preventDefault();
            e.stopPropagation();

            if (this.nodeSelect !== null)
                this.DeleteNode(this.nodeSelect.dataset.id);
        }
    }

    Load(data) {

    }

    NewNode(nodeGroup, nodeName, positionX, positionY) {
        fetch(`/workspace/editor?command=create&node_group=${nodeGroup}&node_name=${nodeName}&position_x=${positionX}&position_y=${positionY}`)
            .then(response => response.text())
            .then(text => {
                const param = new URLSearchParams(text);

                if (param.get('status') === "success") {
                    const nodeData = this.dataBase.get('nodeValue')[nodeGroup][nodeName];

                    const element = this.nodePrefab.querySelector('.node').cloneNode(true);
                    const name = element.querySelector('#name');
                    const input = element.querySelector('#input');
                    const output = element.querySelector('#output');
                    const content = element.querySelector('#content');

                    element.dataset.id = parseInt(param.get('id'), 10);
                    element.dataset.positionX = positionX;
                    element.dataset.positionY = positionY;
                    element.isMovement = false;
                    element.style.transform = `translate(${positionX}px, ${positionY}px)`;
                    element.addEventListener('mousedown', (e) => {
                        if (e.button !== 0) return;

                        e.preventDefault();
                        e.stopPropagation();

                        if (this.nodeSelect !== null)
                            this.nodeSelect.classList.remove('node-select');

                        this.nodeSelect = element;
                        this.nodeSelect.classList.add('node-select');
                    });
                    this.addEventListener('mousedown', (e) => {
                        if (e.button !== 0) return;

                        e.preventDefault();

                        if (this.nodeSelect !== null) {
                            this.nodeSelect.classList.remove('node-select');
                            this.nodeSelect = null;
                        }
                    });
                    element.addEventListener('mousedown', (e) => {
                        if (e.button !== 0) return;

                        element.isMovement = true
                        element.dataset.movementX = e.clientX / this.scale - element.dataset.positionX;
                        element.dataset.movementY = e.clientY / this.scale - element.dataset.positionY;
                    });
                    document.addEventListener('mousemove', (e) => {
                        if (e.button !== 0) return;
                        if (element.isMovement === false) return;

                        element.dataset.positionX = e.clientX / this.scale - element.dataset.movementX;
                        element.dataset.positionY = e.clientY / this.scale - element.dataset.movementY;
                        element.style.transform = `translate(${element.dataset.positionX}px, ${element.dataset.positionY}px)`;
                    });
                    document.addEventListener('mouseup', (e) => {
                        if (e.button !== 0) return;
                        if (element.isMovement === false) return;

                        element.isMovement = false;

                        this.MovementNode(element.dataset.id, element.dataset.positionX, element.dataset.positionY);
                    });

                    name.textContent = nodeName;

                    const linkMouseDown = (e) => {

                    }
                    const linkMouseMove = (e) => {

                    }
                    const linkMouseUp = (e) => {

                    }

                    for (let i = 0; i < nodeData.input.length; ++i) {

                        if (i !== 0 && i !== nodeData.input.length) {
                            const pb = this.nodePrefab.querySelector('.node-box').cloneNode(true);

                            input.appendChild(pb);
                        }

                        const pe = this.nodePrefab.querySelector('.node-input').cloneNode(true);

                        pe.querySelector('#color').style.backgroundColor = nodeData.input[i].color;
                        pe.querySelector('#name').textContent = nodeData.input[i].name;

                        input.appendChild(pe);
                    }

                    for (let i = 0; i < nodeData.output.length; ++i) {
                        if (i !== 0 && i !== nodeData.output.length) {
                            const pb = this.nodePrefab.querySelector('.node-box').cloneNode(true);

                            output.appendChild(pb);
                        }

                        const pe = this.nodePrefab.querySelector('.node-output').cloneNode(true);

                        pe.querySelector('#color').style.backgroundColor = nodeData.output[i].color;
                        pe.querySelector('#name').textContent = nodeData.output[i].name;

                        output.appendChild(pe);
                    }

                    content.innerHTML = nodeData.content;
                    content.querySelectorAll('script').forEach(script => {
                        new Function('dataBase', 'node', script.textContent)(this.dataBase, element);
                    });

                    this.node[element.dataset.id] = element;
                    this.space.appendChild(element);
                }
                else
                    console.log(param.get("message"));
            });
    }

    DeleteNode(node_id) {
        fetch(`/workspace/editor?command=delete&id=${node_id}`)
            .then(response => response.text())
            .then(text => {
                const param = new URLSearchParams(text);

                if (param.get("status") === "success")
                    this.node[node_id].remove();

                else
                    console.log(param.get("message"));
            });
    }

    MovementNode(node_id, position_x, position_y) {
        fetch(`/workspace/editor?command=movement&id=${node_id}&position_x=${position_x}&position_y=${position_y}`)
            .then(response => response.text())
            .then(text => {
                const param = new URLSearchParams(text);

                if (param.get("status") !== "success")
                    console.log(param.get("message"));
            });
    }

    ContentNode(node_id, node_content) {
        fetch(`/workspace/editor?command=content&id=${node_id}&content=${node_content}`)
            .then(response => response.text())
            .then(text => {
                const param = new URLSearchParams(text);

                if (param.get("status") !== "success")
                    console.log(param.get("message"));
            });
    }

    LinkNode(node_id_o, node_port_o, node_id_i, node_port_i) {
        fetch(`/workspace/editor?command=link&id_o=${node_id_o}&port_o=${node_port_o}&id_i=${node_id_i}&port_i=${node_port_i}`)
            .then(response => response.text())
            .then(text => {
                const param = new URLSearchParams(text);

                if (param.get("status") === "success") {
                    const element = this.nodePrefab.querySelector('.node-link');

                    //꾸미기
                    //이동에 대한 대책 추가

                    this.node[node_id_i].querySelectorAll('#input')[node_port_i].appendChild(element);
                }
                else
                    console.log(param.get("message"));
            });
    }

    UnlinkNode(node_id_o, node_port_o, node_id_i, node_port_i) {
        fetch(`/workspace/editor?command=unlink&id_o=${node_id_o}&port_o=${node_port_o}&id_i=${node_id_i}&port=${node_port_i}`)
            .then(response => response.text())
            .then(text => {
                const param = new URLSearchParams(text);

                if (param.get("status") === "success") {
                    //메모리 해제

                    this.node[node_id_i].querySelectorAll('#input')[node_port_i].children[0].remove();
                }
                else
                    console.log(param.get("message"));
            });
    }

    setDataBase(dataBase) {
        this.dataBase = dataBase;
    }
}