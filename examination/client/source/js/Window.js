
function newWindow(width, height, appName) {
    this.width = width;
    this.height = height;
    this.appName = appName;

    console.log('nytt fönster');
}

newWindow.prototype.open = function() {
    let wConfig = 'height=' + this.height + ', width=' + this.width;
    let openWindow = window.open('', '', wConfig);

    if (this.appName === 'memory') {

        let memory = require('./Memory.js');
        console.log(memory.playMemory);
        console.log(typeof memory);
        openWindow.document.body.appendChild(memory.playMemory(2, 2));

    } else if (this.appName === 'chat') {

        let Chat = require('./Chat.js');
        let chat = new Chat(document.querySelector('#chatContainer'));
        console.log(chat.chatDiv);
        console.log(typeof chat.chatDiv);

        openWindow.document.body.appendChild(chat.chatDiv);
    }

};

module.exports = newWindow;
