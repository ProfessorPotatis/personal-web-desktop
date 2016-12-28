(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

let config = require('./config.json');
let aWindow = require('./Window.js');

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
            let theWindow = new aWindow(400, 400, 'memory');
            theWindow.open();
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

},{"./Window.js":3,"./config.json":5}],2:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9XaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY29uZmlnLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5sZXQgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanNvbicpO1xubGV0IGFXaW5kb3cgPSByZXF1aXJlKCcuL1dpbmRvdy5qcycpO1xuXG5mdW5jdGlvbiBDaGF0KGNvbnRhaW5lcikge1xuICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2hhdCcpO1xuXG4gICAgdGhpcy5jaGF0RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldFVzZXJuYW1lKHRlbXBsYXRlLCBjb250YWluZXIpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbkZvckVudGVyKHRoaXMuY2hhdERpdiwgY29udGFpbmVyKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpc3RlbkZvckVudGVyKHRoaXMuY2hhdERpdiwgY29udGFpbmVyKTtcbiAgICB9XG59XG5cblxuQ2hhdC5wcm90b3R5cGUubGlzdGVuRm9yRW50ZXIgPSBmdW5jdGlvbihjaGF0RGl2LCBjb250YWluZXIpIHtcbiAgICBjaGF0RGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgLy8gTGlzdGVuIGZvciBFbnRlciBrZXlcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAvLyBTZW5kIGEgbWVzc2FnZSBhbmQgZW1wdHkgdGhlIHRleHRhcmVhXG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2hhdERpdik7XG59O1xuXG5cbkNoYXQucHJvdG90eXBlLnNldFVzZXJuYW1lID0gZnVuY3Rpb24odGVtcGxhdGUsIGNvbnRhaW5lcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbGV0IGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQubGFzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGxldCB1c2VyID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgbGV0IGJ1dHRvbiA9IGZvcm0ubGFzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICBjb25zb2xlLmxvZyhsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSk7XG5cbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgdXNlcm5hbWUgPSB1c2VyLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGlmICh1c2VybmFtZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcm5hbWUnLCB1c2VybmFtZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHVzZXIuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChjb25zb2xlLmxvZygnWW91IGhhdmUgdG8gY2hvb3NlIGEgdXNlcm5hbWUuJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKCdTb3JyeSwgbm8gc3VwcG9ydCBmb3IgV2ViIFN0b3JhZ2UuJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cblxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblxuICAgICAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkZHJlc3MpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgYXJlIGNvbm5lY3RlZC4nKTtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byB0aGUgc2VydmVyLicpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmludE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH0uYmluZCh0aGlzKSk7XG5cbn07XG5cblxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICB1c2VybmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJyksXG4gICAgICAgIC8vY2hhbm5lbDogJ215LCBub3Qgc28gc2VjcmV0LCBjaGFubmVsJyxcbiAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgfTtcblxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICAgIGlmICh0ZXh0ID09PSAncGxheSBtZW1vcnknKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdtZW1vcnknKTtcbiAgICAgICAgICAgIHRoZVdpbmRvdy5vcGVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICB9KTtcbn07XG5cblxuQ2hhdC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpWzBdO1xuXG4gICAgbGV0IG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKCcudGV4dCcpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhO1xuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbCgnLmF1dGhvcicpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTtcblxuICAgIHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKCcubWVzc2FnZXMnKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhdDtcbiIsImZ1bmN0aW9uIHBsYXlNZW1vcnkocm93cywgY29scywgY29udGFpbmVyKSB7XG5cbiAgICBsZXQgYTtcbiAgICBsZXQgdGlsZXMgPSBbXTtcbiAgICBsZXQgdHVybjE7XG4gICAgbGV0IHR1cm4yO1xuICAgIGxldCBsYXN0VGlsZTtcbiAgICBsZXQgcGFpcnMgPSAwO1xuICAgIGxldCB0cmllcyA9IDA7XG4gICAgbGV0IHNlY29uZHM7XG4gICAgbGV0IHRoZVRpbWVyID0gZmFsc2U7XG4gICAgbGV0IHRvdGFsVGltZSA9IDA7XG5cbiAgICB0aWxlcyA9IGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKTtcblxuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcikgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lbW9yeUNvbnRhaW5lcicpO1xuICAgIGxldCB0ZW1wbGF0ZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNtZW1vcnlDb250YWluZXIgdGVtcGxhdGUnKVswXS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYsIGZhbHNlKTtcbiAgICBsZXQgcmVzdWx0VGFnID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcsIHRydWUpO1xuICAgIGxldCB0aW1lclRhZyA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgaWYgKHRoZVRpbWVyID09PSBmYWxzZSkge1xuICAgICAgICBzZWNvbmRzID0gc2V0SW50ZXJ2YWwodGltZXIsIDEwMDApO1xuICAgIH1cblxuICAgIGRpdi5hcHBlbmRDaGlsZChyZXN1bHRUYWcpO1xuICAgIGRpdi5hcHBlbmRDaGlsZCh0aW1lclRhZyk7XG5cbiAgICB0aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGluZGV4KSB7XG4gICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZy5uZXh0RWxlbWVudFNpYmxpbmcsIHRydWUpO1xuICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLnNldEF0dHJpYnV0ZSgnZGF0YS1icmlja251bWJlcicsIGluZGV4KTtcblxuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICAgICAgaWYgKChpbmRleCsxKSAlIGNvbHMgPT09IDApIHtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGltZyA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gJ0lNRycgPyBldmVudC50YXJnZXQgOiBldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1icmlja251bWJlcicpKTtcbiAgICAgICAgdHVybkJyaWNrKHRpbGVzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgfSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuXG4gICAgZnVuY3Rpb24gdGltZXIoKSB7XG4gICAgICAgIHRoZVRpbWVyID0gdHJ1ZTtcbiAgICAgICAgdG90YWxUaW1lICs9IDE7XG4gICAgICAgIHRpbWVyVGFnLnRleHRDb250ZW50ID0gJ1RpbWVyOiAnICsgdG90YWxUaW1lO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gdHVybkJyaWNrKHRpbGUsIGluZGV4LCBpbWcpIHtcbiAgICAgICAgaWYgKHR1cm4yKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpbWcuc3JjID0gJ2ltYWdlLycgKyB0aWxlICsgJy5wbmcnO1xuXG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nO1xuICAgICAgICAgICAgbGFzdFRpbGUgPSB0aWxlO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW1nID09PSB0dXJuMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJpZXMgKz0gMTtcblxuICAgICAgICAgICAgdHVybjIgPSBpbWc7XG5cbiAgICAgICAgICAgIGlmICh0aWxlID09PSBsYXN0VGlsZSkge1xuICAgICAgICAgICAgICAgIHBhaXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpcnMgPT09IChjb2xzKnJvd3MpLzIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoZVRpbWVyID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHNlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlVGltZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aW1lclRhZy5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnV29uIG9uICcgKyB0cmllcyArICcgdHJpZXMgaW4gJyArIHRvdGFsVGltZSArICcgc2Vjb25kcy4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0VGFnLmFwcGVuZENoaWxkKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5zcmMgPSAnaW1hZ2UvMC5wbmcnO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5zcmMgPSAnaW1hZ2UvMC5wbmcnO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuXG5mdW5jdGlvbiBnZXRQaWN0dXJlQXJyYXkocm93cywgY29scykge1xuICAgIGxldCBpO1xuICAgIGxldCBhcnIgPSBbXTtcblxuICAgIGZvcihpID0gMTsgaSA8PSAocm93cypjb2xzKS8yOyBpICs9IDEpIHtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgIH1cblxuICAgIGZvcihsZXQgeCA9IGFyci5sZW5ndGggLSAxOyB4ID4gMDsgeCAtPSAxKSB7XG4gICAgICAgIGxldCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHggKyAxKSk7XG4gICAgICAgIGxldCB0ZW1wID0gYXJyW3hdO1xuICAgICAgICBhcnJbeF0gPSBhcnJbal07XG4gICAgICAgIGFycltqXSA9IHRlbXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwbGF5TWVtb3J5OiBwbGF5TWVtb3J5LFxuICAgIHNodWZmbGU6IGdldFBpY3R1cmVBcnJheVxufTtcbiIsIlxubGV0IGFXaW5kb3csIGlkID0gMCwgZHJhZ2dlZDtcblxuZnVuY3Rpb24gbmV3V2luZG93KHdpZHRoLCBoZWlnaHQsIGFwcE5hbWUpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5hcHBOYW1lID0gYXBwTmFtZTtcblxuICAgIGFXaW5kb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3aW5kb3cnKVswXTtcblxuICAgIGNvbnNvbGUubG9nKCdueXR0IGbDtm5zdGVyJyk7XG59XG5cbm5ld1dpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjbG9uZSA9IGFXaW5kb3cuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ21lbW9yeScpIHtcblxuICAgICAgICBsZXQgbWVtb3J5ID0gcmVxdWlyZSgnLi9NZW1vcnkuanMnKTtcbiAgICAgICAgbGV0IGdhbWUgPSBtZW1vcnkucGxheU1lbW9yeSg0LCA0KTtcbiAgICAgICAgY29uc29sZS5sb2coZ2FtZS5sYXN0RWxlbWVudENoaWxkKTtcblxuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChnYW1lLmxhc3RFbGVtZW50Q2hpbGQpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcE5hbWUgPT09ICdjaGF0Jykge1xuXG4gICAgICAgIGxldCBDaGF0ID0gcmVxdWlyZSgnLi9DaGF0LmpzJyk7XG4gICAgICAgIGxldCBjaGF0ID0gbmV3IENoYXQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NoYXRDb250YWluZXInKSk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoY2hhdC5jaGF0RGl2KTtcbiAgICB9XG5cbiAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIGlkICs9IDE7XG5cbiAgICB0aGlzLmRyYWcoY2xvbmUpO1xuXG4gICAgYVdpbmRvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbn07XG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgY2xvbmUuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgZXYuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBldi50YXJnZXQuaWQpO1xuICAgICAgICBldi5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcblxuICAgICAgICBkcmFnZ2VkID0gZXYudGFyZ2V0O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdkcmFyIGkgZsO2bnN0ZXIgJyArIGV2LnRhcmdldC5pZCk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ld1dpbmRvdztcbiIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgUHJvZmVzc29yUG90YXRpc1xuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG4gbGV0IG1lbnVJY29ucyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJyk7XG5cbiBtZW51SWNvbnNbMF0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnZHUga2xpY2thZGUgcMOlIG1lbW9yeWFwcGVuJyk7XG4gICAgbGV0IGFXaW5kb3cgPSByZXF1aXJlKCcuL1dpbmRvdy5qcycpO1xuICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgJ21lbW9yeScpO1xuICAgIHRoZVdpbmRvdy5vcGVuKCk7XG5cbiAgICAvL2xldCBtZW1vcnkgPSByZXF1aXJlKCcuL01lbW9yeS5qcycpO1xuXG4gICAgLy9tZW1vcnkucGxheU1lbW9yeSgyLCAyLCAnbWVtb3J5Q29udGFpbmVyJyk7XG4gfSk7XG5cbiBtZW51SWNvbnNbMV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnZHUga2xpY2thZGUgcMOlIGNoYXRhcHBlbicpO1xuICAgIGxldCBhV2luZG93ID0gcmVxdWlyZSgnLi9XaW5kb3cuanMnKTtcbiAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdjaGF0Jyk7XG4gICAgdGhlV2luZG93Lm9wZW4oKTtcblxuICAgIC8vbGV0IENoYXQgPSByZXF1aXJlKCcuL0NoYXQuanMnKTtcblxuICAgIC8vbGV0IGNoYXQgPSBuZXcgQ2hhdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2hhdENvbnRhaW5lcicpKTtcbiB9KTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxufVxuIl19
