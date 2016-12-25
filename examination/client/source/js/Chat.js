
let config = require('./config.json');

function Chat(container) {
    this.socket = null;
    let template = document.querySelector('#chat');

    this.chatDiv = document.importNode(template.content.firstElementChild, true);

    let user = this.chatDiv.lastElementChild.firstElementChild;
    let button = this.chatDiv.lastElementChild.lastElementChild;

    container.appendChild(user);
    container.appendChild(button);

    button.addEventListener('click', function() {
        let username = user.value;

        if (typeof(Storage) !== 'undefined') {
            if (username !== '') {
                localStorage.setItem('username', username);

                user.classList.add('removed');
                button.classList.add('removed');

                this.chatDiv.addEventListener('keypress', function(event) {
                    // Listen for Enter key
                    if (event.keyCode === 13) {
                        // Send a message and empty the textarea
                        this.sendMessage(event.target.value);
                        event.target.value = '';
                        event.preventDefault();

                    }
                }.bind(this));

                container.appendChild(this.chatDiv);
            } else {
                console.log('You have to choose a username.');
            }
        } else {
            console.log('Sorry, no support for Web Storage.');
        }
    }.bind(this));
}


Chat.prototype.connect = function() {
    return new Promise(function(resolve, reject) {

        if (this.socket && this.socket.readyState === 1) {
            resolve(this.socket);
            return;
        }

        this.socket = new WebSocket(config.address);

        this.socket.addEventListener('open', function() {
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


Chat.prototype.sendMessage = function(text) {

    let data = {
        type: 'message',
        data: text,
        username: localStorage.getItem('username'),
        //channel: 'my, not so secret, channel',
        key: config.key
    };

    this.connect().then(function(socket) {
        socket.send(JSON.stringify(data));
        console.log(text);
    });
};


Chat.prototype.printMessage = function(message) {
    let template = this.chatDiv.querySelectorAll('template')[0];

    let messageDiv = document.importNode(template.content.firstElementChild, true);

    messageDiv.querySelectorAll('.text')[0].textContent = message.data;
    messageDiv.querySelectorAll('.author')[0].textContent = message.username;

    this.chatDiv.querySelectorAll('.messages')[0].appendChild(messageDiv);
};

module.exports = Chat;
