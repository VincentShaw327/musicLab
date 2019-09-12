

class RenderBTN{
    constructor(params) {
        
    }


}






function renderBtns(level) {
    let i = 0;
    let res = "";
    while (i < 7) {
        res += `<span class="btn level${level}" data-index=${i}>${i +
        1}</span>`;
        i++;
    }
    const container = document.createElement("section");
    container.className = `container${level}`;
    // 传入e和level，level指的是低中高音
    const particalStart = e => handleStart(e, level);
    container.addEventListener("mousedown", e => {
        particalStart(e);
        container.addEventListener("mouseout", handleStop);
    });
    container.addEventListener("mouseup", handleStop);
    container.innerHTML += res;
    console.log('render',container,document)
    document.body.appendChild(container);
}
// 渲染节点
renderBtns(0);
renderBtns(1);
renderBtns(2);