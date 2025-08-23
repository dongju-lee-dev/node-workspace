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

        this.addEventListener('mousedown', this.MovementMouseDown);
        this.addEventListener('mousemove', this.MovementMouseMove);
        this.addEventListener('mouseleave', this.MovementMouseLeave);
        document.addEventListener('mouseup', this.MovementMouseUp);
        this.addEventListener('wheel', this.ZoomWheel);

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
}