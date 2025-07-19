export class WorkSpace {
    //작업 공간에 있어야 하는 오브젝트 데이터는 전역 변수로 설정한다.
    //작업 공간이 아닌 workspace 변수는 건설자 함수 내에 정의 하는 것으면 충분하다.

    workspace;
    workspaceBackground;
    positionX = 0;
    positionY = 0;
    scale = 1;

    constructor(workspace, workspaceBackground) {
        this.workspace = workspace;
        this.workspaceBackground = workspaceBackground;

        workspace.addEventListener('mousedown', this.MovementMouseDown);
        workspace.addEventListener('mousemove', this.MovementMouseMove);
        workspace.addEventListener('mouseup', this.MovementMouseUp);
        workspace.addEventListener('mouseleave', this.MovementMouseLeave);
        workspace.addEventListener('wheel', this.ZoomWheel);

        workspaceBackground.addEventListener('mousedown', this.MovementMouseDown);
        workspaceBackground.addEventListener('mousemove', this.MovementMouseMove);
        workspaceBackground.addEventListener('mouseup', this.MovementMouseUp);
        workspaceBackground.addEventListener('mouseleave', this.MovementMouseLeave);
        workspaceBackground.addEventListener('wheel', this.ZoomWheel);
    }

    updateTransform() {
        this.workspace.style.transform = `translate(${this.positionX}px, ${this.positionY}px) scale(${this.scale})`;
    }

    isMovement = false;
    startPointX = 0;
    startPointY = 0;

    MovementMouseDown = (e) => {
        if (e.button != 1) return;
        e.preventDefault();

        this.isMovement = true;
        this.startPointX = e.clientX - this.positionX;
        this.startPointY = e.clientY - this.positionY;
    }
    MovementMouseMove = (e) => {
        if (!this.isMovement) return;
        e.preventDefault();

        this.positionX = e.clientX - this.startPointX;
        this.positionY = e.clientY - this.startPointY;
        this.updateTransform();
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

        const zoomFactor = 1.1;
        const direction = e.deltaY < 0 ? 'in' : 'out';
        const newScale = direction === 'in' ? this.scale * zoomFactor : this.scale / zoomFactor;

        if (newScale < 0.1 || newScale > 4) return;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame(() => {
            const worldX = (e.clientX - this.positionX) / this.scale;
            const worldY = (e.clientY - this.positionY) / this.scale;

            this.scale = newScale;

            this.positionX = e.clientX - worldX * this.scale;
            this.positionY = e.clientY - worldY * this.scale;

            this.updateTransform();
            this.rafId = null;
        });
    }

    getWorkspace() {
        return this.workspace;
    }

    getWorkspaceBackground() {
        return this.workspaceBackground;
    }
}