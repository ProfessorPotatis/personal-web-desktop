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

let aWindow, id = 0;

function newWindow(width, height, appName) {
    this.width = width;
    this.height = height;
    this.appName = appName;
    this.windowPosTop = 0;
    this.windowPosLeft = 0;

    aWindow = document.getElementsByClassName('window')[0];

}

newWindow.prototype.open = function() {
    let clone = aWindow.cloneNode(true);

    if (this.appName === 'memory') {

        let memory = require('./Memory.js');
        let game = memory.playMemory(4, 4);
        let logo = document.createElement('img');

        logo.setAttribute('src', 'image/memory.png');

        clone.appendChild(logo);
        clone.appendChild(game.lastElementChild);

    } else if (this.appName === 'chat') {

        let Chat = require('./Chat.js');
        let chat = new Chat(document.querySelector('#chatContainer'));
        let logo = document.createElement('img');

        logo.setAttribute('src', 'image/chat.png');

        clone.appendChild(logo);
        clone.appendChild(chat.chatDiv);
    }

    clone.setAttribute('id', id);
    id += 1;

    this.position(clone);

    aWindow.parentNode.appendChild(clone);
};


newWindow.prototype.close = function(theWindow) {
    aWindow.parentNode.removeChild(theWindow);
};


newWindow.prototype.position = function(clone) {

    clone.style.left = this.windowPosLeft + parseInt(clone.id + 5) + 'px';
    clone.style.top = this.windowPosTop + parseInt(clone.id + 5) + 'px';

    clone.addEventListener('mousedown', function(event) {
        this.drag(clone, event);
    }.bind(this));
};


newWindow.prototype.drag = function(element, event) {
    let startX = event.clientX, startY = event.clientY;
    let origX = element.offsetLeft, origY = element.offsetTop;
    let deltaX = startX - origX, deltaY = startY - origY;

    if (document.addEventListener) {
        document.addEventListener('mousemove', move, true);
        document.addEventListener('mouseup', release, true);
    }

    if (event.stopPropagation) {
        event.stopPropagation();
    }

    if (event.preventDefault) {
        event.preventDefault();
    }


    function move(e) {
        if (!e) {
            e = window.event;
        }

        if (element.className === 'window') {
            element.className += ' active';
        }

        element.style.left = (e.clientX - deltaX) + 'px';
        element.style.top = (e.clientY - deltaY) + 'px';
    }

    function release(e) {
        if (!e) {
            e = window.event;
        }

        if (element.className === 'window active') {
            element.className = 'window';
        }

        if (document.removeEventListener) {
            document.removeEventListener('mouseup', release, true);
            document.removeEventListener('mousemove', move, true);
        }

        if (e.stopPropagation) {
            e.stopPropagation();
        }
    }
};

module.exports = newWindow;

},{"./Chat.js":1,"./Memory.js":2}],4:[function(require,module,exports){
/**
 * Starting point of the application.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

let router = require('./router.js');
router();

},{"./router.js":6}],5:[function(require,module,exports){
module.exports={
    "address": "ws://vhost3.lnu.se:20080/socket/",
    "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],6:[function(require,module,exports){

function router() {
    let menu = document.getElementById('menu');
    let clickCount = 0;
    let clickTimer;

    menu.addEventListener('click', function(event) {
        clickCount += 1;

        let app = event.target.parentNode.id;

        switch (app) {
            case 'memoryApp':
                if (clickCount === 1) {
                    clickTimer = setTimeout(function() {
                       clickCount = 0;
                       startApp('memory');
                    }, 200);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    removeApp('memory');
                }
                break;
            case 'chatApp':
                if (clickCount === 1) {
                    clickTimer = setTimeout(function() {
                       clickCount = 0;
                       startApp('chat');
                    }, 200);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    removeApp('chat');
                }
                break;
            default:

        }
    });

    function startApp(app) {
        let aWindow = require('./Window.js');
        let theWindow = new aWindow(400, 400, app);
        theWindow.open();
    }

    function removeApp(app) {
        let windows = document.getElementsByClassName('window');

        for (let i = 1; i < windows.length; i += 1) {
            if (windows[i].lastElementChild.classList.contains(app)) {
                windows[i].parentNode.removeChild(windows[i]);
            }
        }
    }
}

module.exports = router;

},{"./Window.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQ2hhdC5qcyIsImNsaWVudC9zb3VyY2UvanMvTWVtb3J5LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9XaW5kb3cuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvY29uZmlnLmpzb24iLCJjbGllbnQvc291cmNlL2pzL3JvdXRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmxldCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5sZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG5cbmZ1bmN0aW9uIENoYXQoY29udGFpbmVyKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Jyk7XG5cbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0VXNlcm5hbWUodGVtcGxhdGUsIGNvbnRhaW5lcikudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuRm9yRW50ZXIodGhpcy5jaGF0RGl2LCBjb250YWluZXIpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGlzdGVuRm9yRW50ZXIodGhpcy5jaGF0RGl2LCBjb250YWluZXIpO1xuICAgIH1cbn1cblxuXG5DaGF0LnByb3RvdHlwZS5saXN0ZW5Gb3JFbnRlciA9IGZ1bmN0aW9uKGNoYXREaXYsIGNvbnRhaW5lcikge1xuICAgIGNoYXREaXYuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAvLyBMaXN0ZW4gZm9yIEVudGVyIGtleVxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgIC8vIFNlbmQgYSBtZXNzYWdlIGFuZCBlbXB0eSB0aGUgdGV4dGFyZWFcbiAgICAgICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjaGF0RGl2KTtcbn07XG5cblxuQ2hhdC5wcm90b3R5cGUuc2V0VXNlcm5hbWUgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBsZXQgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbGV0IHVzZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBsZXQgYnV0dG9uID0gZm9ybS5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh1c2VyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIGNvbnNvbGUubG9nKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpKTtcblxuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB1c2VybmFtZSA9IHVzZXIudmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YoU3RvcmFnZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJuYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIHVzZXJuYW1lKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdXNlci5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKCdZb3UgaGF2ZSB0byBjaG9vc2UgYSB1c2VybmFtZS4nKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coJ1NvcnJ5LCBubyBzdXBwb3J0IGZvciBXZWIgU3RvcmFnZS4nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRkcmVzcyk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBhcmUgY29ubmVjdGVkLicpO1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIuJykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByaW50TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgfS5iaW5kKHRoaXMpKTtcblxufTtcblxuXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpIHtcblxuICAgIGxldCBkYXRhID0ge1xuICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgIHVzZXJuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSxcbiAgICAgICAgLy9jaGFubmVsOiAnbXksIG5vdCBzbyBzZWNyZXQsIGNoYW5uZWwnLFxuICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICB9O1xuXG4gICAgdGhpcy5jb25uZWN0KCkudGhlbihmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgICAgaWYgKHRleHQgPT09ICdwbGF5IG1lbW9yeScpIHtcbiAgICAgICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgJ21lbW9yeScpO1xuICAgICAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgIH0pO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5wcmludE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RlbXBsYXRlJylbMF07XG5cbiAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy50ZXh0JylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0aG9yJylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXNzYWdlcycpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiZnVuY3Rpb24gcGxheU1lbW9yeShyb3dzLCBjb2xzLCBjb250YWluZXIpIHtcblxuICAgIGxldCBhO1xuICAgIGxldCB0aWxlcyA9IFtdO1xuICAgIGxldCB0dXJuMTtcbiAgICBsZXQgdHVybjI7XG4gICAgbGV0IGxhc3RUaWxlO1xuICAgIGxldCBwYWlycyA9IDA7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICBsZXQgc2Vjb25kcztcbiAgICBsZXQgdGhlVGltZXIgPSBmYWxzZTtcbiAgICBsZXQgdG90YWxUaW1lID0gMDtcblxuICAgIHRpbGVzID0gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKSB8fCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVtb3J5Q29udGFpbmVyJyk7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lbW9yeUNvbnRhaW5lciB0ZW1wbGF0ZScpWzBdLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdiwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgbGV0IHRpbWVyVGFnID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAodGhlVGltZXIgPT09IGZhbHNlKSB7XG4gICAgICAgIHNlY29uZHMgPSBzZXRJbnRlcnZhbCh0aW1lciwgMTAwMCk7XG4gICAgfVxuXG4gICAgZGl2LmFwcGVuZENoaWxkKHJlc3VsdFRhZyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHRpbWVyVGFnKTtcblxuICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJywgaW5kZXgpO1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICBpZiAoKGluZGV4KzEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSAnSU1HJyA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJykpO1xuICAgICAgICB0dXJuQnJpY2sodGlsZXNbaW5kZXhdLCBpbmRleCwgaW1nKTtcbiAgICB9KTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG5cbiAgICBmdW5jdGlvbiB0aW1lcigpIHtcbiAgICAgICAgdGhlVGltZXIgPSB0cnVlO1xuICAgICAgICB0b3RhbFRpbWUgKz0gMTtcbiAgICAgICAgdGltZXJUYWcudGV4dENvbnRlbnQgPSAnVGltZXI6ICcgKyB0b3RhbFRpbWU7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiB0dXJuQnJpY2sodGlsZSwgaW5kZXgsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGltZy5zcmMgPSAnaW1hZ2UvJyArIHRpbGUgKyAnLnBuZyc7XG5cbiAgICAgICAgaWYgKCF0dXJuMSkge1xuICAgICAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbWcgPT09IHR1cm4xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcblxuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMqcm93cykvMikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhlVGltZXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVUaW1lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyVGFnLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdXb24gb24gJyArIHRyaWVzICsgJyB0cmllcyBpbiAnICsgdG90YWxUaW1lICsgJyBzZWNvbmRzLicpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRUYWcuYXBwZW5kQ2hpbGQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9ICdpbWFnZS8wLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9ICdpbWFnZS8wLnBuZyc7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5cbmZ1bmN0aW9uIGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGFyciA9IFtdO1xuXG4gICAgZm9yKGkgPSAxOyBpIDw9IChyb3dzKmNvbHMpLzI7IGkgKz0gMSkge1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgfVxuXG4gICAgZm9yKGxldCB4ID0gYXJyLmxlbmd0aCAtIDE7IHggPiAwOyB4IC09IDEpIHtcbiAgICAgICAgbGV0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoeCArIDEpKTtcbiAgICAgICAgbGV0IHRlbXAgPSBhcnJbeF07XG4gICAgICAgIGFyclt4XSA9IGFycltqXTtcbiAgICAgICAgYXJyW2pdID0gdGVtcDtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsYXlNZW1vcnk6IHBsYXlNZW1vcnksXG4gICAgc2h1ZmZsZTogZ2V0UGljdHVyZUFycmF5XG59O1xuIiwiXG5sZXQgYVdpbmRvdywgaWQgPSAwO1xuXG5mdW5jdGlvbiBuZXdXaW5kb3cod2lkdGgsIGhlaWdodCwgYXBwTmFtZSkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmFwcE5hbWUgPSBhcHBOYW1lO1xuICAgIHRoaXMud2luZG93UG9zVG9wID0gMDtcbiAgICB0aGlzLndpbmRvd1Bvc0xlZnQgPSAwO1xuXG4gICAgYVdpbmRvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dpbmRvdycpWzBdO1xuXG59XG5cbm5ld1dpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjbG9uZSA9IGFXaW5kb3cuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ21lbW9yeScpIHtcblxuICAgICAgICBsZXQgbWVtb3J5ID0gcmVxdWlyZSgnLi9NZW1vcnkuanMnKTtcbiAgICAgICAgbGV0IGdhbWUgPSBtZW1vcnkucGxheU1lbW9yeSg0LCA0KTtcbiAgICAgICAgbGV0IGxvZ28gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICBsb2dvLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2ltYWdlL21lbW9yeS5wbmcnKTtcblxuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChsb2dvKTtcbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoZ2FtZS5sYXN0RWxlbWVudENoaWxkKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAnY2hhdCcpIHtcblxuICAgICAgICBsZXQgQ2hhdCA9IHJlcXVpcmUoJy4vQ2hhdC5qcycpO1xuICAgICAgICBsZXQgY2hhdCA9IG5ldyBDaGF0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Q29udGFpbmVyJykpO1xuICAgICAgICBsZXQgbG9nbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgIGxvZ28uc2V0QXR0cmlidXRlKCdzcmMnLCAnaW1hZ2UvY2hhdC5wbmcnKTtcblxuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChsb2dvKTtcbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoY2hhdC5jaGF0RGl2KTtcbiAgICB9XG5cbiAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIGlkICs9IDE7XG5cbiAgICB0aGlzLnBvc2l0aW9uKGNsb25lKTtcblxuICAgIGFXaW5kb3cucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChjbG9uZSk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbih0aGVXaW5kb3cpIHtcbiAgICBhV2luZG93LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhlV2luZG93KTtcbn07XG5cblxubmV3V2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKGNsb25lKSB7XG5cbiAgICBjbG9uZS5zdHlsZS5sZWZ0ID0gdGhpcy53aW5kb3dQb3NMZWZ0ICsgcGFyc2VJbnQoY2xvbmUuaWQgKyA1KSArICdweCc7XG4gICAgY2xvbmUuc3R5bGUudG9wID0gdGhpcy53aW5kb3dQb3NUb3AgKyBwYXJzZUludChjbG9uZS5pZCArIDUpICsgJ3B4JztcblxuICAgIGNsb25lLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZHJhZyhjbG9uZSwgZXZlbnQpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50KSB7XG4gICAgbGV0IHN0YXJ0WCA9IGV2ZW50LmNsaWVudFgsIHN0YXJ0WSA9IGV2ZW50LmNsaWVudFk7XG4gICAgbGV0IG9yaWdYID0gZWxlbWVudC5vZmZzZXRMZWZ0LCBvcmlnWSA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgIGxldCBkZWx0YVggPSBzdGFydFggLSBvcmlnWCwgZGVsdGFZID0gc3RhcnRZIC0gb3JpZ1k7XG5cbiAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlLCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHJlbGVhc2UsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBtb3ZlKGUpIHtcbiAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICBlID0gd2luZG93LmV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lID09PSAnd2luZG93Jykge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgKz0gJyBhY3RpdmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gKGUuY2xpZW50WCAtIGRlbHRhWCkgKyAncHgnO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9IChlLmNsaWVudFkgLSBkZWx0YVkpICsgJ3B4JztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWxlYXNlKGUpIHtcbiAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICBlID0gd2luZG93LmV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lID09PSAnd2luZG93IGFjdGl2ZScpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ3dpbmRvdyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHJlbGVhc2UsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ld1dpbmRvdztcbiIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgUHJvZmVzc29yUG90YXRpc1xuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5sZXQgcm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXIuanMnKTtcbnJvdXRlcigpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG59XG4iLCJcbmZ1bmN0aW9uIHJvdXRlcigpIHtcbiAgICBsZXQgbWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51Jyk7XG4gICAgbGV0IGNsaWNrQ291bnQgPSAwO1xuICAgIGxldCBjbGlja1RpbWVyO1xuXG4gICAgbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNsaWNrQ291bnQgKz0gMTtcblxuICAgICAgICBsZXQgYXBwID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuaWQ7XG5cbiAgICAgICAgc3dpdGNoIChhcHApIHtcbiAgICAgICAgICAgIGNhc2UgJ21lbW9yeUFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnbWVtb3J5Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgnbWVtb3J5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2hhdEFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnY2hhdCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xpY2tDb3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBcHAoJ2NoYXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKGFwcCkge1xuICAgICAgICBsZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG4gICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgYXBwKTtcbiAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBcHAoYXBwKSB7XG4gICAgICAgIGxldCB3aW5kb3dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2luZG93Jyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAod2luZG93c1tpXS5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5jb250YWlucyhhcHApKSB7XG4gICAgICAgICAgICAgICAgd2luZG93c1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHdpbmRvd3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==
