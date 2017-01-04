(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module for about.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

function about() {
    let template = document.querySelector('#about');
    let content = document.importNode(template.content, true);

    return content;
}

/**
*  Exports.
*/
module.exports = about;

},{}],2:[function(require,module,exports){
/**
 * Module for chat.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

let config = require('./config.json');
let aWindow = require('./Window.js');

/**
 * Constructor for new chat.
 */
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

/**
 * Saves username in localStorage.
 */
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

/**
 * Waiting for enter-key to be pressed.
 */
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

/**
 * Connect to WebSocket server.
 */
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

/**
 * Send message in JSON.
 */
Chat.prototype.sendMessage = function(text) {

    let data = {
        type: 'message',
        data: text,
        username: localStorage.getItem('username'),
        //channel: 'my, not so secret, channel',
        key: config.key
    };

    // FEATURE: Chat works as command line for Personal Web Desktop.
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

/**
 * Print out recieved messages.
 */
Chat.prototype.printMessage = function(message) {
    let template = this.chatDiv.querySelectorAll('template')[0];

    let messageDiv = document.importNode(template.content.firstElementChild, true);

    messageDiv.querySelectorAll('.text')[0].textContent = message.data;
    messageDiv.querySelectorAll('.author')[0].textContent = message.username;

    this.chatDiv.querySelectorAll('.messages')[0].appendChild(messageDiv);
};

/**
*  Exports.
*/
module.exports = Chat;

},{"./Window.js":5,"./config.json":7}],3:[function(require,module,exports){
/**
 * Module for memory.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

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


    // Timer.
    function timer() {
        theTimer = true;
        totalTime += 1;
        timerTag.textContent = 'Timer: ' + totalTime;
    }

    // Turning clicked brick.
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

// Randomise picture array.
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

/**
*  Exports.
*/
module.exports = {
    playMemory: playMemory,
    shuffle: getPictureArray
};

},{}],4:[function(require,module,exports){
/**
 * Module for video.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

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

                // Change filter on video.
                button.addEventListener('click', function() {
                    if (clickCount === classArr.length) {
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

/**
*  Exports.
*/
module.exports = Video;

},{}],5:[function(require,module,exports){
/**
 * Module for window.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */


let aWindow, id = 0, content, memory = require('./Memory.js'), Chat = require('./Chat.js'),
about = require('./About.js'), video = require('./Video.js');

/**
 * Constructor for new window.
 */
function newWindow(width, height, appName) {
    this.width = width;
    this.height = height;
    this.appName = appName;
    this.windowPosTop = 70;
    this.windowPosLeft = 0;

    aWindow = document.getElementsByClassName('window')[0];

}

/**
 * Clones and opens app window.
 */
newWindow.prototype.open = function() {
    let clone = aWindow.cloneNode(true);

    if (this.appName === 'memory') {
        let game = memory.playMemory(4, 4);
        content = game.lastElementChild;

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

    } else if (this.appName === 'chat') {
        let chat = new Chat(document.querySelector('#chat'));
        content = chat.chatDiv;

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

    } else if (this.appName === 'about') {
        content = about();

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);

    } else if (this.appName === 'video') {
        content = video();

        this.setLogoAndName(this.appName, clone);
        this.closeW(clone);
    }

    clone.setAttribute('id', id);
    id += 1;

    clone.appendChild(content);

    this.position(clone);

    aWindow.parentNode.appendChild(clone);
};

/**
 * Sets logo and name on app window.
 */
newWindow.prototype.setLogoAndName = function(appName, theWindow) {
    let logo = document.createElement('img');
    logo.setAttribute('src', 'image/' + appName + '.png');

    let h3 = document.createElement('h3');
    let name = document.createTextNode(' ' + appName.toUpperCase());

    h3.appendChild(name);

    theWindow.appendChild(logo);
    theWindow.appendChild(h3);
};

/**
 * Attaches a closebutton (X) and closes app window.
 */
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

/**
 * Positions app window on opening.
 */
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

/**
 * Focus and puts app window on top.
 */
newWindow.prototype.getFocus = function(clone) {
    // Get focus and put window on top
    let parent = clone.parentNode;
    parent.appendChild(clone);
};

/**
 * Drag and drop app window.
 */
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

    // Moves app window.
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

    // Releases app window.
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

/**
*  Exports.
*/
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
/**
 * Module for router.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

function router() {
    let menu = document.getElementById('menu');
    let clickCount = 0;
    let clickTimer;

     /**
     * Single click on menu opens new app window.
     * Double click on menu closes app window.
     */
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

    // Creates new window and opens app.
    function startApp(app) {
        let aWindow = require('./Window.js');
        let theWindow = new aWindow(400, 400, app);
        theWindow.open();
    }

    // Removes app windows.
    function removeApp(app) {
        let windows = document.getElementsByClassName('window');

        for (let i = 1; i < windows.length; i += 1) {
            if (windows[i].lastElementChild.classList.contains(app)) {
                windows[i].parentNode.removeChild(windows[i]);
            }
        }
    }
}

/**
*  Exports.
*/
module.exports = router;

},{"./Window.js":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWJvdXQuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXQuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeS5qcyIsImNsaWVudC9zb3VyY2UvanMvVmlkZW8uanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBhYm91dC5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuZnVuY3Rpb24gYWJvdXQoKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Fib3V0Jyk7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuKiAgRXhwb3J0cy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGFib3V0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGNoYXQuXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmxldCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5sZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG5cbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIG5ldyBjaGF0LlxuICovXG5mdW5jdGlvbiBDaGF0KHRlbXBsYXRlKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NoYXQnKTtcblxuICAgIHRoaXMuY2hhdERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRVc2VybmFtZSh0ZW1wbGF0ZSwgdGhpcy5jaGF0RGl2KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jaGF0RGl2LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgIHRoaXMuY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZSgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5Gb3JFbnRlcih0aGlzLmNoYXREaXYpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGlzdGVuRm9yRW50ZXIodGhpcy5jaGF0RGl2KTtcbiAgICB9XG59XG5cbi8qKlxuICogU2F2ZXMgdXNlcm5hbWUgaW4gbG9jYWxTdG9yYWdlLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZXRVc2VybmFtZSA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBjaGF0RGl2KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBsZXQgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbGV0IHVzZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBsZXQgYnV0dG9uID0gZm9ybS5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGNoYXREaXYuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgICAgIGNoYXREaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgIGNoYXREaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcblxuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB1c2VybmFtZSA9IHVzZXIudmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YoU3RvcmFnZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJuYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIHVzZXJuYW1lKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdXNlci5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKCdZb3UgaGF2ZSB0byBjaG9vc2UgYSB1c2VybmFtZS4nKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coJ1NvcnJ5LCBubyBzdXBwb3J0IGZvciBXZWIgU3RvcmFnZS4nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBXYWl0aW5nIGZvciBlbnRlci1rZXkgdG8gYmUgcHJlc3NlZC5cbiAqL1xuQ2hhdC5wcm90b3R5cGUubGlzdGVuRm9yRW50ZXIgPSBmdW5jdGlvbihjaGF0RGl2KSB7XG4gICAgY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIExpc3RlbiBmb3IgRW50ZXIga2V5XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgYW5kIGVtcHR5IHRoZSB0ZXh0YXJlYVxuICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBDb25uZWN0IHRvIFdlYlNvY2tldCBzZXJ2ZXIuXG4gKi9cbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZGRyZXNzKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGFyZSBjb25uZWN0ZWQuJyk7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gdGhlIHNlcnZlci4nKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9LmJpbmQodGhpcykpO1xuXG59O1xuXG4vKipcbiAqIFNlbmQgbWVzc2FnZSBpbiBKU09OLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpIHtcblxuICAgIGxldCBkYXRhID0ge1xuICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgIHVzZXJuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcm5hbWUnKSxcbiAgICAgICAgLy9jaGFubmVsOiAnbXksIG5vdCBzbyBzZWNyZXQsIGNoYW5uZWwnLFxuICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICB9O1xuXG4gICAgLy8gRkVBVFVSRTogQ2hhdCB3b3JrcyBhcyBjb21tYW5kIGxpbmUgZm9yIFBlcnNvbmFsIFdlYiBEZXNrdG9wLlxuICAgIHRoaXMuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgICAgIGlmICh0ZXh0ID09PSAncGxheSBtZW1vcnknKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdtZW1vcnknKTtcbiAgICAgICAgICAgIHRoZVdpbmRvdy5vcGVuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGV4dCA9PT0gJ3N0YXJ0IGEgbmV3IGNoYXQnKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdjaGF0Jyk7XG4gICAgICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHQgPT09ICdzdGFydCB2aWRlbycpIHtcbiAgICAgICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgJ3ZpZGVvJyk7XG4gICAgICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHQgPT09ICdyZWFkIGFib3V0IHBhZ2UnKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICdhYm91dCcpO1xuICAgICAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFByaW50IG91dCByZWNpZXZlZCBtZXNzYWdlcy5cbiAqL1xuQ2hhdC5wcm90b3R5cGUucHJpbnRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpWzBdO1xuXG4gICAgbGV0IG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yQWxsKCcudGV4dCcpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhO1xuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbCgnLmF1dGhvcicpWzBdLnRleHRDb250ZW50ID0gbWVzc2FnZS51c2VybmFtZTtcblxuICAgIHRoaXMuY2hhdERpdi5xdWVyeVNlbGVjdG9yQWxsKCcubWVzc2FnZXMnKVswXS5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcbn07XG5cbi8qKlxuKiAgRXhwb3J0cy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgbWVtb3J5LlxuICpcbiAqIEBhdXRob3IgUHJvZmVzc29yUG90YXRpc1xuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5mdW5jdGlvbiBwbGF5TWVtb3J5KHJvd3MsIGNvbHMsIGNvbnRhaW5lcikge1xuXG4gICAgbGV0IGE7XG4gICAgbGV0IHRpbGVzID0gW107XG4gICAgbGV0IHR1cm4xO1xuICAgIGxldCB0dXJuMjtcbiAgICBsZXQgbGFzdFRpbGU7XG4gICAgbGV0IHBhaXJzID0gMDtcbiAgICBsZXQgdHJpZXMgPSAwO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCB0aGVUaW1lciA9IGZhbHNlO1xuICAgIGxldCB0b3RhbFRpbWUgPSAwO1xuXG4gICAgdGlsZXMgPSBnZXRQaWN0dXJlQXJyYXkocm93cywgY29scyk7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXIpIHx8IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW1vcnlDb250YWluZXInKTtcbiAgICBsZXQgdGVtcGxhdGVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbWVtb3J5Q29udGFpbmVyIHRlbXBsYXRlJylbMF0uY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgIGxldCBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LCBmYWxzZSk7XG4gICAgbGV0IHJlc3VsdFRhZyA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLCB0cnVlKTtcbiAgICBsZXQgdGltZXJUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIGlmICh0aGVUaW1lciA9PT0gZmFsc2UpIHtcbiAgICAgICAgc2Vjb25kcyA9IHNldEludGVydmFsKHRpbWVyLCAxMDAwKTtcbiAgICB9XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQocmVzdWx0VGFnKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodGltZXJUYWcpO1xuXG4gICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLCB0cnVlKTtcbiAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnJpY2tudW1iZXInLCBpbmRleCk7XG5cbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgICAgIGlmICgoaW5kZXgrMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxldCBpbWcgPSBldmVudC50YXJnZXQubm9kZU5hbWUgPT09ICdJTUcnID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnJpY2tudW1iZXInKSk7XG4gICAgICAgIHR1cm5Ccmljayh0aWxlc1tpbmRleF0sIGluZGV4LCBpbWcpO1xuICAgIH0pO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cblxuICAgIC8vIFRpbWVyLlxuICAgIGZ1bmN0aW9uIHRpbWVyKCkge1xuICAgICAgICB0aGVUaW1lciA9IHRydWU7XG4gICAgICAgIHRvdGFsVGltZSArPSAxO1xuICAgICAgICB0aW1lclRhZy50ZXh0Q29udGVudCA9ICdUaW1lcjogJyArIHRvdGFsVGltZTtcbiAgICB9XG5cbiAgICAvLyBUdXJuaW5nIGNsaWNrZWQgYnJpY2suXG4gICAgZnVuY3Rpb24gdHVybkJyaWNrKHRpbGUsIGluZGV4LCBpbWcpIHtcbiAgICAgICAgaWYgKHR1cm4yKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpbWcuc3JjID0gJ2ltYWdlLycgKyB0aWxlICsgJy5wbmcnO1xuXG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nO1xuICAgICAgICAgICAgbGFzdFRpbGUgPSB0aWxlO1xuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW1nID09PSB0dXJuMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJpZXMgKz0gMTtcblxuICAgICAgICAgICAgdHVybjIgPSBpbWc7XG5cbiAgICAgICAgICAgIGlmICh0aWxlID09PSBsYXN0VGlsZSkge1xuICAgICAgICAgICAgICAgIHBhaXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpcnMgPT09IChjb2xzKnJvd3MpLzIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoZVRpbWVyID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHNlY29uZHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlVGltZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aW1lclRhZy5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnV29uIG9uICcgKyB0cmllcyArICcgdHJpZXMgaW4gJyArIHRvdGFsVGltZSArICcgc2Vjb25kcy4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0VGFnLmFwcGVuZENoaWxkKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAzMDApO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5zcmMgPSAnaW1hZ2UvMC5wbmcnO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5zcmMgPSAnaW1hZ2UvMC5wbmcnO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuLy8gUmFuZG9taXNlIHBpY3R1cmUgYXJyYXkuXG5mdW5jdGlvbiBnZXRQaWN0dXJlQXJyYXkocm93cywgY29scykge1xuICAgIGxldCBpO1xuICAgIGxldCBhcnIgPSBbXTtcblxuICAgIGZvcihpID0gMTsgaSA8PSAocm93cypjb2xzKS8yOyBpICs9IDEpIHtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgIH1cblxuICAgIGZvcihsZXQgeCA9IGFyci5sZW5ndGggLSAxOyB4ID4gMDsgeCAtPSAxKSB7XG4gICAgICAgIGxldCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHggKyAxKSk7XG4gICAgICAgIGxldCB0ZW1wID0gYXJyW3hdO1xuICAgICAgICBhcnJbeF0gPSBhcnJbal07XG4gICAgICAgIGFycltqXSA9IHRlbXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn1cblxuLyoqXG4qICBFeHBvcnRzLlxuKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBsYXlNZW1vcnk6IHBsYXlNZW1vcnksXG4gICAgc2h1ZmZsZTogZ2V0UGljdHVyZUFycmF5XG59O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIHZpZGVvLlxuICpcbiAqIEBhdXRob3IgUHJvZmVzc29yUG90YXRpc1xuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5mdW5jdGlvbiBWaWRlbygpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdmlkZW8nKTtcbiAgICBsZXQgY29udGVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgbGV0IHZpZGVvID0gY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBsZXQgYnV0dG9uID0gY29udGVudC5sYXN0RWxlbWVudENoaWxkO1xuICAgIGxldCBjbGFzc0FyciA9IFsncGlua2lzaCcsICdncmF5c2NhbGUnLCAnc2VwaWEnLCAnYmx1cicsICdzYXR1cmF0ZScsICdodWVyb3RhdGUnLCAnaW52ZXJ0JywgJ2JyaWdodG5lc3MnLCAnY29udHJhc3QnLCAnJ107XG4gICAgbGV0IGNsaWNrQ291bnQgPSAwO1xuXG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYTtcblxuICAgIGlmIChuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG4gICAgICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoeyBhdWRpbzogdHJ1ZSwgdmlkZW86IHsgd2lkdGg6IDEyODAsIGhlaWdodDogNzIwIH0gfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgICAgIHZpZGVvLnNyY09iamVjdCA9IHN0cmVhbTtcbiAgICAgICAgICAgICAgICB2aWRlby5vbmxvYWRlZG1ldGFkYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgLy8gQ2hhbmdlIGZpbHRlciBvbiB2aWRlby5cbiAgICAgICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IGNsYXNzQXJyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2aWRlby5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xhc3NBcnJbY2xpY2tDb3VudF0pO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZSBmb2xsb3dpbmcgZXJyb3Igb2NjdXJyZWQ6ICcgKyBlcnIubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2dldFVzZXJNZWRpYSBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuKiAgRXhwb3J0cy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IFZpZGVvO1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIHdpbmRvdy5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuXG5sZXQgYVdpbmRvdywgaWQgPSAwLCBjb250ZW50LCBtZW1vcnkgPSByZXF1aXJlKCcuL01lbW9yeS5qcycpLCBDaGF0ID0gcmVxdWlyZSgnLi9DaGF0LmpzJyksXG5hYm91dCA9IHJlcXVpcmUoJy4vQWJvdXQuanMnKSwgdmlkZW8gPSByZXF1aXJlKCcuL1ZpZGVvLmpzJyk7XG5cbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIG5ldyB3aW5kb3cuXG4gKi9cbmZ1bmN0aW9uIG5ld1dpbmRvdyh3aWR0aCwgaGVpZ2h0LCBhcHBOYW1lKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuYXBwTmFtZSA9IGFwcE5hbWU7XG4gICAgdGhpcy53aW5kb3dQb3NUb3AgPSA3MDtcbiAgICB0aGlzLndpbmRvd1Bvc0xlZnQgPSAwO1xuXG4gICAgYVdpbmRvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dpbmRvdycpWzBdO1xuXG59XG5cbi8qKlxuICogQ2xvbmVzIGFuZCBvcGVucyBhcHAgd2luZG93LlxuICovXG5uZXdXaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY2xvbmUgPSBhV2luZG93LmNsb25lTm9kZSh0cnVlKTtcblxuICAgIGlmICh0aGlzLmFwcE5hbWUgPT09ICdtZW1vcnknKSB7XG4gICAgICAgIGxldCBnYW1lID0gbWVtb3J5LnBsYXlNZW1vcnkoNCwgNCk7XG4gICAgICAgIGNvbnRlbnQgPSBnYW1lLmxhc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgdGhpcy5zZXRMb2dvQW5kTmFtZSh0aGlzLmFwcE5hbWUsIGNsb25lKTtcbiAgICAgICAgdGhpcy5jbG9zZVcoY2xvbmUpO1xuXG4gICAgfSBlbHNlIGlmICh0aGlzLmFwcE5hbWUgPT09ICdjaGF0Jykge1xuICAgICAgICBsZXQgY2hhdCA9IG5ldyBDaGF0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjaGF0JykpO1xuICAgICAgICBjb250ZW50ID0gY2hhdC5jaGF0RGl2O1xuXG4gICAgICAgIHRoaXMuc2V0TG9nb0FuZE5hbWUodGhpcy5hcHBOYW1lLCBjbG9uZSk7XG4gICAgICAgIHRoaXMuY2xvc2VXKGNsb25lKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAnYWJvdXQnKSB7XG4gICAgICAgIGNvbnRlbnQgPSBhYm91dCgpO1xuXG4gICAgICAgIHRoaXMuc2V0TG9nb0FuZE5hbWUodGhpcy5hcHBOYW1lLCBjbG9uZSk7XG4gICAgICAgIHRoaXMuY2xvc2VXKGNsb25lKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAndmlkZW8nKSB7XG4gICAgICAgIGNvbnRlbnQgPSB2aWRlbygpO1xuXG4gICAgICAgIHRoaXMuc2V0TG9nb0FuZE5hbWUodGhpcy5hcHBOYW1lLCBjbG9uZSk7XG4gICAgICAgIHRoaXMuY2xvc2VXKGNsb25lKTtcbiAgICB9XG5cbiAgICBjbG9uZS5zZXRBdHRyaWJ1dGUoJ2lkJywgaWQpO1xuICAgIGlkICs9IDE7XG5cbiAgICBjbG9uZS5hcHBlbmRDaGlsZChjb250ZW50KTtcblxuICAgIHRoaXMucG9zaXRpb24oY2xvbmUpO1xuXG4gICAgYVdpbmRvdy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbn07XG5cbi8qKlxuICogU2V0cyBsb2dvIGFuZCBuYW1lIG9uIGFwcCB3aW5kb3cuXG4gKi9cbm5ld1dpbmRvdy5wcm90b3R5cGUuc2V0TG9nb0FuZE5hbWUgPSBmdW5jdGlvbihhcHBOYW1lLCB0aGVXaW5kb3cpIHtcbiAgICBsZXQgbG9nbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIGxvZ28uc2V0QXR0cmlidXRlKCdzcmMnLCAnaW1hZ2UvJyArIGFwcE5hbWUgKyAnLnBuZycpO1xuXG4gICAgbGV0IGgzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICBsZXQgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJyArIGFwcE5hbWUudG9VcHBlckNhc2UoKSk7XG5cbiAgICBoMy5hcHBlbmRDaGlsZChuYW1lKTtcblxuICAgIHRoZVdpbmRvdy5hcHBlbmRDaGlsZChsb2dvKTtcbiAgICB0aGVXaW5kb3cuYXBwZW5kQ2hpbGQoaDMpO1xufTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhIGNsb3NlYnV0dG9uIChYKSBhbmQgY2xvc2VzIGFwcCB3aW5kb3cuXG4gKi9cbm5ld1dpbmRvdy5wcm90b3R5cGUuY2xvc2VXID0gZnVuY3Rpb24oY2xvbmUpIHtcbiAgICBsZXQgY2xvc2VCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGNsb3NlQnV0dG9uLnNldEF0dHJpYnV0ZSgndHlwZScsICdidXR0b24nKTtcbiAgICBjbG9zZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ1gnKTtcbiAgICBjbG9zZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J1dHRvbicpO1xuXG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBhV2luZG93LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUpO1xuICAgIH0pO1xuXG4gICAgY2xvbmUuYXBwZW5kQ2hpbGQoY2xvc2VCdXR0b24pO1xufTtcblxuLyoqXG4gKiBQb3NpdGlvbnMgYXBwIHdpbmRvdyBvbiBvcGVuaW5nLlxuICovXG5uZXdXaW5kb3cucHJvdG90eXBlLnBvc2l0aW9uID0gZnVuY3Rpb24oY2xvbmUpIHtcblxuICAgIGNsb25lLnN0eWxlLmxlZnQgPSB0aGlzLndpbmRvd1Bvc0xlZnQgKyBwYXJzZUludChjbG9uZS5pZCArIDUpICsgJ3B4JztcbiAgICBjbG9uZS5zdHlsZS50b3AgPSB0aGlzLndpbmRvd1Bvc1RvcCArIHBhcnNlSW50KGNsb25lLmlkICsgNSkgKyAncHgnO1xuXG4gICAgY2xvbmUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdub01vdmUnKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRGb2N1cyhjbG9uZSk7XG4gICAgICAgICAgICB0aGlzLmRyYWcoY2xvbmUsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIEZvY3VzIGFuZCBwdXRzIGFwcCB3aW5kb3cgb24gdG9wLlxuICovXG5uZXdXaW5kb3cucHJvdG90eXBlLmdldEZvY3VzID0gZnVuY3Rpb24oY2xvbmUpIHtcbiAgICAvLyBHZXQgZm9jdXMgYW5kIHB1dCB3aW5kb3cgb24gdG9wXG4gICAgbGV0IHBhcmVudCA9IGNsb25lLnBhcmVudE5vZGU7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKGNsb25lKTtcbn07XG5cbi8qKlxuICogRHJhZyBhbmQgZHJvcCBhcHAgd2luZG93LlxuICovXG5uZXdXaW5kb3cucHJvdG90eXBlLmRyYWcgPSBmdW5jdGlvbihlbGVtZW50LCBldmVudCkge1xuICAgIGxldCBzdGFydFggPSBldmVudC5jbGllbnRYLCBzdGFydFkgPSBldmVudC5jbGllbnRZO1xuICAgIGxldCBvcmlnWCA9IGVsZW1lbnQub2Zmc2V0TGVmdCwgb3JpZ1kgPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsZXQgZGVsdGFYID0gc3RhcnRYIC0gb3JpZ1gsIGRlbHRhWSA9IHN0YXJ0WSAtIG9yaWdZO1xuXG4gICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZSwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZWxlYXNlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cblxuICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIC8vIE1vdmVzIGFwcCB3aW5kb3cuXG4gICAgZnVuY3Rpb24gbW92ZShlKSB7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTmFtZSA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgYWN0aXZlJztcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IChlLmNsaWVudFggLSBkZWx0YVgpICsgJ3B4JztcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSAoZS5jbGllbnRZIC0gZGVsdGFZKSArICdweCc7XG4gICAgfVxuXG4gICAgLy8gUmVsZWFzZXMgYXBwIHdpbmRvdy5cbiAgICBmdW5jdGlvbiByZWxlYXNlKGUpIHtcbiAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICBlID0gd2luZG93LmV2ZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NOYW1lID09PSAnd2luZG93IGFjdGl2ZScpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ3dpbmRvdyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHJlbGVhc2UsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiogIEV4cG9ydHMuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBuZXdXaW5kb3c7XG4iLCIvKipcbiAqIFN0YXJ0aW5nIHBvaW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxubGV0IHJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyLmpzJyk7XG5yb3V0ZXIoKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImFkZHJlc3NcIjogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgIFwia2V5XCI6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxufVxuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIHJvdXRlci5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuZnVuY3Rpb24gcm91dGVyKCkge1xuICAgIGxldCBtZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lbnUnKTtcbiAgICBsZXQgY2xpY2tDb3VudCA9IDA7XG4gICAgbGV0IGNsaWNrVGltZXI7XG5cbiAgICAgLyoqXG4gICAgICogU2luZ2xlIGNsaWNrIG9uIG1lbnUgb3BlbnMgbmV3IGFwcCB3aW5kb3cuXG4gICAgICogRG91YmxlIGNsaWNrIG9uIG1lbnUgY2xvc2VzIGFwcCB3aW5kb3cuXG4gICAgICovXG4gICAgbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGNsaWNrQ291bnQgKz0gMTtcblxuICAgICAgICBsZXQgYXBwID0gZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuaWQ7XG5cbiAgICAgICAgc3dpdGNoIChhcHApIHtcbiAgICAgICAgICAgIGNhc2UgJ21lbW9yeUFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnbWVtb3J5Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgnbWVtb3J5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2hhdEFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnY2hhdCcpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xpY2tDb3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBcHAoJ2NoYXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhYm91dEFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCdhYm91dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3N0cmVhbUFwcCc6XG4gICAgICAgICAgICAgICAgaWYgKGNsaWNrQ291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICBzdGFydEFwcCgndmlkZW8nKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCd2aWRlbycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlcyBuZXcgd2luZG93IGFuZCBvcGVucyBhcHAuXG4gICAgZnVuY3Rpb24gc3RhcnRBcHAoYXBwKSB7XG4gICAgICAgIGxldCBhV2luZG93ID0gcmVxdWlyZSgnLi9XaW5kb3cuanMnKTtcbiAgICAgICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCBhcHApO1xuICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZXMgYXBwIHdpbmRvd3MuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQXBwKGFwcCkge1xuICAgICAgICBsZXQgd2luZG93cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3dpbmRvdycpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgd2luZG93cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHdpbmRvd3NbaV0ubGFzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuY29udGFpbnMoYXBwKSkge1xuICAgICAgICAgICAgICAgIHdpbmRvd3NbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh3aW5kb3dzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4qICBFeHBvcnRzLlxuKi9cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl19
