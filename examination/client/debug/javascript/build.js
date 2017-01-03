(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function about() {
    let template = document.querySelector('#about');
    let content = document.importNode(template.content, true);

    return content;
}

module.exports = about;

},{}],2:[function(require,module,exports){

let config = require('./config.json');
let aWindow = require('./Window.js');

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

},{"./Window.js":5,"./config.json":7}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){

function Video() {
    let template = document.querySelector('#video');
    let content = document.importNode(template.content.firstElementChild, true);
    let video = content.firstElementChild;
    console.log(content);
    console.log(video);


    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true, video: true },
            function(stream) {
                video.srcObject = stream;
                video.onloadedmetadata = function() {
                    video.play();
                };
            },
            function(err) {
                console.log('The following error occurred: ' + err.name);
            }
        );
    } else {
        console.log('getUserMedia not supported');
    }




    /*function hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
        console.log('Good to go!');


    } else {
        alert('getUserMedia() is not supported in your browser');
    }*/


    return content;

}


module.exports = Video;

},{}],5:[function(require,module,exports){

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
        let chat = new Chat(document.querySelector('#chat'));
        let logo = document.createElement('img');

        logo.setAttribute('src', 'image/chat.png');

        clone.appendChild(logo);
        clone.appendChild(chat.chatDiv);

    } else if (this.appName === 'about') {

        let about = require('./About.js');
        let content = about();
        let logo = document.createElement('img');

        logo.setAttribute('src', 'image/about.png');

        clone.appendChild(logo);
        clone.appendChild(content);

    } else if (this.appName === 'video') {

        let video = require('./Video.js');
        let content = video();
        let logo = document.createElement('img');

        logo.setAttribute('src', 'image/video.png');

        clone.appendChild(logo);
        clone.appendChild(content);
    }

    clone.setAttribute('id', id);
    id += 1;

    this.position(clone);

    aWindow.parentNode.appendChild(clone);
};


newWindow.prototype.position = function(clone) {

    clone.style.left = this.windowPosLeft + parseInt(clone.id + 5) + 'px';
    clone.style.top = this.windowPosTop + parseInt(clone.id + 5) + 'px';

    clone.addEventListener('mousedown', function(event) {
        if (event.target.className !== 'messageArea') {
            this.getFocus(clone);
            this.drag(clone, event);
        }
    }.bind(this));
};


newWindow.prototype.getFocus = function(clone) {
    // Get focus and put window on top
    let parent = clone.parentNode;
    parent.appendChild(clone);
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

},{"./About.js":1,"./Chat.js":2,"./Memory.js":3,"./Video.js":4}],6:[function(require,module,exports){
/**
 * Starting point of the application.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

let router = require('./router.js');
router();

},{"./router.js":8}],7:[function(require,module,exports){
module.exports={
    "address": "ws://vhost3.lnu.se:20080/socket/",
    "key": "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
}

},{}],8:[function(require,module,exports){

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
            case 'aboutApp':
                if (clickCount === 1) {
                    clickTimer = setTimeout(function() {
                       clickCount = 0;
                       startApp('about');
                    }, 200);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    removeApp('about');
                }
                break;
            case 'streamApp':
                if (clickCount === 1) {
                    clickTimer = setTimeout(function() {
                       clickCount = 0;
                       startApp('video');
                    }, 200);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    removeApp('video');
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

},{"./Window.js":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWJvdXQuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXQuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeS5qcyIsImNsaWVudC9zb3VyY2UvanMvVmlkZW8uanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmZ1bmN0aW9uIGFib3V0KCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFib3V0O1xuIiwiXG5sZXQgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcuanNvbicpO1xubGV0IGFXaW5kb3cgPSByZXF1aXJlKCcuL1dpbmRvdy5qcycpO1xuXG5mdW5jdGlvbiBDaGF0KHRlbXBsYXRlKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NoYXQnKTtcblxuICAgIHRoaXMuY2hhdERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRVc2VybmFtZSh0ZW1wbGF0ZSwgdGhpcy5jaGF0RGl2KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jaGF0RGl2LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgIHRoaXMuY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZSgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5Gb3JFbnRlcih0aGlzLmNoYXREaXYpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGlzdGVuRm9yRW50ZXIodGhpcy5jaGF0RGl2KTtcbiAgICB9XG59XG5cblxuQ2hhdC5wcm90b3R5cGUuc2V0VXNlcm5hbWUgPSBmdW5jdGlvbih0ZW1wbGF0ZSwgY2hhdERpdikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbGV0IGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQubGFzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIGxldCB1c2VyID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgbGV0IGJ1dHRvbiA9IGZvcm0ubGFzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICBjaGF0RGl2LmFwcGVuZENoaWxkKHVzZXIpO1xuICAgICAgICBjaGF0RGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgICAgIGNoYXREaXYuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICBjaGF0RGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG5cbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgdXNlcm5hbWUgPSB1c2VyLnZhbHVlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGlmICh1c2VybmFtZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcm5hbWUnLCB1c2VybmFtZSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHVzZXIuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChjb25zb2xlLmxvZygnWW91IGhhdmUgdG8gY2hvb3NlIGEgdXNlcm5hbWUuJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKCdTb3JyeSwgbm8gc3VwcG9ydCBmb3IgV2ViIFN0b3JhZ2UuJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cblxuQ2hhdC5wcm90b3R5cGUubGlzdGVuRm9yRW50ZXIgPSBmdW5jdGlvbihjaGF0RGl2KSB7XG4gICAgY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIExpc3RlbiBmb3IgRW50ZXIga2V5XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgYW5kIGVtcHR5IHRoZSB0ZXh0YXJlYVxuICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXG4gICAgICAgIGlmICh0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRkcmVzcyk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1lvdSBhcmUgY29ubmVjdGVkLicpO1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIuJykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByaW50TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgfS5iaW5kKHRoaXMpKTtcblxufTtcblxuXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpIHtcblxuICAgIGxldCBkYXRhID0ge1xuICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgIHVzZXJuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSxcbiAgICAgICAgLy9jaGFubmVsOiAnbXksIG5vdCBzbyBzZWNyZXQsIGNoYW5uZWwnLFxuICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICB9O1xuXG4gICAgdGhpcy5jb25uZWN0KCkudGhlbihmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgICAgaWYgKHRleHQgPT09ICdwbGF5IG1lbW9yeScpIHtcbiAgICAgICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgJ21lbW9yeScpO1xuICAgICAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICAgICAgfVxuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgIH0pO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5wcmludE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RlbXBsYXRlJylbMF07XG5cbiAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy50ZXh0JylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGE7XG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0aG9yJylbMF0udGV4dENvbnRlbnQgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5jaGF0RGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXNzYWdlcycpWzBdLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiZnVuY3Rpb24gcGxheU1lbW9yeShyb3dzLCBjb2xzLCBjb250YWluZXIpIHtcblxuICAgIGxldCBhO1xuICAgIGxldCB0aWxlcyA9IFtdO1xuICAgIGxldCB0dXJuMTtcbiAgICBsZXQgdHVybjI7XG4gICAgbGV0IGxhc3RUaWxlO1xuICAgIGxldCBwYWlycyA9IDA7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICBsZXQgc2Vjb25kcztcbiAgICBsZXQgdGhlVGltZXIgPSBmYWxzZTtcbiAgICBsZXQgdG90YWxUaW1lID0gMDtcblxuICAgIHRpbGVzID0gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKSB8fCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVtb3J5Q29udGFpbmVyJyk7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lbW9yeUNvbnRhaW5lciB0ZW1wbGF0ZScpWzBdLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdiwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgbGV0IHRpbWVyVGFnID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAodGhlVGltZXIgPT09IGZhbHNlKSB7XG4gICAgICAgIHNlY29uZHMgPSBzZXRJbnRlcnZhbCh0aW1lciwgMTAwMCk7XG4gICAgfVxuXG4gICAgZGl2LmFwcGVuZENoaWxkKHJlc3VsdFRhZyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHRpbWVyVGFnKTtcblxuICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJywgaW5kZXgpO1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICBpZiAoKGluZGV4KzEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSAnSU1HJyA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJykpO1xuICAgICAgICB0dXJuQnJpY2sodGlsZXNbaW5kZXhdLCBpbmRleCwgaW1nKTtcbiAgICB9KTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG5cbiAgICBmdW5jdGlvbiB0aW1lcigpIHtcbiAgICAgICAgdGhlVGltZXIgPSB0cnVlO1xuICAgICAgICB0b3RhbFRpbWUgKz0gMTtcbiAgICAgICAgdGltZXJUYWcudGV4dENvbnRlbnQgPSAnVGltZXI6ICcgKyB0b3RhbFRpbWU7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiB0dXJuQnJpY2sodGlsZSwgaW5kZXgsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGltZy5zcmMgPSAnaW1hZ2UvJyArIHRpbGUgKyAnLnBuZyc7XG5cbiAgICAgICAgaWYgKCF0dXJuMSkge1xuICAgICAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbWcgPT09IHR1cm4xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcblxuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMqcm93cykvMikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhlVGltZXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2Vjb25kcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVUaW1lciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyVGFnLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdXb24gb24gJyArIHRyaWVzICsgJyB0cmllcyBpbiAnICsgdG90YWxUaW1lICsgJyBzZWNvbmRzLicpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRUYWcuYXBwZW5kQ2hpbGQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDMwMCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9ICdpbWFnZS8wLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9ICdpbWFnZS8wLnBuZyc7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5cbmZ1bmN0aW9uIGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGFyciA9IFtdO1xuXG4gICAgZm9yKGkgPSAxOyBpIDw9IChyb3dzKmNvbHMpLzI7IGkgKz0gMSkge1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgfVxuXG4gICAgZm9yKGxldCB4ID0gYXJyLmxlbmd0aCAtIDE7IHggPiAwOyB4IC09IDEpIHtcbiAgICAgICAgbGV0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoeCArIDEpKTtcbiAgICAgICAgbGV0IHRlbXAgPSBhcnJbeF07XG4gICAgICAgIGFyclt4XSA9IGFycltqXTtcbiAgICAgICAgYXJyW2pdID0gdGVtcDtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsYXlNZW1vcnk6IHBsYXlNZW1vcnksXG4gICAgc2h1ZmZsZTogZ2V0UGljdHVyZUFycmF5XG59O1xuIiwiXG5mdW5jdGlvbiBWaWRlbygpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdmlkZW8nKTtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgbGV0IHZpZGVvID0gY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBjb25zb2xlLmxvZyhjb250ZW50KTtcbiAgICBjb25zb2xlLmxvZyh2aWRlbyk7XG5cblxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7XG5cbiAgICBpZiAobmF2aWdhdG9yLmdldFVzZXJNZWRpYSkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHsgYXVkaW86IHRydWUsIHZpZGVvOiB0cnVlIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgICAgICB2aWRlby5zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgICAgICAgdmlkZW8ub25sb2FkZWRtZXRhZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIGZvbGxvd2luZyBlcnJvciBvY2N1cnJlZDogJyArIGVyci5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnZ2V0VXNlck1lZGlhIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG5cblxuXG5cbiAgICAvKmZ1bmN0aW9uIGhhc0dldFVzZXJNZWRpYSgpIHtcbiAgICAgICAgcmV0dXJuICEhKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWEpO1xuICAgIH1cblxuICAgIGlmIChoYXNHZXRVc2VyTWVkaWEoKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnR29vZCB0byBnbyEnKTtcblxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWxlcnQoJ2dldFVzZXJNZWRpYSgpIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyJyk7XG4gICAgfSovXG5cblxuICAgIHJldHVybiBjb250ZW50O1xuXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWRlbztcbiIsIlxubGV0IGFXaW5kb3csIGlkID0gMDtcblxuZnVuY3Rpb24gbmV3V2luZG93KHdpZHRoLCBoZWlnaHQsIGFwcE5hbWUpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5hcHBOYW1lID0gYXBwTmFtZTtcbiAgICB0aGlzLndpbmRvd1Bvc1RvcCA9IDA7XG4gICAgdGhpcy53aW5kb3dQb3NMZWZ0ID0gMDtcblxuICAgIGFXaW5kb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3aW5kb3cnKVswXTtcblxufVxuXG5uZXdXaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY2xvbmUgPSBhV2luZG93LmNsb25lTm9kZSh0cnVlKTtcblxuICAgIGlmICh0aGlzLmFwcE5hbWUgPT09ICdtZW1vcnknKSB7XG5cbiAgICAgICAgbGV0IG1lbW9yeSA9IHJlcXVpcmUoJy4vTWVtb3J5LmpzJyk7XG4gICAgICAgIGxldCBnYW1lID0gbWVtb3J5LnBsYXlNZW1vcnkoNCwgNCk7XG4gICAgICAgIGxldCBsb2dvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICAgICAgbG9nby5zZXRBdHRyaWJ1dGUoJ3NyYycsICdpbWFnZS9tZW1vcnkucG5nJyk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQobG9nbyk7XG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGdhbWUubGFzdEVsZW1lbnRDaGlsZCk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ2NoYXQnKSB7XG5cbiAgICAgICAgbGV0IENoYXQgPSByZXF1aXJlKCcuL0NoYXQuanMnKTtcbiAgICAgICAgbGV0IGNoYXQgPSBuZXcgQ2hhdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2hhdCcpKTtcbiAgICAgICAgbGV0IGxvZ28gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICBsb2dvLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2ltYWdlL2NoYXQucG5nJyk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQobG9nbyk7XG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGNoYXQuY2hhdERpdik7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ2Fib3V0Jykge1xuXG4gICAgICAgIGxldCBhYm91dCA9IHJlcXVpcmUoJy4vQWJvdXQuanMnKTtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBhYm91dCgpO1xuICAgICAgICBsZXQgbG9nbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgIGxvZ28uc2V0QXR0cmlidXRlKCdzcmMnLCAnaW1hZ2UvYWJvdXQucG5nJyk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQobG9nbyk7XG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcE5hbWUgPT09ICd2aWRlbycpIHtcblxuICAgICAgICBsZXQgdmlkZW8gPSByZXF1aXJlKCcuL1ZpZGVvLmpzJyk7XG4gICAgICAgIGxldCBjb250ZW50ID0gdmlkZW8oKTtcbiAgICAgICAgbGV0IGxvZ28gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICBsb2dvLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2ltYWdlL3ZpZGVvLnBuZycpO1xuXG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGxvZ28pO1xuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChjb250ZW50KTtcbiAgICB9XG5cbiAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIGlkICs9IDE7XG5cbiAgICB0aGlzLnBvc2l0aW9uKGNsb25lKTtcblxuICAgIGFXaW5kb3cucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChjbG9uZSk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbihjbG9uZSkge1xuXG4gICAgY2xvbmUuc3R5bGUubGVmdCA9IHRoaXMud2luZG93UG9zTGVmdCArIHBhcnNlSW50KGNsb25lLmlkICsgNSkgKyAncHgnO1xuICAgIGNsb25lLnN0eWxlLnRvcCA9IHRoaXMud2luZG93UG9zVG9wICsgcGFyc2VJbnQoY2xvbmUuaWQgKyA1KSArICdweCc7XG5cbiAgICBjbG9uZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTmFtZSAhPT0gJ21lc3NhZ2VBcmVhJykge1xuICAgICAgICAgICAgdGhpcy5nZXRGb2N1cyhjbG9uZSk7XG4gICAgICAgICAgICB0aGlzLmRyYWcoY2xvbmUsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuZ2V0Rm9jdXMgPSBmdW5jdGlvbihjbG9uZSkge1xuICAgIC8vIEdldCBmb2N1cyBhbmQgcHV0IHdpbmRvdyBvbiB0b3BcbiAgICBsZXQgcGFyZW50ID0gY2xvbmUucGFyZW50Tm9kZTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xufTtcblxuXG5uZXdXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlbGVtZW50LCBldmVudCkge1xuICAgIGxldCBzdGFydFggPSBldmVudC5jbGllbnRYLCBzdGFydFkgPSBldmVudC5jbGllbnRZO1xuICAgIGxldCBvcmlnWCA9IGVsZW1lbnQub2Zmc2V0TGVmdCwgb3JpZ1kgPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsZXQgZGVsdGFYID0gc3RhcnRYIC0gb3JpZ1gsIGRlbHRhWSA9IHN0YXJ0WSAtIG9yaWdZO1xuXG4gICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZWxlYXNlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gbW92ZShlKSB7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTmFtZSA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IChlLmNsaWVudFggLSBkZWx0YVgpICsgJ3B4JztcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSAoZS5jbGllbnRZIC0gZGVsdGFZKSArICdweCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVsZWFzZShlKSB7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTmFtZSA9PT0gJ3dpbmRvdyBhY3RpdmUnKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICd3aW5kb3cnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZWxlYXNlLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmUsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXdXaW5kb3c7XG4iLCIvKipcbiAqIFN0YXJ0aW5nIHBvaW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxubGV0IHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyLmpzJyk7XG5yb3V0ZXIoKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxufVxuIiwiXG5mdW5jdGlvbiByb3V0ZXIoKSB7XG4gICAgbGV0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVudScpO1xuICAgIGxldCBjbGlja0NvdW50ID0gMDtcbiAgICBsZXQgY2xpY2tUaW1lcjtcblxuICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbGlja0NvdW50ICs9IDE7XG5cbiAgICAgICAgbGV0IGFwcCA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmlkO1xuXG4gICAgICAgIHN3aXRjaCAoYXBwKSB7XG4gICAgICAgICAgICBjYXNlICdtZW1vcnlBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ21lbW9yeScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xpY2tDb3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBcHAoJ21lbW9yeScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NoYXRBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ2NoYXQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCdjaGF0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWJvdXRBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ2Fib3V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdHJlYW1BcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ3ZpZGVvJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgndmlkZW8nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKGFwcCkge1xuICAgICAgICBsZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG4gICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgYXBwKTtcbiAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBcHAoYXBwKSB7XG4gICAgICAgIGxldCB3aW5kb3dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2luZG93Jyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAod2luZG93c1tpXS5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5jb250YWlucyhhcHApKSB7XG4gICAgICAgICAgICAgICAgd2luZG93c1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHdpbmRvd3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==
