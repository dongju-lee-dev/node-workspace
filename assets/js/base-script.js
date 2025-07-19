import { WorkSpace } from "./workspace.js";

export let workSpace;

document.addEventListener('DOMContentLoaded', () => {
    workSpace = new WorkSpace(document.getElementsByClassName('workspace')[0], document.getElementsByClassName('workspace-background')[0]);
})