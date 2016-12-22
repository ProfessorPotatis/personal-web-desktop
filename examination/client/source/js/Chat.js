function Chat(container) {
    let template = document.querySelector('#chat');

    let chatDiv = document.importNode(template.content.firstElementChild, true);

    container.appendChild(chatDiv);
}


Chat.prototype.connect = function() {

};


Chat.prototype.sendMessage = function() {

};


Chat.prototype.printMessage = function() {

};

module.exports = Chat;
