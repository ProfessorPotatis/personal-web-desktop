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

    if (navigator.getUserMedia) {
        console.log('Good to go!');
        let errorCallback = function(e) {
            console.log('Rejected!', e);
        };

    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;


    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: true, video: true}, function(stream) {
        this.video.src = window.URL.createObjectURL(stream);
        }, errorCallback);
    } else {
        this.video.src = 'somevideo.webm'; // fallback.
    }

    } else {
        alert('getUserMedia() is not supported in your browser');
    }
}


Video.prototype.hasGetUserMedia = function() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
};


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
        console.log(content);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWJvdXQuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXQuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeS5qcyIsImNsaWVudC9zb3VyY2UvanMvVmlkZW8uanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuZnVuY3Rpb24gYWJvdXQoKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Fib3V0Jyk7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWJvdXQ7XG4iLCJcbmxldCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5sZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG5cbmZ1bmN0aW9uIENoYXQodGVtcGxhdGUpIHtcbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZSB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2hhdCcpO1xuXG4gICAgdGhpcy5jaGF0RGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldFVzZXJuYW1lKHRlbXBsYXRlLCB0aGlzLmNoYXREaXYpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXREaXYuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LnJlbW92ZSgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgdGhpcy5jaGF0RGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZy5jbGFzc0xpc3QucmVtb3ZlKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbkZvckVudGVyKHRoaXMuY2hhdERpdik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5saXN0ZW5Gb3JFbnRlcih0aGlzLmNoYXREaXYpO1xuICAgIH1cbn1cblxuXG5DaGF0LnByb3RvdHlwZS5zZXRVc2VybmFtZSA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBjaGF0RGl2KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBsZXQgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbGV0IHVzZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBsZXQgYnV0dG9uID0gZm9ybS5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGNoYXREaXYuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgICAgIGNoYXREaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgIGNoYXREaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcblxuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB1c2VybmFtZSA9IHVzZXIudmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YoU3RvcmFnZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJuYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIHVzZXJuYW1lKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdXNlci5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKCdZb3UgaGF2ZSB0byBjaG9vc2UgYSB1c2VybmFtZS4nKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coJ1NvcnJ5LCBubyBzdXBwb3J0IGZvciBXZWIgU3RvcmFnZS4nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuXG5DaGF0LnByb3RvdHlwZS5saXN0ZW5Gb3JFbnRlciA9IGZ1bmN0aW9uKGNoYXREaXYpIHtcbiAgICBjaGF0RGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgLy8gTGlzdGVuIGZvciBFbnRlciBrZXlcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAvLyBTZW5kIGEgbWVzc2FnZSBhbmQgZW1wdHkgdGhlIHRleHRhcmVhXG4gICAgICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5cbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZGRyZXNzKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGFyZSBjb25uZWN0ZWQuJyk7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gdGhlIHNlcnZlci4nKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9LmJpbmQodGhpcykpO1xuXG59O1xuXG5cbkNoYXQucHJvdG90eXBlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24odGV4dCkge1xuXG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICAgIHR5cGU6ICdtZXNzYWdlJyxcbiAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgdXNlcm5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpLFxuICAgICAgICAvL2NoYW5uZWw6ICdteSwgbm90IHNvIHNlY3JldCwgY2hhbm5lbCcsXG4gICAgICAgIGtleTogY29uZmlnLmtleVxuICAgIH07XG5cbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICBpZiAodGV4dCA9PT0gJ3BsYXkgbWVtb3J5Jykge1xuICAgICAgICAgICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCAnbWVtb3J5Jyk7XG4gICAgICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgICAgICB9XG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgfSk7XG59O1xuXG5cbkNoYXQucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKVswXTtcblxuICAgIGxldCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbCgnLnRleHQnKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YTtcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRob3InKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UudXNlcm5hbWU7XG5cbiAgICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbCgnLm1lc3NhZ2VzJylbMF0uYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCJmdW5jdGlvbiBwbGF5TWVtb3J5KHJvd3MsIGNvbHMsIGNvbnRhaW5lcikge1xuXG4gICAgbGV0IGE7XG4gICAgbGV0IHRpbGVzID0gW107XG4gICAgbGV0IHR1cm4xO1xuICAgIGxldCB0dXJuMjtcbiAgICBsZXQgbGFzdFRpbGU7XG4gICAgbGV0IHBhaXJzID0gMDtcbiAgICBsZXQgdHJpZXMgPSAwO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCB0aGVUaW1lciA9IGZhbHNlO1xuICAgIGxldCB0b3RhbFRpbWUgPSAwO1xuXG4gICAgdGlsZXMgPSBnZXRQaWN0dXJlQXJyYXkocm93cywgY29scyk7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXIpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW1vcnlDb250YWluZXInKTtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbWVtb3J5Q29udGFpbmVyIHRlbXBsYXRlJylbMF0uY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdFRhZyA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLCB0cnVlKTtcbiAgICBsZXQgdGltZXJUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIGlmICh0aGVUaW1lciA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2Vjb25kcyA9IHNldEludGVydmFsKHRpbWVyLCAxMDAwKTtcbiAgICB9XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQocmVzdWx0VGFnKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodGltZXJUYWcpO1xuXG4gICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnJpY2tudW1iZXInLCBpbmRleCk7XG5cbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgICAgIGlmICgoaW5kZXgrMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxldCBpbWcgPSBldmVudC50YXJnZXQubm9kZU5hbWUgPT09ICdJTUcnID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnJpY2tudW1iZXInKSk7XG4gICAgICAgIHR1cm5Ccmljayh0aWxlc1tpbmRleF0sIGluZGV4LCBpbWcpO1xuICAgIH0pO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cblxuICAgIGZ1bmN0aW9uIHRpbWVyKCkge1xuICAgICAgICB0aGVUaW1lciA9IHRydWU7XG4gICAgICAgIHRvdGFsVGltZSArPSAxO1xuICAgICAgICB0aW1lclRhZy50ZXh0Q29udGVudCA9ICdUaW1lcjogJyArIHRvdGFsVGltZTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHR1cm5Ccmljayh0aWxlLCBpbmRleCwgaW1nKSB7XG4gICAgICAgIGlmICh0dXJuMikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaW1nLnNyYyA9ICdpbWFnZS8nICsgdGlsZSArICcucG5nJztcblxuICAgICAgICBpZiAoIXR1cm4xKSB7XG4gICAgICAgICAgICB0dXJuMSA9IGltZztcbiAgICAgICAgICAgIGxhc3RUaWxlID0gdGlsZTtcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyaWVzICs9IDE7XG5cbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuXG4gICAgICAgICAgICBpZiAodGlsZSA9PT0gbGFzdFRpbGUpIHtcbiAgICAgICAgICAgICAgICBwYWlycyArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhaXJzID09PSAoY29scypyb3dzKS8yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGVUaW1lciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVRpbWVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGltZXJUYWcuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1dvbiBvbiAnICsgdHJpZXMgKyAnIHRyaWVzIGluICcgKyB0b3RhbFRpbWUgKyAnIHNlY29uZHMuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFRhZy5hcHBlbmRDaGlsZChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgMzAwKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gJ2ltYWdlLzAucG5nJztcbiAgICAgICAgICAgICAgICAgICAgdHVybjIuc3JjID0gJ2ltYWdlLzAucG5nJztcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb250YWluZXI7XG59XG5cblxuZnVuY3Rpb24gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpIHtcbiAgICBsZXQgaTtcbiAgICBsZXQgYXJyID0gW107XG5cbiAgICBmb3IoaSA9IDE7IGkgPD0gKHJvd3MqY29scykvMjsgaSArPSAxKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICB9XG5cbiAgICBmb3IobGV0IHggPSBhcnIubGVuZ3RoIC0gMTsgeCA+IDA7IHggLT0gMSkge1xuICAgICAgICBsZXQgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh4ICsgMSkpO1xuICAgICAgICBsZXQgdGVtcCA9IGFyclt4XTtcbiAgICAgICAgYXJyW3hdID0gYXJyW2pdO1xuICAgICAgICBhcnJbal0gPSB0ZW1wO1xuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGxheU1lbW9yeTogcGxheU1lbW9yeSxcbiAgICBzaHVmZmxlOiBnZXRQaWN0dXJlQXJyYXlcbn07XG4iLCJcbmZ1bmN0aW9uIFZpZGVvKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2aWRlbycpO1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBsZXQgdmlkZW8gPSBjb250ZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGNvbnNvbGUubG9nKGNvbnRlbnQpO1xuICAgIGNvbnNvbGUubG9nKHZpZGVvKTtcblxuICAgIGlmIChuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdHb29kIHRvIGdvIScpO1xuICAgICAgICBsZXQgZXJyb3JDYWxsYmFjayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZWplY3RlZCEnLCBlKTtcbiAgICAgICAgfTtcblxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgID0gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhO1xuXG5cbiAgICBpZiAobmF2aWdhdG9yLmdldFVzZXJNZWRpYSkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHthdWRpbzogdHJ1ZSwgdmlkZW86IHRydWV9LCBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgdGhpcy52aWRlby5zcmMgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChzdHJlYW0pO1xuICAgICAgICB9LCBlcnJvckNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZpZGVvLnNyYyA9ICdzb21ldmlkZW8ud2VibSc7IC8vIGZhbGxiYWNrLlxuICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0KCdnZXRVc2VyTWVkaWEoKSBpcyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlcicpO1xuICAgIH1cbn1cblxuXG5WaWRlby5wcm90b3R5cGUuaGFzR2V0VXNlck1lZGlhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICEhKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlkZW87XG4iLCJcbmxldCBhV2luZG93LCBpZCA9IDA7XG5cbmZ1bmN0aW9uIG5ld1dpbmRvdyh3aWR0aCwgaGVpZ2h0LCBhcHBOYW1lKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuYXBwTmFtZSA9IGFwcE5hbWU7XG4gICAgdGhpcy53aW5kb3dQb3NUb3AgPSAwO1xuICAgIHRoaXMud2luZG93UG9zTGVmdCA9IDA7XG5cbiAgICBhV2luZG93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2luZG93JylbMF07XG5cbn1cblxubmV3V2luZG93LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNsb25lID0gYVdpbmRvdy5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICBpZiAodGhpcy5hcHBOYW1lID09PSAnbWVtb3J5Jykge1xuXG4gICAgICAgIGxldCBtZW1vcnkgPSByZXF1aXJlKCcuL01lbW9yeS5qcycpO1xuICAgICAgICBsZXQgZ2FtZSA9IG1lbW9yeS5wbGF5TWVtb3J5KDQsIDQpO1xuICAgICAgICBsZXQgbG9nbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgIGxvZ28uc2V0QXR0cmlidXRlKCdzcmMnLCAnaW1hZ2UvbWVtb3J5LnBuZycpO1xuXG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGxvZ28pO1xuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChnYW1lLmxhc3RFbGVtZW50Q2hpbGQpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcE5hbWUgPT09ICdjaGF0Jykge1xuXG4gICAgICAgIGxldCBDaGF0ID0gcmVxdWlyZSgnLi9DaGF0LmpzJyk7XG4gICAgICAgIGxldCBjaGF0ID0gbmV3IENoYXQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NoYXQnKSk7XG4gICAgICAgIGxldCBsb2dvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICAgICAgbG9nby5zZXRBdHRyaWJ1dGUoJ3NyYycsICdpbWFnZS9jaGF0LnBuZycpO1xuXG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGxvZ28pO1xuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChjaGF0LmNoYXREaXYpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcE5hbWUgPT09ICdhYm91dCcpIHtcblxuICAgICAgICBsZXQgYWJvdXQgPSByZXF1aXJlKCcuL0Fib3V0LmpzJyk7XG4gICAgICAgIGxldCBjb250ZW50ID0gYWJvdXQoKTtcbiAgICAgICAgbGV0IGxvZ28gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICBsb2dvLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2ltYWdlL2Fib3V0LnBuZycpO1xuXG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGxvZ28pO1xuICAgICAgICBjbG9uZS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAndmlkZW8nKSB7XG5cbiAgICAgICAgbGV0IHZpZGVvID0gcmVxdWlyZSgnLi9WaWRlby5qcycpO1xuICAgICAgICBsZXQgY29udGVudCA9IHZpZGVvKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNvbnRlbnQpO1xuICAgICAgICBsZXQgbG9nbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgIGxvZ28uc2V0QXR0cmlidXRlKCdzcmMnLCAnaW1hZ2UvdmlkZW8ucG5nJyk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQobG9nbyk7XG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgIH1cblxuICAgIGNsb25lLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgaWQgKz0gMTtcblxuICAgIHRoaXMucG9zaXRpb24oY2xvbmUpO1xuXG4gICAgYVdpbmRvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbn07XG5cblxubmV3V2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKGNsb25lKSB7XG5cbiAgICBjbG9uZS5zdHlsZS5sZWZ0ID0gdGhpcy53aW5kb3dQb3NMZWZ0ICsgcGFyc2VJbnQoY2xvbmUuaWQgKyA1KSArICdweCc7XG4gICAgY2xvbmUuc3R5bGUudG9wID0gdGhpcy53aW5kb3dQb3NUb3AgKyBwYXJzZUludChjbG9uZS5pZCArIDUpICsgJ3B4JztcblxuICAgIGNsb25lLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NOYW1lICE9PSAnbWVzc2FnZUFyZWEnKSB7XG4gICAgICAgICAgICB0aGlzLmdldEZvY3VzKGNsb25lKTtcbiAgICAgICAgICAgIHRoaXMuZHJhZyhjbG9uZSwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cblxubmV3V2luZG93LnByb3RvdHlwZS5nZXRGb2N1cyA9IGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgLy8gR2V0IGZvY3VzIGFuZCBwdXQgd2luZG93IG9uIHRvcFxuICAgIGxldCBwYXJlbnQgPSBjbG9uZS5wYXJlbnROb2RlO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjbG9uZSk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50KSB7XG4gICAgbGV0IHN0YXJ0WCA9IGV2ZW50LmNsaWVudFgsIHN0YXJ0WSA9IGV2ZW50LmNsaWVudFk7XG4gICAgbGV0IG9yaWdYID0gZWxlbWVudC5vZmZzZXRMZWZ0LCBvcmlnWSA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgIGxldCBkZWx0YVggPSBzdGFydFggLSBvcmlnWCwgZGVsdGFZID0gc3RhcnRZIC0gb3JpZ1k7XG5cbiAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlLCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHJlbGVhc2UsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBtb3ZlKGUpIHtcbiAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICBlID0gd2luZG93LmV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lID09PSAnd2luZG93Jykge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgKz0gJyBhY3RpdmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gKGUuY2xpZW50WCAtIGRlbHRhWCkgKyAncHgnO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9IChlLmNsaWVudFkgLSBkZWx0YVkpICsgJ3B4JztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWxlYXNlKGUpIHtcbiAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICBlID0gd2luZG93LmV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lID09PSAnd2luZG93IGFjdGl2ZScpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ3dpbmRvdyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHJlbGVhc2UsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ld1dpbmRvdztcbiIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBhdXRob3IgUHJvZmVzc29yUG90YXRpc1xuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5sZXQgcm91dGVyID0gcmVxdWlyZSgnLi9yb3V0ZXIuanMnKTtcbnJvdXRlcigpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwiYWRkcmVzc1wiOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAgXCJrZXlcIjogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG59XG4iLCJcbmZ1bmN0aW9uIHJvdXRlcigpIHtcbiAgICBsZXQgbWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51Jyk7XG4gICAgbGV0IGNsaWNrQ291bnQgPSAwO1xuICAgIGxldCBjbGlja1RpbWVyO1xuXG4gICAgbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNsaWNrQ291bnQgKz0gMTtcblxuICAgICAgICBsZXQgYXBwID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuaWQ7XG5cbiAgICAgICAgc3dpdGNoIChhcHApIHtcbiAgICAgICAgICAgIGNhc2UgJ21lbW9yeUFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnbWVtb3J5Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgnbWVtb3J5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2hhdEFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnY2hhdCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xpY2tDb3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBcHAoJ2NoYXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhYm91dEFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCdhYm91dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbUFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgndmlkZW8nKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCd2aWRlbycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gc3RhcnRBcHAoYXBwKSB7XG4gICAgICAgIGxldCBhV2luZG93ID0gcmVxdWlyZSgnLi9XaW5kb3cuanMnKTtcbiAgICAgICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCBhcHApO1xuICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUFwcChhcHApIHtcbiAgICAgICAgbGV0IHdpbmRvd3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3aW5kb3cnKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHdpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh3aW5kb3dzW2ldLmxhc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmNvbnRhaW5zKGFwcCkpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQod2luZG93c1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19
