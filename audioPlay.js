
class Mode extends EventTarget {
    constructor() {
        super();
        let modeList=[
            '播放器',
            '振荡器',
            '钢琴',
            '吉他',
            '贝斯',
        ];
        console.log(super.valueOf() instanceof Mode,modeList);
        let renderMode=()=>{
            this.container=document.createDocumentFragment();
            for (let index = 0; index < modeList.length; index++) {
                let elSpan=document.createElement('span');
                elSpan.className=`mode-item ${index===0?'active':''}`;
                elSpan.setAttribute('data-index',index);
                elSpan.innerText=modeList[index]
                elSpan.addEventListener('click',e=>this.handleClick(e))
                this.container.appendChild(elSpan)
                console.log('elSpan: ', elSpan);
            }
            
        }
        renderMode()
    }

    handleClick({target}){
        const {
            dataset: {
                index
            }
        } = target;
        console.log('index: ', index);
    }
}
// let mode=new Mode();
// setTimeout(()=>console.log('mode: ', mode),1000)




// http://95.179.250.197:8140/music/fgxs.mp3

class Audio {
    constructor(params) {
        this.mapKeyCode=[
            // 数字映射
            { name:'0',keyCode:48,level:1,index:2 },
            { name:'1',keyCode:49,level:0,index:0 },
            { name:'2',keyCode:50,level:0,index:1 },
            { name:'3',keyCode:51,level:0,index:2 },
            { name:'4',keyCode:52,level:0,index:3 },
            { name:'5',keyCode:53,level:0,index:4 },
            { name:'6',keyCode:54,level:0,index:5 },
            { name:'7',keyCode:55,level:0,index:6 },
            { name:'8',keyCode:56,level:1,index:0 },
            { name:'9',keyCode:57,level:1,index:1 },
            // 键盘第一行映射
            { name:'Q',keyCode:81,level:1,index:3 },
            { name:'W',keyCode:87,level:1,index:4 },
            { name:'E',keyCode:69,level:1,index:5 },
            { name:'R',keyCode:82,level:1,index:6 },
            { name:'T',keyCode:84,level:2,index:0 },
          
          
        ],
        // 创建音频上下文
        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();
        this.filterNode = this.audioCtx.createBiquadFilter();

        this.filterNode.type = "lowpass";
        // this.filterNode.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        this.filterNode.gain.setValueAtTime(25,this.audioCtx.currentTime);

        window.addEventListener("keydown", e=>this.handleKeyDown(e));
        window.addEventListener("keyup", e=>this.stopAudio());
        this.InputFile = document.querySelector('#file');
        this.InputFile&&this.InputFile.addEventListener("change", e=>this.readFile());

        this.renderMain();

        this.renderPiano(0)
        // this.renderPiano(1)
        // this.renderPiano(2)

        this.aimate()
        this.renderPiano=this.renderPiano.bind(this)
        this.handleStart=this.handleStart.bind(this)
        this.handleStop=this.handleStop.bind(this)
        this.playAudio=this.playAudio.bind(this)
        this.stopAudio=this.stopAudio.bind(this)
        this.renderMode=this.renderMode.bind(this)
    }

    readFile(){
        console.log('file',this.InputFile.files)
        let  elInputFil=this.InputFile
        if(elInputFil.files.length!==0){
            var fr = new FileReader();
            fr.onload = (e)=>{
                var fileResult = e.target.result;
                this.audioCtx.decodeAudioData(fileResult , (buffer)=>{
                    this.playMusic(buffer)
                    console.log('buffer',e,fileResult,buffer)
                }, function(e){
                    console.log(e)
                    alert("文件解码失败")
                })
            }
            fr.readAsArrayBuffer(elInputFil.files[0]);
        }
    }

    renderMain(){
        // 穿件虚拟根容器
        // const container = document.createDocumentFragment();//new DocumentFragment()
        const container = document.createElement("div");//new DocumentFragment()
        const tempalate=`
            <header> 
                <span class="title">Music laboratory</span>
            </header>
            <main>
                <section class="mode">
                    
                </section>
                <section class="animate"></section>
                <section class="control"></section>
            </main>
            <footer>this is footer</footer>
        `
        // <span class="mode-item">播放器</span>
        // <span class="mode-item">振荡器</span>
        // <span class="mode-item">钢琴</span>
        // <span class="mode-item">吉他</span>
        // 传入e和level，level指的是低中高音
        // const particalStart = e => this.handleStart(e, level);
        // container.addEventListener("mousedown", e => {
        //     particalStart(e);
        //     container.addEventListener("mouseout", this.handleStop);
        // });
        // container.addEventListener("mouseup", (e)=>this.handleStop(e));
        container.innerHTML += tempalate;
        console.log('render',container,tempalate)
        // document.body.appendChild(container);
        document.body.innerHTML += tempalate;
        this.renderMode()
    }

    renderPiano(level) {
        let container=document.createDocumentFragment();
        const wrap = document.querySelector("section.control");
        // 简谱映射
        const oScales={
            level1:{
                name:'level1',
                arr:[261.63, 293.67, 329.63, 349.23, 391.99, 440, 493.88]
            },
            level2:{
                name:'level2',
                arr:[523.25, 587.33, 659.26, 698.46, 783.99, 880, 987.77]
            },
            level3:{
                name:'level3',
                arr:[1046.5, 1174.66, 1318.51, 1396.92, 1567.98, 1760, 1975.52]
            }
        }
        const VOICE_MAP = {
            // 0: [4, 2300, 329.63, 349.23, 391.99, 440, 493.88],
            0: [261.63, 293.67, 329.63, 349.23, 391.99, 440, 493.88],
            1: [523.25, 587.33, 659.26, 698.46, 783.99, 880, 987.77],
            2: [1046.5, 1174.66, 1318.51, 1396.92, 1567.98, 1760, 1975.52]
        };
        const lsScales=Object.values(oScales)
        // console.log('lsScales: ', lsScales);
        lsScales.forEach((ele,index)=>{
            let el_section = document.createElement("section");
            el_section.className = `container${index}`;
            ele.arr.forEach((fre,i)=>{
                let res = "";
                res += `<span class="btn level${index}" data-index=${i}>${i +
                    1}</span>`; // 用data-属性辅助
                    // i++;
                    // 传入e和level，level指的是低中高音
                    const particalStart = e => this.handleStart(e, index);
                    el_section.addEventListener("mousedown", e => {
                        particalStart(e);
                        el_section.addEventListener("mouseout", this.handleStop);
                    });
                    el_section.addEventListener("mouseup", (e)=>this.handleStop(e));
                    el_section.innerHTML += res;
            })
            // let i = 0;
            // let res = "";
            /* while (i < 7) {
                res += `<span class="btn level${index}" data-index=${i}>${i +
                1}</span>`; // 用data-属性辅助
                i++;
                // 传入e和level，level指的是低中高音
                const particalStart = e => this.handleStart(e, index);
                container.addEventListener("mousedown", e => {
                    particalStart(e);
                    container.addEventListener("mouseout", this.handleStop);
                });
                container.addEventListener("mouseup", (e)=>this.handleStop(e));
                container.innerHTML += res;
            } */
            container.appendChild(el_section);
        })
        // console.log('render container',container)
        // document.body.appendChild(container);
        wrap.appendChild(container);
    }

    renderMode(){
        let modeList=[
            {
                name:'player',
                txt:'播放器',
            },
            {
                name:'oscillator',
                txt:'振荡器',
            },
            {
                name:'piano',
                txt:'钢琴',
            },
            {
                name:'guitar',
                txt:'吉他',
            },
            {
                name:'bass',
                txt:'贝斯',
            },
        ];
        this.container=document.createDocumentFragment();
        for (let index = 0; index < modeList.length; index++) {
            let elSpan=document.createElement('span');
            elSpan.className=`mode-item ${index===0?'active':''}`;
            elSpan.setAttribute('data-index',index);
            elSpan.setAttribute('name',modeList[index].name);
            elSpan.innerText=modeList[index].txt
            elSpan.addEventListener('click',e=>this.handleModeClick(e))
            this.container.appendChild(elSpan)
        }
        console.log('this.container: ', this.container);
        document.querySelector("section.mode").appendChild(this.container)
    }

    handleStart({target}, level) {15
        const {
            dataset: {
                index
            }
        } = target;
        if (index !== undefined) {
            console.log(index,this, "start");
            this.playAudio( index, level); // 后面加上playAudio的实现
        }
    }

    handleStop({ target }) {
        const {
            dataset: {
                index
            }
        } = target;
        if (index !== undefined) {
            console.log( "stop",this,index,);
        }
        this.stopAudio(); // 后面加上stopAudio的实现
    }

    handleKeyDown(e){
        let keyItem=this.mapKeyCode.find(ele=>ele.keyCode===e.keyCode);
        this.playAudio(keyItem.index,keyItem.level);
    }

    handleModeClick({target}){
        const {
            dataset: {
                index
            }
        } = target;
        const mlist=document.querySelector("section.mode").children
        console.log('index: ', index,mlist,Array.from(mlist));
        
        mlist.length&&Array.from(mlist).forEach(ele => {
            let elDataIndex=ele.dataset.index
            ele.removeAttribute('class')
            ele.setAttribute('class',`mode-item ${index===elDataIndex?'active':''}`)
        });
    }

    playAudio(index, level) {
        // 如果之前正在播，那就清掉之前的音频
        this.gainNode &&
            this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        // this.oscillator && this.oscillator.stop(this.audioCtx.currentTime + 1);
        // 创建音调控制对象
        this.oscillator = this.audioCtx.createOscillator();
        // 创建音量控制对象
        this.gainNode = this.audioCtx.createGain();
        
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.filterNode);
        this.filterNode.connect(this.analyser)
        // 音量和设备关联
        this.analyser.connect(this.audioCtx.destination);
        // 音调音量关联
        // this.oscillator.connect(this.gainNode);
        // 音量和设备关联
        // this.gainNode.connect(this.audioCtx.destination);
        // 音调类型指定为正弦波。sin好听一些
        // "sine", "square", "sawtooth", "triangle" and "custom". 默认值是"sine"
        this.oscillator.type = "sine";
        // 设置音调频率
        this.oscillator.frequency.value = VOICE_MAP[level][index]; // 读取相应的简谱频率
        // 先把当前音量设为0
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        // 0.01秒时间内音量从刚刚的0变成1，线性变化
        this.gainNode.gain.linearRampToValueAtTime(
            5,
            this.audioCtx.currentTime + 0.01
        );
        // 声音开始
        this.oscillator.start(this.audioCtx.currentTime);
    }

    stopAudio() {
        this.gainNode &&
            this.gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioCtx.currentTime + 0.8
            );
        // 0.8秒内停止声音
        this.oscillator && this.oscillator.stop(this.audioCtx.currentTime + 0.8);
        this.oscillator = this.gainNode = null;
    }

    aimate=()=> {
        // var analyser = this.audioCtx.createAnalyser();
        const elCVWrap = document.querySelector("section.animate");
        const container = document.createElement("canvas");
        container.id = `oscilloscope`;
        elCVWrap.appendChild(container);

        this.analyser.fftSize = 2048;
        var bufferLength = this.analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        // 获取ID为 "oscilloscope" 的画布
        var canvas = container;
        var canvasCtx = container.getContext("2d");

        // 绘制一个当前音频源的示波器

        let draw=()=> {

            let drawVisual = requestAnimationFrame(draw);

            this.analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 1;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            var sliceWidth = canvas.width * 1.0 / bufferLength;
            var x = 0;

            for (var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };
        // setTimeout(draw,5000)
        draw();
    }

    playMusic(arg) {
        var source;
        let bufferSource
        //如果arg是audio的dom对象，则转为相应的源
        if (arg.nodeType) {
            audioSource = audioSource || this.audioCtx.createMediaElementSource(arg);
            source = audioSource;
        } else {
            bufferSource = this.audioCtx.createBufferSource();
            // var reverbSource = this.audioCtx.createConvolver();
            bufferSource.buffer = arg;
            // reverbSource.buffer = arg;

            bufferSource.onended = function () {
                // app.trigger(singleLoop ? nowIndex : (nowIndex + 1));
            };

            //播放音频
            setTimeout(function () {
                bufferSource.start()
                // reverbSource.start()
            }, 0);

            source = bufferSource;
            // source = reverbSource;
        }
        // this.oscillator.connect(this.gainNode);
        // this.gainNode.connect(this.filterNode);
        // this.filterNode.connect(this.analyser)
        // 音量和设备关联
        // this.analyser.connect(this.audioCtx.destination);
        //连接analyserNode
        this.gainNode = this.audioCtx.createGain();
        this.reverb = this.audioCtx.createConvolver();
        source.connect(this.analyser);

        //再连接到gainNode
        this.analyser.connect(this.gainNode);

        //最终输出到音频播放器
        this.gainNode.connect(this.audioCtx.destination);
    }

}

const _audio=new Audio
console.log('_audio',_audio)
