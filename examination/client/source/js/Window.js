
let aWindow;

function newWindow(width, height, appName) {
    this.width = width;
    this.height = height;
    this.appName = appName;

    aWindow = document.getElementById('window');

    console.log('nytt fönster');
}

newWindow.prototype.open = function() {
    let clone = aWindow.cloneNode(true);

    if (this.appName === 'memory') {

        let memory = require('./Memory.js');
        let game = memory.playMemory(4, 4);
        console.log(game.lastElementChild);

        clone.appendChild(game.lastElementChild);

    } else if (this.appName === 'chat') {

        let Chat = require('./Chat.js');
        let chat = new Chat(document.querySelector('#chatContainer'));

        clone.appendChild(chat.chatDiv);
    }

    aWindow.parentNode.appendChild(clone);
};

module.exports = newWindow;
