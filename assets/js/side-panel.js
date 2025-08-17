export class Sidepanel extends HTMLElement {
    static html;

    size;
    otherSidepanel;

    key = '';
    name;
    content;
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

        this.name = this.shadowRoot.querySelector('#name');
        this.content = this.shadowRoot.querySelector('#content');

        this.leftArrow = this.shadowRoot.querySelector('#left-arrow');
        this.rightArrow = this.shadowRoot.querySelector('#right-arrow');
        this.exit = this.shadowRoot.querySelector('#exit');
        this.resizable = this.shadowRoot.querySelector('#resizable');
        this.unfold = this.shadowRoot.querySelector('#unfold');

        this.exit.addEventListener('click', this.Exit);
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

            data = (await (await fetch('/setting?command=get&key=left-side-panel-state')).text()).split('.');
        }
        else {
            this.classList.add('right');
            this.resizable.classList.add('resizable-right');
            this.unfold.classList.add('unfold-right');

            this.leftArrow.addEventListener('click', this.Change);
            this.rightArrow.addEventListener('click', this.Fold);

            data = (await (await fetch('/setting?command=get&key=right-side-panel-state')).text()).split('.');
        }

        //size.activate.toolKey

        this.size = data[0];
        this.style.setProperty('--size', `${data[0]}px`);

        if (data[1] === '') this.Fold(null);

        if (data[2] === '')
            this.style.display = 'none';
        else
            this.key = data[2];
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
        let key = this.otherSidepanel.getToolKey();
        let name = this.otherSidepanel.getToolName();
        let content = this.otherSidepanel.getToolContent();
        let exit = this.otherSidepanel.getToolExit();

        this.otherSidepanel.setTool(this.getToolKey(), this.getToolName(), this.getToolContent(), this.getToolExit());

        this.setTool(key, name, content, exit);
    }

    Exit = (e) => {
        this.style.display = 'none';
        this.exit();
    }

    isResizable = false;
    ResizableMouseDown = (e) => {
        if (e.button != 0) return;

        this.isResizable = true;
    }
    ResizableMouseMove = (e) => {
        if (!this.isResizable) return;

        console.log(e.clientX);
        console.log(window.innerWidth - this.otherSidepanel.size);

        if (this.getAttribute('point') === 'left') {
            if (e.clientX < window.innerWidth - this.otherSidepanel.size && e.clientX > 50) {
                this.size = e.clientX;
                this.style.setProperty('--size', `${e.clientX}px`);
            }
        }
        else {
            const buff = window.innerWidth - e.clientX;
            if (e.clientX > this.otherSidepanel.size && buff > 50) {
                this.size = buff;
                this.style.setProperty('--size', `${buff}px`);
            }
        }

    }
    ResizableMouseUp = (e) => {
        if (e.button != 0) return;

        if (!this.isResizable) return;

        this.isResizable = false;
        this.SaveSidePanelState();
    }

    setOtherSidepanel(Sidepanel) {
        this.otherSidepanel = Sidepanel;
    }

    setTool(key, name, content, exit) {
        this.style.display = 'flex';
        this.key = key;
        this.name.textContent = name;
        this.content.innerHTML = content;
        this.exit = exit;

        this.SaveSidePanelState();
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
    getToolExit() {
        return this.exit;
    }
    reloadTool(dataBase) {
        if (this.key === '') return;

        const data = dataBase.get('sidepanel-setTool').get(this.key)();

        this.setTool(data.key, data.name, data.content, data.exit);
    }

    SaveSidePanelState() {
        fetch(`/setting?command=set&key=${this.getAttribute('point')}-side-panel-state&data=${this.size}.${this.unfold.style.display === 'flex' ? '' : 'o'}.${this.key}`);
    }
}