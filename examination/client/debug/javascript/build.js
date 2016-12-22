(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

let config = require('./config.json');

function Chat(container) {
    this.socket = null;
    let template = document.querySelector('#chat');

    this.chatDiv = document.importNode(template.content.firstElementChild, true);

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
        username: 'ProfessorPotatis',
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

},{"./config.json":3}],2:[function(require,module,exports){
/**
 * Starting point of the application.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

/*let memory = require('./Memory.js');

memory.playMemory(2, 2, 'memoryContainer');*/

let Chat = require('./Chat.js');

let chat = new Chat(document.querySelector('#chatContainer'));

},{"./Chat.js":1}],3:[function(require,module,exports){
module.exports={
    "address": "ws://vhost3.lnu.se:20080/socket/",
    "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jb25maWcuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmxldCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5cbmZ1bmN0aW9uIENoYXQoY29udGFpbmVyKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Jyk7XG5cbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgdGhpcy5jaGF0RGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgLy8gTGlzdGVuIGZvciBFbnRlciBrZXlcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAvLyBTZW5kIGEgbWVzc2FnZSBhbmQgZW1wdHkgdGhlIHRleHRhcmVhXG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGl2KTtcbn1cblxuXG5DaGF0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRkcmVzcyk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIuJykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByaW50TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH0uYmluZCh0aGlzKSk7XG5cbn07XG5cblxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICB1c2VybmFtZTogJ1Byb2Zlc3NvclBvdGF0aXMnLFxuICAgICAgICAvL2NoYW5uZWw6ICdteSwgbm90IHNvIHNlY3JldCwgY2hhbm5lbCcsXG4gICAgICAgIGtleTogY29uZmlnLmtleVxuICAgIH07XG5cbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgIH0pO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5wcmludE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RlbXBsYXRlJylbMF07XG5cbiAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy50ZXh0JylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0aG9yJylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXNzYWdlcycpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBTdGFydGluZyBwb2ludCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbi8qbGV0IG1lbW9yeSA9IHJlcXVpcmUoJy4vTWVtb3J5LmpzJyk7XG5cbm1lbW9yeS5wbGF5TWVtb3J5KDIsIDIsICdtZW1vcnlDb250YWluZXInKTsqL1xuXG5sZXQgQ2hhdCA9IHJlcXVpcmUoJy4vQ2hhdC5qcycpO1xuXG5sZXQgY2hhdCA9IG5ldyBDaGF0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Q29udGFpbmVyJykpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG59XG4iXX0=
