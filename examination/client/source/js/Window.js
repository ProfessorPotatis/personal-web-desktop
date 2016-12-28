
let aWindow, id = 0, dragged;

function newWindow(width, height, appName) {
    this.width = width;
    this.height = height;
    this.appName = appName;

    aWindow = document.getElementsByClassName('window')[0];

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

    clone.setAttribute('id', id);
    id += 1;

    this.drag(clone);

    aWindow.parentNode.appendChild(clone);
};

newWindow.prototype.drag = function(clone) {
    clone.addEventListener('dragstart', function(ev) {
        ev.dataTransfer.setData('text/plain', ev.target.id);
        ev.dataTransfer.dropEffect = 'move';

        dragged = ev.target;

        console.log('drar i fönster ' + ev.target.id);
    });
};

module.exports = newWindow;
