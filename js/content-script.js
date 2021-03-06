const chromeContent = {
    init() {
        this.eventInit();
    },

    eventInit() {
        this.domLoadedEvent();
        this.getMsgFromBgEvent();
        this.getMsgFromPageEvent();
    },

    domLoadedEvent() {
        const self = this;
        document.addEventListener('DOMContentLoaded', () => {
            self.injectCustomJs.bind(self)();
        })
    },

    injectCustomJs(jsPath) {

        jsPath = jsPath || 'js/inject.js';
        let temp = document.createElement('script');
        temp.setAttribute('type', 'text/javascript');
        // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
        temp.src = chrome.extension.getURL(jsPath);
        temp.onload = () => {
            // 放在页面不好看，执行完后移除掉
            this.parentNode && this.parentNode.removeChild(this);
        };
        document.body.appendChild(temp);

    },

    getMsgFromBgEvent() {
        chrome.runtime.onMessage.addListener((request, sender, callback) => {
            console.log('Response from Bg.js: ', request, callback);
        })
    },

    getMsgFromPageEvent() {
        const self = this;
        window.addEventListener('message', e => {
            if (e.data && e.data.cmd === 'screenshot') {
                console.log('From Inject.js: ', e.data);
                self.sendMsgToBg.bind(self)(e.data.value)
            }
        }, false)
    },

    sendMsgToBg(msg) {
        msg.clientWidth = document.documentElement.clientWidth;
        msg.clientHeight = document.documentElement.clientHeight;
        msg.dpr = window.devicePixelRatio;
        chrome.runtime.sendMessage(msg, cb => {
            console.log('Content2Bg callback: ', cb);
            this.sendMsgToInject(msg, cb);
        });
    },

    sendMsgToInject(msg, cb) {
        msg.cmd = 'cb';
        msg.url = cb;
        window.postMessage(msg, '*')
    }
};

chromeContent.init();
