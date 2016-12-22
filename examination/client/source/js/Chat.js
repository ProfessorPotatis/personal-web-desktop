
let config = require('./config.json');

function Chat(container) {
    this.socket = null;
    let template = document.querySelector('#chat');

    let chatDiv = document.importNode(template.content.firstElementChild, true);

    chatDiv.addEventListener('keypress', function(event) {
        // Listen for Enter key
        if (event.keyCode === 13) {
            // Send a message and empty the textarea
            this.sendMessage(event.target.value);
            event.target.value = '';
            event.preventDefault();

        }
    }.bind(this));

    container.appendChild(chatDiv);
}


Chat.prototype.connect = function() {
    return new Promise(function(resolve, reject) {
        this.socket = new WebSocket(config.address);

        this.socket.addEventListener('open', function() {
            resolve(this.socket);
        }.bind(this));
        
    }.bind(this));

};


Chat.prototype.sendMessage = function(text) {

    let data = {
        type: 'message',
        data: text,
        username: 'ProfessorPotatis',
        channel: 'my, not so secret, channel',
        key: config.key
    };

    this.socket.send(JSON.stringify(data));

    console.log(text);
};


Chat.prototype.printMessage = function() {

};

module.exports = Chat;
