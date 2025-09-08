export class Workspace extends HTMLElement {
    positionX;
    positionY;
    scale;

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
}