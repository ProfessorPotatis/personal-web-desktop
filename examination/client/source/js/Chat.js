/**
 * Module for chat.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

let config = require('./config.json');
let aWindow = require('./Window.js');

/**
 * Constructor for new chat.
 */
function Chat(template) {
    this.socket = null;
    template = template || document.querySelector('#chat');

    this.chatDiv = document.importNode(template.content.firstElementChild, true);

    if (localStorage.getItem('username') === null) {
        this.setUsername(template, this.chatDiv).then(function() {
            this.chatDiv.firstElementChild.classList.remove('removed');
            this.chatDiv.firstElementChild.nextElementSibling.classList.remove('removed');
            this.listenForEnter(this.chatDiv);
        }.bind(this));
    } else {
        this.listenForEnter(this.chatDiv);
    }
}

/**
 * Saves username in localStorage.
 */
Chat.prototype.setUsername = function(template, chatDiv) {
    return new Promise(function(resolve, reject) {
        let form = document.importNode(template.content.lastElementChild, true);
        let user = form.firstElementChild;
        let button = form.lastElementChild;

        chatDiv.appendChild(user);
        chatDiv.appendChild(button);
        chatDiv.firstElementChild.classList.add('removed');
        chatDiv.firstElementChild.nextElementSibling.classList.add('removed');

        button.addEventListener('click', function() {
            let username = user.value;

            if (typeof(Storage) !== 'undefined') {
                if (username !== '') {
                    resolve(localStorage.setItem('username', username));

                    user.classList.add('removed');
                    button.classList.add('removed');
                } else {
                    reject(console.log('You have to choose a username.'));
                }
            } else {
                reject(console.log('Sorry, no support for Web Storage.'));
            }
        });
    });
};

/**
 * Waiting for enter-key to be pressed.
 */
Chat.prototype.listenForEnter = function(chatDiv) {
    chatDiv.addEventListener('keypress', function(event) {
        // Listen for Enter key
        if (event.keyCode === 13) {
            // Send a message and empty the textarea
            this.sendMessage(event.target.value);
            event.target.value = '';
            event.preventDefault();

        }
    }.bind(this));
};

/**
 * Connect to WebSocket server.
 */
Chat.prototype.connect = function() {
    return new Promise(function(resolve, reject) {

        if (this.socket && this.socket.readyState === 1) {
            resolve(this.socket);
            return;
        }

        this.socket = new WebSocket(config.address);

        this.socket.addEventListener('open', function() {
            console.log('You are connected.');
            resolve(this.socket);
        }.bind(this));

        this.socket.addEventListener('error', function() {
            reject(new Error('Could not connect to the server.'));
        }.bind(this));

        this.socket.addEventListener('message', function(event) {
            let message = JSON.parse(event.data);

            if (message.type === 'message') {
                this.printMessage(message);
            }

        }.bind(this));

    }.bind(this));

};

/**
 * Send message in JSON.
 */
Chat.prototype.sendMessage = function(text) {

    let data = {
        type: 'message',
        data: text,
        username: localStorage.getItem('username'),
        //channel: 'my, not so secret, channel',
        key: config.key
    };

    // FEATURE: Chat works as command line for Personal Web Desktop.
    this.connect().then(function(socket) {
        if (text === 'play memory') {
            let theWindow = new aWindow(400, 400, 'memory');
            theWindow.open();
        } else if (text === 'start a new chat') {
            let theWindow = new aWindow(400, 400, 'chat');
            theWindow.open();
        } else if (text === 'start video') {
            let theWindow = new aWindow(400, 400, 'video');
            theWindow.open();
        } else if (text === 'read about page') {
            let theWindow = new aWindow(400, 400, 'about');
            theWindow.open();
        } else {
            socket.send(JSON.stringify(data));
            console.log(text);
        }
    });
};

/**
 * Print out recieved messages.
 */
Chat.prototype.printMessage = function(message) {
    let template = this.chatDiv.querySelectorAll('template')[0];

    let messageDiv = document.importNode(template.content.firstElementChild, true);

    messageDiv.querySelectorAll('.text')[0].textContent = message.data;
    messageDiv.querySelectorAll('.author')[0].textContent = message.username;

    this.chatDiv.querySelectorAll('.messages')[0].appendChild(messageDiv);
};

/**
*  Exports.
*/
module.exports = Chat;
