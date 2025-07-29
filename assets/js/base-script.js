import { WorkSpace } from "./workspace.js";

export let workSpace;

document.addEventListener('DOMContentLoaded', () => {
    // 준비
    workSpace = new WorkSpace(
        document.getElementsByClassName('workspace')[0],
        document.getElementsByClassName('workspace-background')[0],
        document.getElementsByClassName('workspace-command')[0]
    );

    // node 로드
    // tool 로드

    // workspace 요청
    // 있으면 workspace 데이터 로드
    // 없으면 빈 workspace 사용
})