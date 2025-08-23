export class Sidepanel extends HTMLElement {
    static html;

    size;
    otherSidepanel;

    name;
    content;
    width;
    exit;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        if (Sidepanel.html === undefined) {
            Sidepanel.html = fetch('/assets/html/side-panel.html')
                .then(response => {
                    return response.text();
                })
                .then(data => {
                    Sidepanel.html = data;

                    this.init();
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            Sidepanel.html.then(() => { this.init(); });
        }
    }

    static get observedAttributes() {
        return ['position'];
    }

    async init() {
        if (Sidepanel.html instanceof Promise) return;

        this.shadowRoot.innerHTML = Sidepanel.html;

        this.size = 0;

        this.name = this.shadowRoot.querySelector('#name');
        this.content = this.shadowRoot.querySelector('#content');
        this.width = 0;
        this.exit = null;

        this.leftArrow = this.shadowRoot.querySelector('#left-arrow');
        this.rightArrow = this.shadowRoot.querySelector('#right-arrow');
        this.exitIcon = this.shadowRoot.querySelector('#exit');
        this.resizable = this.shadowRoot.querySelector('#resizable');
        this.unfold = this.shadowRoot.querySelector('#unfold');

        this.exitIcon.addEventListener('click', this.Exit);
        this.resizable.addEventListener('mousedown', this.ResizableMouseDown);
        document.addEventListener('mousemove', this.ResizableMouseMove);
        document.addEventListener('mouseup', this.ResizableMouseUp);
        this.unfold.addEventListener('click', this.Unfold);

        if (this.getAttribute('point') === 'left') {
            this.classList.add('left');
            this.resizable.classList.add('resizable-left');
            this.unfold.classList.add('unfold-left');

            this.leftArrow.addEventListener('click', this.Fold);
            this.rightArrow.addEventListener('click', this.Change);
        }
        else {
            this.classList.add('right');
            this.resizable.classList.add('resizable-right');
            this.unfold.classList.add('unfold-right');

            this.leftArrow.addEventListener('click', this.Change);
            this.rightArrow.addEventListener('click', this.Fold);
        }
    }

    Fold = (e) => {
        if (this.getAttribute('point') === 'left')
            this.style.transform = `translateX(-${this.style.getPropertyValue('--size')})`;
        else
            this.style.transform = `translateX(${this.style.getPropertyValue('--size')})`;

        this.unfold.style.display = 'flex';
    }

    Unfold = (e) => {
        this.style.transform = `translateX(0px)`;
        this.unfold.style.display = 'none';
    }

    Change = (e) => {
        let name = this.otherSidepanel.getToolName();
        let content = this.otherSidepanel.getToolContent();
        let width = this.otherSidepanel.getToolWidth();
        let exit = this.otherSidepanel.getToolExit();

        this.otherSidepanel.setTool(this.getToolName(), this.getToolContent(), this.getToolWidth(), this.getToolExit());

        if (name !== '')
            this.setTool(name, content, exit, width);
        else
            this.Exit(null);
    }

    Exit = (e) => {
        if (this.exit !== null) this.exit(this.content);

        this.style.display = 'none';
        this.size = 0;
        this.name.textContent = '';
        this.content.innerHTML = '';
        this.width = 0;
    }

    isResizable = false;
    ResizableMouseDown = (e) => {
        if (e.button != 0) return;

        this.isResizable = true;
    }
    ResizableMouseMove = (e) => {
        if (!this.isResizable) return;

        if (this.getAttribute('point') === 'left') {
            if (e.clientX < window.innerWidth - this.otherSidepanel.size && e.clientX > 50) {
                if (e.clientX < this.width) return;

                this.size = e.clientX;
                this.style.setProperty('--size', `${e.clientX}px`);
            }
        }
        else {
            const buff = window.innerWidth - e.clientX;
            if (e.clientX > this.otherSidepanel.size && buff > 50) {
                if (buff < this.width) return;

                this.size = buff;
                this.style.setProperty('--size', `${buff}px`);
            }
        }

    }
    ResizableMouseUp = (e) => {
        if (e.button != 0) return;

        if (!this.isResizable) return;

        this.isResizable = false;
    }

    setOtherSidepanel(Sidepanel) {
        this.otherSidepanel = Sidepanel;
    }

    setTool(name, content, width, start, exit) {
        if (this.name.textContent === name) return;

        this.style.display = 'flex';
        this.style.setProperty('--size', `${width}px`);

        this.size = width;

        this.name.textContent = name;
        this.content.innerHTML = content;
        this.width = width;
        this.exit = exit;

        if (start !== null) start(this.content);
    }
    getToolName() {
        return this.name.textContent;
    }
    getToolContent() {
        return this.content.innerHTML;
    }
    getToolWidth() {
        return this.width;
    }
    getToolExit() {
        return this.exit;
    }
}