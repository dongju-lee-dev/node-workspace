export class Sidepanel extends HTMLElement {
    static html;

    size;
    otherSidepanel;

    key;
    name;
    content;
    minWidth;
    maxWidth;
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
        return ['point'];
    }

    async init() {
        if (Sidepanel.html instanceof Promise) return;

        this.shadowRoot.innerHTML = Sidepanel.html;

        this.size = 0;

        this.key = '';
        this.name = this.shadowRoot.querySelector('#name');
        this.content = this.shadowRoot.querySelector('#content').attachShadow({ mode: 'open' });

        this.minWidth = 0;
        this.maxWidth = 0;
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

        let data;

        if (this.getAttribute('point') === 'left') {
            this.classList.add('left');
            this.resizable.classList.add('resizable-left');
            this.unfold.classList.add('unfold-left');

            this.leftArrow.addEventListener('click', this.Fold);
            this.rightArrow.addEventListener('click', this.Change);

            data = (await (await fetch(`/setting?command=get&key=side-panel-state-left`)).text()).split(',');
        }
        else {
            this.classList.add('right');
            this.resizable.classList.add('resizable-right');
            this.unfold.classList.add('unfold-right');

            this.leftArrow.addEventListener('click', this.Change);
            this.rightArrow.addEventListener('click', this.Fold);

            data = (await (await fetch(`/setting?command=get&key=side-panel-state-right`)).text()).split(',');
        }

        this.key = data[0];
        this.size = data[1];
        this.style.setProperty('--size', `${this.size}px`);

        if (data[0] === '')
            this.Exit();

        if (data[2] === 'on')
            this.Unfold();
        else
            this.Fold();
    }

    Fold = (e) => {
        if (this.getAttribute('point') === 'left')
            this.style.transform = `translateX(-${this.style.getPropertyValue('--size')})`;
        else
            this.style.transform = `translateX(${this.style.getPropertyValue('--size')})`;

        this.unfold.style.display = 'flex';
        this.SaveState();
    }

    Unfold = (e) => {
        this.style.transform = `translateX(0px)`;
        this.unfold.style.display = 'none';
        this.SaveState();
    }

    Change = (e) => {
        let key = this.otherSidepanel.getToolKey();
        let name = this.otherSidepanel.getToolName();
        let content = this.otherSidepanel.getToolContent();
        let minWidth = this.otherSidepanel.getToolMinWidth();
        let maxWidth = this.otherSidepanel.getToolMaxWidth();
        let exit = this.otherSidepanel.getToolExit();

        if (this.key !== '')
            this.otherSidepanel.setToolContent(this.getToolKey(), this.getToolName(), this.getToolContent(), this.getToolMinWidth(), this.getToolMaxWidth(), this.getToolExit());
        else
            this.otherSidepanel.Exit(null);

        if (key !== '')
            this.setToolContent(key, name, content, minWidth, maxWidth, exit);
        else
            this.Exit(null);
    }

    Exit = (e) => {
        if (this.exit !== null) this.exit(this.content);

        this.style.display = 'none';
        this.size = 0;
        this.key = '';
        this.name.textContent = '';
        this.content.innerHTML = '';
        this.minWidth = 0;
        this.maxWidth = 0;

        this.SaveState();
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
                if (e.clientX < this.minWidth) return;
                if (e.clientX > this.maxWidth) return;

                this.size = e.clientX;
                this.style.setProperty('--size', `${e.clientX}px`);
            }
        }
        else {
            const buff = window.innerWidth - e.clientX;
            if (e.clientX > this.otherSidepanel.size && buff > 50) {
                if (buff < this.minWidth) return;
                if (buff > this.maxWidth) return;

                this.size = buff;
                this.style.setProperty('--size', `${buff}px`);
            }
        }

    }
    ResizableMouseUp = (e) => {
        if (e.button != 0) return;

        if (!this.isResizable) return;

        this.isResizable = false;
        this.SaveState();
    }

    setOtherSidepanel(Sidepanel) {
        this.otherSidepanel = Sidepanel;
    }

    setTool(key, name, content, minWidth, maxWidth, start, exit) {
        if (this.otherSidepanel.getToolKey() !== key) {
            this.setToolContent(key, name, content, minWidth, maxWidth, exit);

            if (start !== null) start(this.content);
        }
        else
            this.Change(null);
    }
    setToolContent(key, name, content, minWidth, maxWidth, exit) {
        if (this.size < minWidth) this.size = minWidth;
        if (this.size > maxWidth) this.size = maxWidth;

        this.style.display = 'flex';
        this.style.setProperty('--size', `${this.size}px`);

        this.key = key;
        this.name.textContent = name;
        this.content.innerHTML = content;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.exit = exit;

        this.Unfold(null);
        this.SaveState();
    }
    getToolKey() {
        return this.key;
    }
    getToolName() {
        return this.name.textContent;
    }
    getToolContent() {
        return this.content.innerHTML;
    }
    getToolMinWidth() {
        return this.minWidth;
    }
    getToolMaxWidth() {
        return this.maxWidth;
    }
    getToolExit() {
        return this.exit;
    }
    reload(dataBase) {
        if (this.key === '') return;

        if (dataBase.get('sidePanel-setTool').has(this.key)) {
            const data = dataBase.get('sidePanel-setTool').get(this.key);

            if (data == null) return;

            if (this.size < data.minWidth) this.size = data.minWidth;
            if (this.size > data.maxWidth) this.size = data.maxWidth;

            this.style.display = 'flex';
            this.style.setProperty('--size', `${this.size}px`);

            this.key = data.key;
            this.name.textContent = data.name;
            this.content.innerHTML = data.content;
            this.minWidth = data.minWidth;
            this.maxWidth = data.maxWidth;
            this.exit = data.exit;

            this.Unfold(null);
            this.SaveState();

            if (data.start !== null) data.start(this.content);

        } else {
            this.key = '';
            this.size = 0;
            this.Unfold(null);
            this.SaveState();
        }
    }

    SaveState() {
        fetch(`/setting?command=set&key=side-panel-state-${this.getAttribute('point') === 'left' ? 'left' : 'right'}&value=${this.key},${this.size},${this.unfold.style.display === 'none' ? 'on' : 'off'}`);
    }
}