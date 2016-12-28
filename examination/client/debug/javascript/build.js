(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

let config = require('./config.json');
let memory = require('./Memory.js');

function Chat(container) {
    this.socket = null;
    let template = document.querySelector('#chat');

    this.chatDiv = document.importNode(template.content.firstElementChild, true);

    if (localStorage.getItem('username') === null) {
        this.setUsername(template, container).then(function() {
            this.listenForEnter(this.chatDiv, container);
        }.bind(this));
    } else {
        this.listenForEnter(this.chatDiv, container);
    }
}


Chat.prototype.listenForEnter = function(chatDiv, container) {
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
};


Chat.prototype.setUsername = function(template, container) {
    return new Promise(function(resolve, reject) {
        let form = document.importNode(template.content.lastElementChild, true);
        let user = form.firstElementChild;
        let button = form.lastElementChild;

        container.appendChild(user);
        container.appendChild(button);
        console.log(localStorage.getItem('username'));

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


Chat.prototype.sendMessage = function(text) {

    let data = {
        type: 'message',
        data: text,
        username: localStorage.getItem('username'),
        //channel: 'my, not so secret, channel',
        key: config.key
    };

    this.connect().then(function(socket) {
        if (text === 'play memory') {
            memory.playMemory(2, 2, 'chatContainer');
        }
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

},{"./Memory.js":2,"./config.json":5}],2:[function(require,module,exports){
function playMemory(rows, cols, container) {

    let a;
    let tiles = [];
    let turn1;
    let turn2;
    let lastTile;
    let pairs = 0;
    let tries = 0;
    let seconds;
    let theTimer = false;
    let totalTime = 0;

    tiles = getPictureArray(rows, cols);

    container = document.getElementById(container) || document.getElementById('memoryContainer');
    let templateDiv = document.querySelectorAll('#memoryContainer template')[0].content.firstElementChild;

    let div = document.importNode(templateDiv, false);
    let resultTag = document.importNode(templateDiv.firstElementChild.nextElementSibling, true);
    let timerTag = document.importNode(templateDiv.firstElementChild, true);

    if (theTimer === false) {
        seconds = setInterval(timer, 1000);
    }

    div.appendChild(resultTag);
    div.appendChild(timerTag);

    tiles.forEach(function(tile, index) {
        a = document.importNode(templateDiv.firstElementChild.nextElementSibling.nextElementSibling, true);
        a.firstElementChild.setAttribute('data-bricknumber', index);

        div.appendChild(a);

        if ((index+1) % cols === 0) {
            div.appendChild(document.createElement('br'));
        }
    });

    div.addEventListener('click', function(event) {
        event.preventDefault();
        let img = event.target.nodeName === 'IMG' ? event.target : event.target.firstElementChild;

        let index = parseInt(img.getAttribute('data-bricknumber'));
        turnBrick(tiles[index], index, img);
    });

    container.appendChild(div);


    function timer() {
        theTimer = true;
        totalTime += 1;
        timerTag.textContent = 'Timer: ' + totalTime;
    }


    function turnBrick(tile, index, img) {
        if (turn2) {
            return;
        }

        img.src = 'image/' + tile + '.png';

        if (!turn1) {
            turn1 = img;
            lastTile = tile;
            return;

        } else {
            if (img === turn1) {
                return;
            }

            tries += 1;

            turn2 = img;

            if (tile === lastTile) {
                pairs += 1;

                if (pairs === (cols*rows)/2) {
                    if (theTimer === true) {
                        clearInterval(seconds);
                        theTimer = false;
                    }
                    timerTag.classList.add('removed');
                    let result = document.createTextNode('Won on ' + tries + ' tries in ' + totalTime + ' seconds.');
                    resultTag.appendChild(result);
                }

                window.setTimeout(function() {
                    turn1.parentNode.classList.add('removed');
                    turn2.parentNode.classList.add('removed');

                    turn1 = null;
                    turn2 = null;
                }, 300);

            } else {
                window.setTimeout(function() {
                    turn1.src = 'image/0.png';
                    turn2.src = 'image/0.png';

                    turn1 = null;
                    turn2 = null;
                }, 500);
            }
        }
    }
    return container;
}


function getPictureArray(rows, cols) {
    let i;
    let arr = [];

    for(i = 1; i <= (rows*cols)/2; i += 1) {
        arr.push(i);
        arr.push(i);
    }

    for(let x = arr.length - 1; x > 0; x -= 1) {
        let j = Math.floor(Math.random() * (x + 1));
        let temp = arr[x];
        arr[x] = arr[j];
        arr[j] = temp;
    }

    return arr;
}


module.exports = {
    playMemory: playMemory,
    shuffle: getPictureArray
};

},{}],3:[function(require,module,exports){

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

},{"./Chat.js":1,"./Memory.js":2}],4:[function(require,module,exports){
/**
 * Starting point of the application.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

 let menuIcons = document.getElementsByTagName('a');

 menuIcons[0].addEventListener('click', function() {
    console.log('du klickade på memoryappen');
    let aWindow = require('./Window.js');
    let theWindow = new aWindow(400, 400, 'memory');
    theWindow.open();

    //let memory = require('./Memory.js');

    //memory.playMemory(2, 2, 'memoryContainer');
 });

 menuIcons[1].addEventListener('click', function() {
    console.log('du klickade på chatappen');
    let aWindow = require('./Window.js');
    let theWindow = new aWindow(400, 400, 'chat');
    theWindow.open();

    //let Chat = require('./Chat.js');

    //let chat = new Chat(document.querySelector('#chatContainer'));
 });

},{"./Window.js":3}],5:[function(require,module,exports){
module.exports={
    "address": "ws://vhost3.lnu.se:20080/socket/",
    "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9XaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY29uZmlnLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmxldCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5sZXQgbWVtb3J5ID0gcmVxdWlyZSgnLi9NZW1vcnkuanMnKTtcblxuZnVuY3Rpb24gQ2hhdChjb250YWluZXIpIHtcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NoYXQnKTtcblxuICAgIHRoaXMuY2hhdERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRVc2VybmFtZSh0ZW1wbGF0ZSwgY29udGFpbmVyKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5Gb3JFbnRlcih0aGlzLmNoYXREaXYsIGNvbnRhaW5lcik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Gb3JFbnRlcih0aGlzLmNoYXREaXYsIGNvbnRhaW5lcik7XG4gICAgfVxufVxuXG5cbkNoYXQucHJvdG90eXBlLmxpc3RlbkZvckVudGVyID0gZnVuY3Rpb24oY2hhdERpdiwgY29udGFpbmVyKSB7XG4gICAgY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIExpc3RlbiBmb3IgRW50ZXIga2V5XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgYW5kIGVtcHR5IHRoZSB0ZXh0YXJlYVxuICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNoYXREaXYpO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5zZXRVc2VybmFtZSA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBjb250YWluZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGxldCBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBsZXQgdXNlciA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIGxldCBidXR0b24gPSBmb3JtLmxhc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHVzZXIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgY29uc29sZS5sb2cobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykpO1xuXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHVzZXJuYW1lID0gdXNlci52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZihTdG9yYWdlKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlcm5hbWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgdXNlcm5hbWUpKTtcblxuICAgICAgICAgICAgICAgICAgICB1c2VyLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coJ1lvdSBoYXZlIHRvIGNob29zZSBhIHVzZXJuYW1lLicpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChjb25zb2xlLmxvZygnU29ycnksIG5vIHN1cHBvcnQgZm9yIFdlYiBTdG9yYWdlLicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5cbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZGRyZXNzKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGFyZSBjb25uZWN0ZWQuJyk7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gdGhlIHNlcnZlci4nKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9LmJpbmQodGhpcykpO1xuXG59O1xuXG5cbkNoYXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24odGV4dCkge1xuXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICAgIHR5cGU6ICdtZXNzYWdlJyxcbiAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgdXNlcm5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpLFxuICAgICAgICAvL2NoYW5uZWw6ICdteSwgbm90IHNvIHNlY3JldCwgY2hhbm5lbCcsXG4gICAgICAgIGtleTogY29uZmlnLmtleVxuICAgIH07XG5cbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICBpZiAodGV4dCA9PT0gJ3BsYXkgbWVtb3J5Jykge1xuICAgICAgICAgICAgbWVtb3J5LnBsYXlNZW1vcnkoMiwgMiwgJ2NoYXRDb250YWluZXInKTtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgIH0pO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5wcmludE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RlbXBsYXRlJylbMF07XG5cbiAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy50ZXh0JylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0aG9yJylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXNzYWdlcycpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiZnVuY3Rpb24gcGxheU1lbW9yeShyb3dzLCBjb2xzLCBjb250YWluZXIpIHtcblxuICAgIGxldCBhO1xuICAgIGxldCB0aWxlcyA9IFtdO1xuICAgIGxldCB0dXJuMTtcbiAgICBsZXQgdHVybjI7XG4gICAgbGV0IGxhc3RUaWxlO1xuICAgIGxldCBwYWlycyA9IDA7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICBsZXQgc2Vjb25kcztcbiAgICBsZXQgdGhlVGltZXIgPSBmYWxzZTtcbiAgICBsZXQgdG90YWxUaW1lID0gMDtcblxuICAgIHRpbGVzID0gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKSB8fCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVtb3J5Q29udGFpbmVyJyk7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lbW9yeUNvbnRhaW5lciB0ZW1wbGF0ZScpWzBdLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdiwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgbGV0IHRpbWVyVGFnID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAodGhlVGltZXIgPT09IGZhbHNlKSB7XG4gICAgICAgIHNlY29uZHMgPSBzZXRJbnRlcnZhbCh0aW1lciwgMTAwMCk7XG4gICAgfVxuXG4gICAgZGl2LmFwcGVuZENoaWxkKHJlc3VsdFRhZyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHRpbWVyVGFnKTtcblxuICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJywgaW5kZXgpO1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICBpZiAoKGluZGV4KzEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSAnSU1HJyA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJykpO1xuICAgICAgICB0dXJuQnJpY2sodGlsZXNbaW5kZXhdLCBpbmRleCwgaW1nKTtcbiAgICB9KTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG5cbiAgICBmdW5jdGlvbiB0aW1lcigpIHtcbiAgICAgICAgdGhlVGltZXIgPSB0cnVlO1xuICAgICAgICB0b3RhbFRpbWUgKz0gMTtcbiAgICAgICAgdGltZXJUYWcudGV4dENvbnRlbnQgPSAnVGltZXI6ICcgKyB0b3RhbFRpbWU7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiB0dXJuQnJpY2sodGlsZSwgaW5kZXgsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGltZy5zcmMgPSAnaW1hZ2UvJyArIHRpbGUgKyAnLnBuZyc7XG5cbiAgICAgICAgaWYgKCF0dXJuMSkge1xuICAgICAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbWcgPT09IHR1cm4xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcblxuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMqcm93cykvMikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhlVGltZXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVUaW1lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyVGFnLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdXb24gb24gJyArIHRyaWVzICsgJyB0cmllcyBpbiAnICsgdG90YWxUaW1lICsgJyBzZWNvbmRzLicpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRUYWcuYXBwZW5kQ2hpbGQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9ICdpbWFnZS8wLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9ICdpbWFnZS8wLnBuZyc7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5cbmZ1bmN0aW9uIGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGFyciA9IFtdO1xuXG4gICAgZm9yKGkgPSAxOyBpIDw9IChyb3dzKmNvbHMpLzI7IGkgKz0gMSkge1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgfVxuXG4gICAgZm9yKGxldCB4ID0gYXJyLmxlbmd0aCAtIDE7IHggPiAwOyB4IC09IDEpIHtcbiAgICAgICAgbGV0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoeCArIDEpKTtcbiAgICAgICAgbGV0IHRlbXAgPSBhcnJbeF07XG4gICAgICAgIGFyclt4XSA9IGFycltqXTtcbiAgICAgICAgYXJyW2pdID0gdGVtcDtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsYXlNZW1vcnk6IHBsYXlNZW1vcnksXG4gICAgc2h1ZmZsZTogZ2V0UGljdHVyZUFycmF5XG59O1xuIiwiXG5sZXQgYVdpbmRvdztcblxuZnVuY3Rpb24gbmV3V2luZG93KHdpZHRoLCBoZWlnaHQsIGFwcE5hbWUpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5hcHBOYW1lID0gYXBwTmFtZTtcblxuICAgIGFXaW5kb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2luZG93Jyk7XG5cbiAgICBjb25zb2xlLmxvZygnbnl0dCBmw7Zuc3RlcicpO1xufVxuXG5uZXdXaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY2xvbmUgPSBhV2luZG93LmNsb25lTm9kZSh0cnVlKTtcblxuICAgIGlmICh0aGlzLmFwcE5hbWUgPT09ICdtZW1vcnknKSB7XG5cbiAgICAgICAgbGV0IG1lbW9yeSA9IHJlcXVpcmUoJy4vTWVtb3J5LmpzJyk7XG4gICAgICAgIGxldCBnYW1lID0gbWVtb3J5LnBsYXlNZW1vcnkoNCwgNCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGdhbWUubGFzdEVsZW1lbnRDaGlsZCk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoZ2FtZS5sYXN0RWxlbWVudENoaWxkKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAnY2hhdCcpIHtcblxuICAgICAgICBsZXQgQ2hhdCA9IHJlcXVpcmUoJy4vQ2hhdC5qcycpO1xuICAgICAgICBsZXQgY2hhdCA9IG5ldyBDaGF0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Q29udGFpbmVyJykpO1xuXG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGNoYXQuY2hhdERpdik7XG4gICAgfVxuXG4gICAgYVdpbmRvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3V2luZG93O1xuIiwiLyoqXG4gKiBTdGFydGluZyBwb2ludCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbiBsZXQgbWVudUljb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKTtcblxuIG1lbnVJY29uc1swXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdkdSBrbGlja2FkZSBww6UgbWVtb3J5YXBwZW4nKTtcbiAgICBsZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG4gICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCAnbWVtb3J5Jyk7XG4gICAgdGhlV2luZG93Lm9wZW4oKTtcblxuICAgIC8vbGV0IG1lbW9yeSA9IHJlcXVpcmUoJy4vTWVtb3J5LmpzJyk7XG5cbiAgICAvL21lbW9yeS5wbGF5TWVtb3J5KDIsIDIsICdtZW1vcnlDb250YWluZXInKTtcbiB9KTtcblxuIG1lbnVJY29uc1sxXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdkdSBrbGlja2FkZSBww6UgY2hhdGFwcGVuJyk7XG4gICAgbGV0IGFXaW5kb3cgPSByZXF1aXJlKCcuL1dpbmRvdy5qcycpO1xuICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgJ2NoYXQnKTtcbiAgICB0aGVXaW5kb3cub3BlbigpO1xuXG4gICAgLy9sZXQgQ2hhdCA9IHJlcXVpcmUoJy4vQ2hhdC5qcycpO1xuXG4gICAgLy9sZXQgY2hhdCA9IG5ldyBDaGF0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Q29udGFpbmVyJykpO1xuIH0pO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG59XG4iXX0=
