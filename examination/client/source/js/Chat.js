function Chat(container) {
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

};


Chat.prototype.sendMessage = function(text) {
    console.log(text);
};


Chat.prototype.printMessage = function() {

};

module.exports = Chat;
