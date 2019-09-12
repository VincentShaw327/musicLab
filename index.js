    // 创建音频上下文
    const audioCtx = new AudioContext();
    // 创建音调控制对象
    const oscillator = audioCtx.createOscillator();
    // 创建音量控制对象
    const gainNode = audioCtx.createGain();
    // 音调音量关联
    oscillator.connect(gainNode);
    // 音量和设备关联
    gainNode.connect(audioCtx.destination);
    // 音调类型指定为正弦波。sin好听一些
    oscillator.type = "sine";
    // 设置音调频率（作曲的关键）
    // oscillator.frequency.value = 400;
    // 先把当前音量设为0
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    // 0.01秒时间内音量从0到1线性变化，突然变化的话很生硬
    gainNode.gain.linearRampToValueAtTime(
        1,
        audioCtx.currentTime + 0.01
    );
    // 声音开始
    oscillator.start(audioCtx.currentTime);

    // 暂停
    oscillator.stop(audioCtx.currentTime + 1);


    // 简谱映射
    const VOICE_MAP = {
        0: [261.63, 293.67, 329.63, 349.23, 391.99, 440, 493.88],
        1: [523.25, 587.33, 659.26, 698.46, 783.99, 880, 987.77],
        2: [1046.5, 1174.66, 1318.51, 1396.92, 1567.98, 1760, 1975.52]
    };

/*     function renderBtns(level) {
        let i = 0;
        let res = "";
        while (i < 7) {
            res += `<span class="btn level${level}" data-index=${i}>${i +
            1}</span>`; // 用data-属性辅助
            i++;
        }
        const container = document.createElement("section");
        container.className = `container${level}`;
        // ------------------------
        // 等下这里会加一些事件绑定
        // ------------------------
        container.innerHTML += res;
        console.log('render',container,document.body)
        document.body.appendChild(container);
    } */

    /* // 渲染节点
    renderBtns(0);
    renderBtns(1);
    renderBtns(2); */

    // 音频开始
    function handleStart({
        target
    }, level) {
        const {
            dataset: {
                index
            }
        } = target;
        if (index !== undefined) {
            console.log(index, "start");
            playAudio.call(target, index, level); // 后面加上playAudio的实现
        }
    }

    // 停止音频
    function handleStop({
        target
    }) {
        const {
            dataset: {
                index
            }
        } = target;
        if (index !== undefined) {
            console.log(index, "stop");
            stopAudio.call(target); // 后面加上stopAudio的实现
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

    // 音频上下文
    // const audioCtx = new AudioContext();

    function playAudio(index, level) {
        // 如果之前正在播，那就清掉之前的音频
        this.gainNode &&
            this.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        this.oscillator && this.oscillator.stop(audioCtx.currentTime + 1);
        // 创建音调控制对象
        this.oscillator = audioCtx.createOscillator();
        // 创建音量控制对象
        this.gainNode = audioCtx.createGain();
        // 音调音量关联
        this.oscillator.connect(this.gainNode);
        // 音量和设备关联
        this.gainNode.connect(audioCtx.destination);
        // 音调类型指定为正弦波。sin好听一些
        this.oscillator.type = "sine";
        // 设置音调频率
        this.oscillator.frequency.value = VOICE_MAP[level][index]; // 读取相应的简谱频率
        // 先把当前音量设为0
        this.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        // 0.01秒时间内音量从刚刚的0变成1，线性变化
        this.gainNode.gain.linearRampToValueAtTime(
            1,
            audioCtx.currentTime + 0.01
        );
        // 声音开始
        this.oscillator.start(audioCtx.currentTime);
    }

    function stopAudio() {
        this.gainNode &&
            this.gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                audioCtx.currentTime + 0.8
            );
        // 0.8秒内停止声音
        this.oscillator && this.oscillator.stop(audioCtx.currentTime + 0.8);
        this.oscillator = this.gainNode = null;
    }


    // 先来一个sleep，肯定需要使用延迟的
    function sleep(delay = 80) {
        return new Promise(r =>
            setTimeout(() => {
                r();
            }, delay)
        );
    }
    /**
     * @params arr 歌谱数组
     * @example
     * { level: 0, index: 0 } 低音的哆
     * { stop: true } 下一个循环什么都没有
     * { delay: true } 下一个循环什么都不做
     */
    async function diyPlay(arr) {
        let cursor = 0;
        const a = [...arr];
        const containers = document.querySelectorAll("section");
        let ele;
        // 一个个遍历歌曲数组
        while (arr.length) {
            // 先延迟一下，就可以避免上一个音戛然而止了
            await sleep(300);
            const current = a.shift();
            // 留一个delay接口，即是延长一下上一个音
            if (current && current.delay) {
                continue;
            }
            // 下一个按键，停下之前的音
            if (ele) {
                // 手动用js触发原生事件停止音频
                const evPre = document.createEvent("MouseEvents");
                evPre.initMouseEvent("mouseout", true, true, window);
                ele.dispatchEvent(evPre);
            }
            if (!arr.length || !current) {
                return;
            }
            // 
            if (current.stop) {
                continue;
            }
            await sleep(50); // 加一点延迟使得多个连续相同的音自然一些
            const ev = document.createEvent("MouseEvents");
            ele = containers[current.level].children[current.index - 1];
            // 手动用js触发原生事件开始音频
            if (ele) {
                ev.initMouseEvent("mousedown", true, true, window);
                ele.dispatchEvent(ev);
            }
        }
    }


// 抄得匆匆忙忙，后面有一些不准确的
diyPlay([
    { level: 1, index: 3 }, // 我听见雨落在青青草地
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { level: 1, index: 5 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 7 }, 
    { level: 1, index: 6 },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { delay: true },
    { stop: true },
    { level: 1, index: 6 }, // 我听见远方下课钟声响起
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { level: 1, index: 7 },
    { level: 2, index: 3 },
    { level: 2, index: 3 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 5 }, 
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { delay: true },

    { level: 1, index: 3 },// 可是我没有听见你的声音
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { level: 1, index: 5 },
    { level: 2, index: 1 },
    { delay: true },

    { level: 1, index: 7 }, 
    { delay: true },
    { level: 1, index: 7 },
    { level: 1, index: 6 },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { delay: true },

    { level: 1, index: 6 }, // 认真呼唤我姓名
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { delay: true },
    { stop: true },
    { stop: true },
    { level: 1, index: 3 },// 爱上你的时候不懂感情
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { level: 1, index: 5 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 7 },
    { level: 1, index: 6 },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { delay: true },
    { stop: true },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { level: 1, index: 7 },
    { level: 2, index: 3 },
    { level: 2, index: 3 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 5 },
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { delay: true },
    { stop: true },
    { level: 1, index: 3 },
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { level: 1, index: 5 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 7 },
    { level: 1, index: 6 },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { delay: true },
    { stop: true },
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { level: 2, index: 3 },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { delay: true },
    { delay: true },
    { stop: true },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { delay: true },
    { level: 1, index: 7 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { delay: true },
    { level: 2, index: 2 },
    { stop: true },
    { stop: true },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 6 },
    { stop: true },
    { stop: true },
    { level: 1, index: 5 },
    { level: 1, index: 5 },
    { delay: true },
    { level: 1, index: 3 },
    { level: 1, index: 5 },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { delay: true },
    { delay: true },
    { stop: true },
    { stop: true },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 1, index: 5 },
    { level: 1, index: 5 },
    { level: 1, index: 1 },
    { level: 1, index: 3 },
    { level: 1, index: 2 },
    { level: 1, index: 6 },
    { delay: true },
    { stop: true },
    { stop: true },
    { level: 1, index: 6 },
    { delay: true },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { level: 1, index: 6 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 1, index: 6 },
    { level: 2, index: 1 },
    { level: 1, index: 6 },
    { delay: true },
    { stop: true },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 2, index: 2 },

    { delay: true },
    { delay: true },
    { stop: true },
    { level: 1, index: 5 },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { level: 2, index: 2 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 1, index: 5 },
    { level: 2, index: 2 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 1, index: 5 },
    { level: 2, index: 2 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 2, index: 2 },
    { level: 2, index: 3 },
    { level: 2, index: 4 },
    // { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 1, index: 7 },
    // { stop: true },
    { level: 2, index: 1 },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 2, index: 1 },
    { delay: true },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { level: 1, index: 7 },
    { level: 1, index: 7 },
    { level: 2, index: 3 },
    { level: 2, index: 5 }, 
    { level: 2, index: 3 },
    { level: 2, index: 1 },
    { level: 1, index: 7 }, 
    { level: 1, index: 6 }, 
    { level: 2, index: 4 },
    { level: 2, index: 4 },
    { delay: true },
    { level: 2, index: 5 },
    { level: 2, index: 4 },
    { level: 2, index: 3 },
    { level: 1, index: 5 },
    { level: 2, index: 3 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 4 },
    { level: 2, index: 3 },
    { level: 2, index: 1 },
    { level: 1, index: 4 },
    { delay: true },
    { level: 2, index: 2 },
    { level: 2, index: 2 },
    { delay: true },
    { level: 2, index: 2 },
    { delay: true },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 2 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 1, index: 5 },
    { level: 2, index: 2 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 1, index: 5 },
    { level: 2, index: 2 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 4 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 2, index: 1 },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 2, index: 1 },
    { delay: true },
    { level: 1, index: 3 },
    { level: 1, index: 6 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 7 },
    { level: 1, index: 7 },
    { level: 2, index: 3 },
    { level: 2, index: 5 },
    { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 1 },
    { level: 1, index: 7 },
    { delay: true },
    { level: 1, index: 6 },
    { level: 2, index: 4 },
    { level: 2, index: 4 },
    { delay: true },
    { stop: true },
    { level: 2, index: 5 },
    { level: 2, index: 4 },
    { level: 2, index: 3 },
    { level: 2, index: 5 },
    { level: 2, index: 3 },
    { delay: true },
    { level: 2, index: 3 },
    { delay: true },
    { stop: true },
    { level: 2, index: 4 },
    { level: 2, index: 3 },
    { level: 2, index: 1 },
    { level: 2, index: 4 },
    { level: 2, index: 2 },
    { level: 2, index: 2 },
    { delay: true },
    { delay: true },
    { level: 2, index: 3 },
    { level: 2, index: 1 },
    { level: 2, index: 1 },
    { level: 2, index: 3 },
    { level: 2, index: 2 },
    { delay: true },
    { level: 2, index: 1 },
    { delay: true },
  ]);
