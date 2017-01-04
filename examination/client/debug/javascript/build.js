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
        } else if (text === 'start a new chat') {
            let theWindow = new aWindow(400, 400, 'chat');
            theWindow.open();
        } else if (text === 'start video') {
            let theWindow = new aWindow(400, 400, 'video');
            theWindow.open();
        } else if (text === 'read about page') {
            let theWindow = new aWindow(400, 400, 'about');
            theWindow.open();
        } else {
            socket.send(JSON.stringify(data));
            console.log(text);
        }
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
    let button = content.lastElementChild;
    let classArr = ['pinkish', 'grayscale', 'sepia', 'blur', 'saturate', 'huerotate', 'invert', 'brightness', 'contrast', ''];
    let clickCount = 0;

    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true, video: { width: 1280, height: 720 } },
            function(stream) {
                video.srcObject = stream;
                video.onloadedmetadata = function() {
                    video.play();
                };
                button.addEventListener('click', function() {
                    if (clickCount === 10) {
                        clickCount = 0;
                    }

                    video.setAttribute('class', classArr[clickCount]);
                    clickCount += 1;
                });
            },
            function(err) {
                console.log('The following error occurred: ' + err.name);
            }
        );
    } else {
        console.log('getUserMedia not supported');
    }

    return content;
}


module.exports = Video;

},{}],5:[function(require,module,exports){

let aWindow, id = 0, memory = require('./Memory.js'), Chat = require('./Chat.js'),
about = require('./About.js'), video = require('./Video.js');

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
        let game = memory.playMemory(4, 4);

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

        clone.appendChild(game.lastElementChild);

    } else if (this.appName === 'chat') {
        let chat = new Chat(document.querySelector('#chat'));

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

        clone.appendChild(chat.chatDiv);

    } else if (this.appName === 'about') {
        let content = about();

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

        clone.appendChild(content);

    } else if (this.appName === 'video') {
        let content = video();

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

        clone.appendChild(content);
    }

    clone.setAttribute('id', id);
    id += 1;

    this.position(clone);

    aWindow.parentNode.appendChild(clone);
};


newWindow.prototype.setLogoAndName = function(appName, theWindow) {
    let logo = document.createElement('img');
    logo.setAttribute('src', 'image/' + appName + '.png');

    let h3 = document.createElement('h3');
    let name = document.createTextNode(' ' + appName.toUpperCase());

    h3.appendChild(name);

    theWindow.appendChild(logo);
    theWindow.appendChild(h3);
};


newWindow.prototype.closeW = function(clone) {
    let closeButton = document.createElement('input');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('value', 'X');
    closeButton.setAttribute('class', 'button');

    closeButton.addEventListener('click', function(event) {
        aWindow.parentNode.removeChild(event.target.parentNode);
    });

    clone.appendChild(closeButton);
};


newWindow.prototype.position = function(clone) {

    clone.style.left = this.windowPosLeft + parseInt(clone.id + 5) + 'px';
    clone.style.top = this.windowPosTop + parseInt(clone.id + 5) + 'px';

    clone.addEventListener('mousedown', function(event) {
        if (!event.target.classList.contains('noMove')) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWJvdXQuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXQuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeS5qcyIsImNsaWVudC9zb3VyY2UvanMvVmlkZW8uanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5mdW5jdGlvbiBhYm91dCgpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYWJvdXQnKTtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhYm91dDtcbiIsIlxubGV0IGNvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnLmpzb24nKTtcbmxldCBhV2luZG93ID0gcmVxdWlyZSgnLi9XaW5kb3cuanMnKTtcblxuZnVuY3Rpb24gQ2hhdCh0ZW1wbGF0ZSkge1xuICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcbiAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlIHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0Jyk7XG5cbiAgICB0aGlzLmNoYXREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VybmFtZScpID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0VXNlcm5hbWUodGVtcGxhdGUsIHRoaXMuY2hhdERpdikudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QucmVtb3ZlKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICB0aGlzLmNoYXREaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuRm9yRW50ZXIodGhpcy5jaGF0RGl2KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxpc3RlbkZvckVudGVyKHRoaXMuY2hhdERpdik7XG4gICAgfVxufVxuXG5cbkNoYXQucHJvdG90eXBlLnNldFVzZXJuYW1lID0gZnVuY3Rpb24odGVtcGxhdGUsIGNoYXREaXYpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGxldCBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50Lmxhc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBsZXQgdXNlciA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIGxldCBidXR0b24gPSBmb3JtLmxhc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgY2hhdERpdi5hcHBlbmRDaGlsZCh1c2VyKTtcbiAgICAgICAgY2hhdERpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICBjaGF0RGl2LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHVzZXJuYW1lID0gdXNlci52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZihTdG9yYWdlKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlcm5hbWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJuYW1lJywgdXNlcm5hbWUpKTtcblxuICAgICAgICAgICAgICAgICAgICB1c2VyLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coJ1lvdSBoYXZlIHRvIGNob29zZSBhIHVzZXJuYW1lLicpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChjb25zb2xlLmxvZygnU29ycnksIG5vIHN1cHBvcnQgZm9yIFdlYiBTdG9yYWdlLicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5cbkNoYXQucHJvdG90eXBlLmxpc3RlbkZvckVudGVyID0gZnVuY3Rpb24oY2hhdERpdikge1xuICAgIGNoYXREaXYuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAvLyBMaXN0ZW4gZm9yIEVudGVyIGtleVxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgIC8vIFNlbmQgYSBtZXNzYWdlIGFuZCBlbXB0eSB0aGUgdGV4dGFyZWFcbiAgICAgICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cblxuQ2hhdC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblxuICAgICAgICBpZiAodGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnNvY2tldCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkZHJlc3MpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgYXJlIGNvbm5lY3RlZC4nKTtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byB0aGUgc2VydmVyLicpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmludE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH0uYmluZCh0aGlzKSk7XG5cbn07XG5cblxuQ2hhdC5wcm90b3R5cGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbih0ZXh0KSB7XG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICB1c2VybmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJyksXG4gICAgICAgIC8vY2hhbm5lbDogJ215LCBub3Qgc28gc2VjcmV0LCBjaGFubmVsJyxcbiAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgfTtcblxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICAgIGlmICh0ZXh0ID09PSAncGxheSBtZW1vcnknKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdtZW1vcnknKTtcbiAgICAgICAgICAgIHRoZVdpbmRvdy5vcGVuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGV4dCA9PT0gJ3N0YXJ0IGEgbmV3IGNoYXQnKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdjaGF0Jyk7XG4gICAgICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHQgPT09ICdzdGFydCB2aWRlbycpIHtcbiAgICAgICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgJ3ZpZGVvJyk7XG4gICAgICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHQgPT09ICdyZWFkIGFib3V0IHBhZ2UnKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdhYm91dCcpO1xuICAgICAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5cbkNoYXQucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKVswXTtcblxuICAgIGxldCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbCgnLnRleHQnKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YTtcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRob3InKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UudXNlcm5hbWU7XG5cbiAgICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbCgnLm1lc3NhZ2VzJylbMF0uYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCJmdW5jdGlvbiBwbGF5TWVtb3J5KHJvd3MsIGNvbHMsIGNvbnRhaW5lcikge1xuXG4gICAgbGV0IGE7XG4gICAgbGV0IHRpbGVzID0gW107XG4gICAgbGV0IHR1cm4xO1xuICAgIGxldCB0dXJuMjtcbiAgICBsZXQgbGFzdFRpbGU7XG4gICAgbGV0IHBhaXJzID0gMDtcbiAgICBsZXQgdHJpZXMgPSAwO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCB0aGVUaW1lciA9IGZhbHNlO1xuICAgIGxldCB0b3RhbFRpbWUgPSAwO1xuXG4gICAgdGlsZXMgPSBnZXRQaWN0dXJlQXJyYXkocm93cywgY29scyk7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXIpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW1vcnlDb250YWluZXInKTtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbWVtb3J5Q29udGFpbmVyIHRlbXBsYXRlJylbMF0uY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdFRhZyA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLCB0cnVlKTtcbiAgICBsZXQgdGltZXJUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIGlmICh0aGVUaW1lciA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2Vjb25kcyA9IHNldEludGVydmFsKHRpbWVyLCAxMDAwKTtcbiAgICB9XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQocmVzdWx0VGFnKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodGltZXJUYWcpO1xuXG4gICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnJpY2tudW1iZXInLCBpbmRleCk7XG5cbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgICAgIGlmICgoaW5kZXgrMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxldCBpbWcgPSBldmVudC50YXJnZXQubm9kZU5hbWUgPT09ICdJTUcnID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnJpY2tudW1iZXInKSk7XG4gICAgICAgIHR1cm5Ccmljayh0aWxlc1tpbmRleF0sIGluZGV4LCBpbWcpO1xuICAgIH0pO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cblxuICAgIGZ1bmN0aW9uIHRpbWVyKCkge1xuICAgICAgICB0aGVUaW1lciA9IHRydWU7XG4gICAgICAgIHRvdGFsVGltZSArPSAxO1xuICAgICAgICB0aW1lclRhZy50ZXh0Q29udGVudCA9ICdUaW1lcjogJyArIHRvdGFsVGltZTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHR1cm5Ccmljayh0aWxlLCBpbmRleCwgaW1nKSB7XG4gICAgICAgIGlmICh0dXJuMikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaW1nLnNyYyA9ICdpbWFnZS8nICsgdGlsZSArICcucG5nJztcblxuICAgICAgICBpZiAoIXR1cm4xKSB7XG4gICAgICAgICAgICB0dXJuMSA9IGltZztcbiAgICAgICAgICAgIGxhc3RUaWxlID0gdGlsZTtcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyaWVzICs9IDE7XG5cbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuXG4gICAgICAgICAgICBpZiAodGlsZSA9PT0gbGFzdFRpbGUpIHtcbiAgICAgICAgICAgICAgICBwYWlycyArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhaXJzID09PSAoY29scypyb3dzKS8yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGVUaW1lciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVRpbWVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGltZXJUYWcuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1dvbiBvbiAnICsgdHJpZXMgKyAnIHRyaWVzIGluICcgKyB0b3RhbFRpbWUgKyAnIHNlY29uZHMuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFRhZy5hcHBlbmRDaGlsZChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgMzAwKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gJ2ltYWdlLzAucG5nJztcbiAgICAgICAgICAgICAgICAgICAgdHVybjIuc3JjID0gJ2ltYWdlLzAucG5nJztcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb250YWluZXI7XG59XG5cblxuZnVuY3Rpb24gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpIHtcbiAgICBsZXQgaTtcbiAgICBsZXQgYXJyID0gW107XG5cbiAgICBmb3IoaSA9IDE7IGkgPD0gKHJvd3MqY29scykvMjsgaSArPSAxKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICB9XG5cbiAgICBmb3IobGV0IHggPSBhcnIubGVuZ3RoIC0gMTsgeCA+IDA7IHggLT0gMSkge1xuICAgICAgICBsZXQgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh4ICsgMSkpO1xuICAgICAgICBsZXQgdGVtcCA9IGFyclt4XTtcbiAgICAgICAgYXJyW3hdID0gYXJyW2pdO1xuICAgICAgICBhcnJbal0gPSB0ZW1wO1xuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGxheU1lbW9yeTogcGxheU1lbW9yeSxcbiAgICBzaHVmZmxlOiBnZXRQaWN0dXJlQXJyYXlcbn07XG4iLCJcbmZ1bmN0aW9uIFZpZGVvKCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2aWRlbycpO1xuICAgIGxldCBjb250ZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBsZXQgdmlkZW8gPSBjb250ZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGxldCBidXR0b24gPSBjb250ZW50Lmxhc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IGNsYXNzQXJyID0gWydwaW5raXNoJywgJ2dyYXlzY2FsZScsICdzZXBpYScsICdibHVyJywgJ3NhdHVyYXRlJywgJ2h1ZXJvdGF0ZScsICdpbnZlcnQnLCAnYnJpZ2h0bmVzcycsICdjb250cmFzdCcsICcnXTtcbiAgICBsZXQgY2xpY2tDb3VudCA9IDA7XG5cbiAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhO1xuXG4gICAgaWYgKG5hdmlnYXRvci5nZXRVc2VyTWVkaWEpIHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7IGF1ZGlvOiB0cnVlLCB2aWRlbzogeyB3aWR0aDogMTI4MCwgaGVpZ2h0OiA3MjAgfSB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICAgICAgdmlkZW8uc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgICAgIHZpZGVvLm9ubG9hZGVkbWV0YWRhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2aWRlby5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xhc3NBcnJbY2xpY2tDb3VudF0pO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZSBmb2xsb3dpbmcgZXJyb3Igb2NjdXJyZWQ6ICcgKyBlcnIubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2dldFVzZXJNZWRpYSBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWRlbztcbiIsIlxubGV0IGFXaW5kb3csIGlkID0gMCwgbWVtb3J5ID0gcmVxdWlyZSgnLi9NZW1vcnkuanMnKSwgQ2hhdCA9IHJlcXVpcmUoJy4vQ2hhdC5qcycpLFxuYWJvdXQgPSByZXF1aXJlKCcuL0Fib3V0LmpzJyksIHZpZGVvID0gcmVxdWlyZSgnLi9WaWRlby5qcycpO1xuXG5mdW5jdGlvbiBuZXdXaW5kb3cod2lkdGgsIGhlaWdodCwgYXBwTmFtZSkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmFwcE5hbWUgPSBhcHBOYW1lO1xuICAgIHRoaXMud2luZG93UG9zVG9wID0gMDtcbiAgICB0aGlzLndpbmRvd1Bvc0xlZnQgPSAwO1xuXG4gICAgYVdpbmRvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dpbmRvdycpWzBdO1xuXG59XG5cbm5ld1dpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjbG9uZSA9IGFXaW5kb3cuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ21lbW9yeScpIHtcbiAgICAgICAgbGV0IGdhbWUgPSBtZW1vcnkucGxheU1lbW9yeSg0LCA0KTtcblxuICAgICAgICB0aGlzLnNldExvZ29BbmROYW1lKHRoaXMuYXBwTmFtZSwgY2xvbmUpO1xuICAgICAgICB0aGlzLmNsb3NlVyhjbG9uZSk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoZ2FtZS5sYXN0RWxlbWVudENoaWxkKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAnY2hhdCcpIHtcbiAgICAgICAgbGV0IGNoYXQgPSBuZXcgQ2hhdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2hhdCcpKTtcblxuICAgICAgICB0aGlzLnNldExvZ29BbmROYW1lKHRoaXMuYXBwTmFtZSwgY2xvbmUpO1xuICAgICAgICB0aGlzLmNsb3NlVyhjbG9uZSk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoY2hhdC5jaGF0RGl2KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAnYWJvdXQnKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gYWJvdXQoKTtcblxuICAgICAgICB0aGlzLnNldExvZ29BbmROYW1lKHRoaXMuYXBwTmFtZSwgY2xvbmUpO1xuICAgICAgICB0aGlzLmNsb3NlVyhjbG9uZSk7XG5cbiAgICAgICAgY2xvbmUuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICBsZXQgY29udGVudCA9IHZpZGVvKCk7XG5cbiAgICAgICAgdGhpcy5zZXRMb2dvQW5kTmFtZSh0aGlzLmFwcE5hbWUsIGNsb25lKTtcbiAgICAgICAgdGhpcy5jbG9zZVcoY2xvbmUpO1xuXG4gICAgICAgIGNsb25lLmFwcGVuZENoaWxkKGNvbnRlbnQpO1xuICAgIH1cblxuICAgIGNsb25lLnNldEF0dHJpYnV0ZSgnaWQnLCBpZCk7XG4gICAgaWQgKz0gMTtcblxuICAgIHRoaXMucG9zaXRpb24oY2xvbmUpO1xuXG4gICAgYVdpbmRvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbn07XG5cblxubmV3V2luZG93LnByb3RvdHlwZS5zZXRMb2dvQW5kTmFtZSA9IGZ1bmN0aW9uKGFwcE5hbWUsIHRoZVdpbmRvdykge1xuICAgIGxldCBsb2dvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgbG9nby5zZXRBdHRyaWJ1dGUoJ3NyYycsICdpbWFnZS8nICsgYXBwTmFtZSArICcucG5nJyk7XG5cbiAgICBsZXQgaDMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICAgIGxldCBuYW1lID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJyAnICsgYXBwTmFtZS50b1VwcGVyQ2FzZSgpKTtcblxuICAgIGgzLmFwcGVuZENoaWxkKG5hbWUpO1xuXG4gICAgdGhlV2luZG93LmFwcGVuZENoaWxkKGxvZ28pO1xuICAgIHRoZVdpbmRvdy5hcHBlbmRDaGlsZChoMyk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuY2xvc2VXID0gZnVuY3Rpb24oY2xvbmUpIHtcbiAgICBsZXQgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGNsb3NlQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ1gnKTtcbiAgICBjbG9zZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J1dHRvbicpO1xuXG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBhV2luZG93LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUpO1xuICAgIH0pO1xuXG4gICAgY2xvbmUuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xufTtcblxuXG5uZXdXaW5kb3cucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24oY2xvbmUpIHtcblxuICAgIGNsb25lLnN0eWxlLmxlZnQgPSB0aGlzLndpbmRvd1Bvc0xlZnQgKyBwYXJzZUludChjbG9uZS5pZCArIDUpICsgJ3B4JztcbiAgICBjbG9uZS5zdHlsZS50b3AgPSB0aGlzLndpbmRvd1Bvc1RvcCArIHBhcnNlSW50KGNsb25lLmlkICsgNSkgKyAncHgnO1xuXG4gICAgY2xvbmUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdub01vdmUnKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRGb2N1cyhjbG9uZSk7XG4gICAgICAgICAgICB0aGlzLmRyYWcoY2xvbmUsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5cbm5ld1dpbmRvdy5wcm90b3R5cGUuZ2V0Rm9jdXMgPSBmdW5jdGlvbihjbG9uZSkge1xuICAgIC8vIEdldCBmb2N1cyBhbmQgcHV0IHdpbmRvdyBvbiB0b3BcbiAgICBsZXQgcGFyZW50ID0gY2xvbmUucGFyZW50Tm9kZTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2xvbmUpO1xufTtcblxuXG5uZXdXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlbGVtZW50LCBldmVudCkge1xuICAgIGxldCBzdGFydFggPSBldmVudC5jbGllbnRYLCBzdGFydFkgPSBldmVudC5jbGllbnRZO1xuICAgIGxldCBvcmlnWCA9IGVsZW1lbnQub2Zmc2V0TGVmdCwgb3JpZ1kgPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsZXQgZGVsdGFYID0gc3RhcnRYIC0gb3JpZ1gsIGRlbHRhWSA9IHN0YXJ0WSAtIG9yaWdZO1xuXG4gICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZWxlYXNlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gbW92ZShlKSB7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTmFtZSA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IChlLmNsaWVudFggLSBkZWx0YVgpICsgJ3B4JztcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSAoZS5jbGllbnRZIC0gZGVsdGFZKSArICdweCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVsZWFzZShlKSB7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTmFtZSA9PT0gJ3dpbmRvdyBhY3RpdmUnKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICd3aW5kb3cnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZWxlYXNlLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmUsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXdXaW5kb3c7XG4iLCIvKipcbiAqIFN0YXJ0aW5nIHBvaW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxubGV0IHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyLmpzJyk7XG5yb3V0ZXIoKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxufVxuIiwiXG5mdW5jdGlvbiByb3V0ZXIoKSB7XG4gICAgbGV0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVudScpO1xuICAgIGxldCBjbGlja0NvdW50ID0gMDtcbiAgICBsZXQgY2xpY2tUaW1lcjtcblxuICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbGlja0NvdW50ICs9IDE7XG5cbiAgICAgICAgbGV0IGFwcCA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmlkO1xuXG4gICAgICAgIHN3aXRjaCAoYXBwKSB7XG4gICAgICAgICAgICBjYXNlICdtZW1vcnlBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ21lbW9yeScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xpY2tDb3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBcHAoJ21lbW9yeScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NoYXRBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ2NoYXQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCdjaGF0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWJvdXRBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ2Fib3V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdHJlYW1BcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ3ZpZGVvJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgndmlkZW8nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKGFwcCkge1xuICAgICAgICBsZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG4gICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgYXBwKTtcbiAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBcHAoYXBwKSB7XG4gICAgICAgIGxldCB3aW5kb3dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2luZG93Jyk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAod2luZG93c1tpXS5sYXN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5jb250YWlucyhhcHApKSB7XG4gICAgICAgICAgICAgICAgd2luZG93c1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHdpbmRvd3NbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==
