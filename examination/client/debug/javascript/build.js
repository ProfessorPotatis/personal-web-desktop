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
    let aWindow = require('./Window.js');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvQWJvdXQuanMiLCJjbGllbnQvc291cmNlL2pzL0NoYXQuanMiLCJjbGllbnQvc291cmNlL2pzL01lbW9yeS5qcyIsImNsaWVudC9zb3VyY2UvanMvVmlkZW8uanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9jb25maWcuanNvbiIsImNsaWVudC9zb3VyY2UvanMvcm91dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGZvciBhYm91dC5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuZnVuY3Rpb24gYWJvdXQoKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Fib3V0Jyk7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8qKlxuKiAgRXhwb3J0cy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGFib3V0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIGNoYXQuXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmxldCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qc29uJyk7XG5cbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIG5ldyBjaGF0LlxuICovXG5mdW5jdGlvbiBDaGF0KHRlbXBsYXRlKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIHRlbXBsYXRlID0gdGVtcGxhdGUgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NoYXQnKTtcblxuICAgIHRoaXMuY2hhdERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJykgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRVc2VybmFtZSh0ZW1wbGF0ZSwgdGhpcy5jaGF0RGl2KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jaGF0RGl2LmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgIHRoaXMuY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZSgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5Gb3JFbnRlcih0aGlzLmNoYXREaXYpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGlzdGVuRm9yRW50ZXIodGhpcy5jaGF0RGl2KTtcbiAgICB9XG59XG5cbi8qKlxuICogU2F2ZXMgdXNlcm5hbWUgaW4gbG9jYWxTdG9yYWdlLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZXRVc2VybmFtZSA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBjaGF0RGl2KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBsZXQgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5sYXN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbGV0IHVzZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBsZXQgYnV0dG9uID0gZm9ybS5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIGNoYXREaXYuYXBwZW5kQ2hpbGQodXNlcik7XG4gICAgICAgIGNoYXREaXYuYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICAgICAgY2hhdERpdi5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgIGNoYXREaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcblxuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCB1c2VybmFtZSA9IHVzZXIudmFsdWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YoU3RvcmFnZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJuYW1lICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VybmFtZScsIHVzZXJuYW1lKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdXNlci5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbnNvbGUubG9nKCdZb3UgaGF2ZSB0byBjaG9vc2UgYSB1c2VybmFtZS4nKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY29uc29sZS5sb2coJ1NvcnJ5LCBubyBzdXBwb3J0IGZvciBXZWIgU3RvcmFnZS4nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBXYWl0aW5nIGZvciBlbnRlci1rZXkgdG8gYmUgcHJlc3NlZC5cbiAqL1xuQ2hhdC5wcm90b3R5cGUubGlzdGVuRm9yRW50ZXIgPSBmdW5jdGlvbihjaGF0RGl2KSB7XG4gICAgY2hhdERpdi5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vIExpc3RlbiBmb3IgRW50ZXIga2V5XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgLy8gU2VuZCBhIG1lc3NhZ2UgYW5kIGVtcHR5IHRoZSB0ZXh0YXJlYVxuICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBDb25uZWN0IHRvIFdlYlNvY2tldCBzZXJ2ZXIuXG4gKi9cbkNoYXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5zb2NrZXQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZGRyZXNzKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnWW91IGFyZSBjb25uZWN0ZWQuJyk7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMuc29ja2V0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gdGhlIHNlcnZlci4nKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9LmJpbmQodGhpcykpO1xuXG59O1xuXG4vKipcbiAqIFNlbmQgbWVzc2FnZSBpbiBKU09OLlxuICovXG5DaGF0LnByb3RvdHlwZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICBsZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG5cbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICB1c2VybmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXJuYW1lJyksXG4gICAgICAgIC8vY2hhbm5lbDogJ215LCBub3Qgc28gc2VjcmV0LCBjaGFubmVsJyxcbiAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgfTtcblxuICAgIC8vIEZFQVRVUkU6IENoYXQgd29ya3MgYXMgY29tbWFuZCBsaW5lIGZvciBQZXJzb25hbCBXZWIgRGVza3RvcC5cbiAgICB0aGlzLmNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKHNvY2tldCkge1xuICAgICAgICBpZiAodGV4dCA9PT0gJ3BsYXkgbWVtb3J5Jykge1xuICAgICAgICAgICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCAnbWVtb3J5Jyk7XG4gICAgICAgICAgICB0aGVXaW5kb3cub3BlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHQgPT09ICdzdGFydCBhIG5ldyBjaGF0Jykge1xuICAgICAgICAgICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCAnY2hhdCcpO1xuICAgICAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0ID09PSAnc3RhcnQgdmlkZW8nKSB7XG4gICAgICAgICAgICBsZXQgdGhlV2luZG93ID0gbmV3IGFXaW5kb3coNDAwLCA0MDAsICd2aWRlbycpO1xuICAgICAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0ID09PSAncmVhZCBhYm91dCBwYWdlJykge1xuICAgICAgICAgICAgbGV0IHRoZVdpbmRvdyA9IG5ldyBhV2luZG93KDQwMCwgNDAwLCAnYWJvdXQnKTtcbiAgICAgICAgICAgIHRoZVdpbmRvdy5vcGVuKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQcmludCBvdXQgcmVjaWV2ZWQgbWVzc2FnZXMuXG4gKi9cbkNoYXQucHJvdG90eXBlLnByaW50TWVzc2FnZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKVswXTtcblxuICAgIGxldCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvckFsbCgnLnRleHQnKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YTtcbiAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRob3InKVswXS50ZXh0Q29udGVudCA9IG1lc3NhZ2UudXNlcm5hbWU7XG5cbiAgICB0aGlzLmNoYXREaXYucXVlcnlTZWxlY3RvckFsbCgnLm1lc3NhZ2VzJylbMF0uYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XG59O1xuXG4vKipcbiogIEV4cG9ydHMuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuIiwiLyoqXG4gKiBNb2R1bGUgZm9yIG1lbW9yeS5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuZnVuY3Rpb24gcGxheU1lbW9yeShyb3dzLCBjb2xzLCBjb250YWluZXIpIHtcblxuICAgIGxldCBhO1xuICAgIGxldCB0aWxlcyA9IFtdO1xuICAgIGxldCB0dXJuMTtcbiAgICBsZXQgdHVybjI7XG4gICAgbGV0IGxhc3RUaWxlO1xuICAgIGxldCBwYWlycyA9IDA7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICBsZXQgc2Vjb25kcztcbiAgICBsZXQgdGhlVGltZXIgPSBmYWxzZTtcbiAgICBsZXQgdG90YWxUaW1lID0gMDtcblxuICAgIHRpbGVzID0gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKSB8fCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVtb3J5Q29udGFpbmVyJyk7XG4gICAgbGV0IHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI21lbW9yeUNvbnRhaW5lciB0ZW1wbGF0ZScpWzBdLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdiwgZmFsc2UpO1xuICAgIGxldCByZXN1bHRUYWcgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgbGV0IHRpbWVyVGFnID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZURpdi5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBpZiAodGhlVGltZXIgPT09IGZhbHNlKSB7XG4gICAgICAgIHNlY29uZHMgPSBzZXRJbnRlcnZhbCh0aW1lciwgMTAwMCk7XG4gICAgfVxuXG4gICAgZGl2LmFwcGVuZENoaWxkKHJlc3VsdFRhZyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHRpbWVyVGFnKTtcblxuICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVEaXYuZmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZywgdHJ1ZSk7XG4gICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuc2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJywgaW5kZXgpO1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICBpZiAoKGluZGV4KzEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkaXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSAnSU1HJyA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWJyaWNrbnVtYmVyJykpO1xuICAgICAgICB0dXJuQnJpY2sodGlsZXNbaW5kZXhdLCBpbmRleCwgaW1nKTtcbiAgICB9KTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG5cbiAgICAvLyBUaW1lci5cbiAgICBmdW5jdGlvbiB0aW1lcigpIHtcbiAgICAgICAgdGhlVGltZXIgPSB0cnVlO1xuICAgICAgICB0b3RhbFRpbWUgKz0gMTtcbiAgICAgICAgdGltZXJUYWcudGV4dENvbnRlbnQgPSAnVGltZXI6ICcgKyB0b3RhbFRpbWU7XG4gICAgfVxuXG4gICAgLy8gVHVybmluZyBjbGlja2VkIGJyaWNrLlxuICAgIGZ1bmN0aW9uIHR1cm5Ccmljayh0aWxlLCBpbmRleCwgaW1nKSB7XG4gICAgICAgIGlmICh0dXJuMikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaW1nLnNyYyA9ICdpbWFnZS8nICsgdGlsZSArICcucG5nJztcblxuICAgICAgICBpZiAoIXR1cm4xKSB7XG4gICAgICAgICAgICB0dXJuMSA9IGltZztcbiAgICAgICAgICAgIGxhc3RUaWxlID0gdGlsZTtcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyaWVzICs9IDE7XG5cbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuXG4gICAgICAgICAgICBpZiAodGlsZSA9PT0gbGFzdFRpbGUpIHtcbiAgICAgICAgICAgICAgICBwYWlycyArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhaXJzID09PSAoY29scypyb3dzKS8yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGVUaW1lciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzZWNvbmRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVRpbWVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGltZXJUYWcuY2xhc3NMaXN0LmFkZCgncmVtb3ZlZCcpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1dvbiBvbiAnICsgdHJpZXMgKyAnIHRyaWVzIGluICcgKyB0b3RhbFRpbWUgKyAnIHNlY29uZHMuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFRhZy5hcHBlbmRDaGlsZChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3JlbW92ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdyZW1vdmVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgMzAwKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gJ2ltYWdlLzAucG5nJztcbiAgICAgICAgICAgICAgICAgICAgdHVybjIuc3JjID0gJ2ltYWdlLzAucG5nJztcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb250YWluZXI7XG59XG5cbi8vIFJhbmRvbWlzZSBwaWN0dXJlIGFycmF5LlxuZnVuY3Rpb24gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpIHtcbiAgICBsZXQgaTtcbiAgICBsZXQgYXJyID0gW107XG5cbiAgICBmb3IoaSA9IDE7IGkgPD0gKHJvd3MqY29scykvMjsgaSArPSAxKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICB9XG5cbiAgICBmb3IobGV0IHggPSBhcnIubGVuZ3RoIC0gMTsgeCA+IDA7IHggLT0gMSkge1xuICAgICAgICBsZXQgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh4ICsgMSkpO1xuICAgICAgICBsZXQgdGVtcCA9IGFyclt4XTtcbiAgICAgICAgYXJyW3hdID0gYXJyW2pdO1xuICAgICAgICBhcnJbal0gPSB0ZW1wO1xuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59XG5cbi8qKlxuKiAgRXhwb3J0cy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwbGF5TWVtb3J5OiBwbGF5TWVtb3J5LFxuICAgIHNodWZmbGU6IGdldFBpY3R1cmVBcnJheVxufTtcbiIsIi8qKlxuICogTW9kdWxlIGZvciB2aWRlby5cbiAqXG4gKiBAYXV0aG9yIFByb2Zlc3NvclBvdGF0aXNcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKi9cblxuZnVuY3Rpb24gVmlkZW8oKSB7XG4gICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3ZpZGVvJyk7XG4gICAgbGV0IGNvbnRlbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGxldCB2aWRlbyA9IGNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgbGV0IGJ1dHRvbiA9IGNvbnRlbnQubGFzdEVsZW1lbnRDaGlsZDtcbiAgICBsZXQgY2xhc3NBcnIgPSBbJ3Bpbmtpc2gnLCAnZ3JheXNjYWxlJywgJ3NlcGlhJywgJ2JsdXInLCAnc2F0dXJhdGUnLCAnaHVlcm90YXRlJywgJ2ludmVydCcsICdicmlnaHRuZXNzJywgJ2NvbnRyYXN0JywgJyddO1xuICAgIGxldCBjbGlja0NvdW50ID0gMDtcblxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWE7XG5cbiAgICBpZiAobmF2aWdhdG9yLmdldFVzZXJNZWRpYSkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHsgYXVkaW86IHRydWUsIHZpZGVvOiB7IHdpZHRoOiAxMjgwLCBoZWlnaHQ6IDcyMCB9IH0sXG4gICAgICAgICAgICBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgICAgICB2aWRlby5zcmNPYmplY3QgPSBzdHJlYW07XG4gICAgICAgICAgICAgICAgdmlkZW8ub25sb2FkZWRtZXRhZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIENoYW5nZSBmaWx0ZXIgb24gdmlkZW8uXG4gICAgICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSBjbGFzc0Fyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmlkZW8uc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzQXJyW2NsaWNrQ291bnRdKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCArPSAxO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGUgZm9sbG93aW5nIGVycm9yIG9jY3VycmVkOiAnICsgZXJyLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdnZXRVc2VyTWVkaWEgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZW50O1xufVxuXG4vKipcbiogIEV4cG9ydHMuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBWaWRlbztcbiIsIi8qKlxuICogTW9kdWxlIGZvciB3aW5kb3cuXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cblxubGV0IGFXaW5kb3csIGlkID0gMCwgY29udGVudCwgbWVtb3J5ID0gcmVxdWlyZSgnLi9NZW1vcnkuanMnKSwgQ2hhdCA9IHJlcXVpcmUoJy4vQ2hhdC5qcycpLFxuYWJvdXQgPSByZXF1aXJlKCcuL0Fib3V0LmpzJyksIHZpZGVvID0gcmVxdWlyZSgnLi9WaWRlby5qcycpO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIGZvciBuZXcgd2luZG93LlxuICovXG5mdW5jdGlvbiBuZXdXaW5kb3cod2lkdGgsIGhlaWdodCwgYXBwTmFtZSkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmFwcE5hbWUgPSBhcHBOYW1lO1xuICAgIHRoaXMud2luZG93UG9zVG9wID0gNzA7XG4gICAgdGhpcy53aW5kb3dQb3NMZWZ0ID0gMDtcblxuICAgIGFXaW5kb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3aW5kb3cnKVswXTtcblxufVxuXG4vKipcbiAqIENsb25lcyBhbmQgb3BlbnMgYXBwIHdpbmRvdy5cbiAqL1xubmV3V2luZG93LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNsb25lID0gYVdpbmRvdy5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICBpZiAodGhpcy5hcHBOYW1lID09PSAnbWVtb3J5Jykge1xuICAgICAgICBsZXQgZ2FtZSA9IG1lbW9yeS5wbGF5TWVtb3J5KDQsIDQpO1xuICAgICAgICBjb250ZW50ID0gZ2FtZS5sYXN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIHRoaXMuc2V0TG9nb0FuZE5hbWUodGhpcy5hcHBOYW1lLCBjbG9uZSk7XG4gICAgICAgIHRoaXMuY2xvc2VXKGNsb25lKTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5hcHBOYW1lID09PSAnY2hhdCcpIHtcbiAgICAgICAgbGV0IGNoYXQgPSBuZXcgQ2hhdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2hhdCcpKTtcbiAgICAgICAgY29udGVudCA9IGNoYXQuY2hhdERpdjtcblxuICAgICAgICB0aGlzLnNldExvZ29BbmROYW1lKHRoaXMuYXBwTmFtZSwgY2xvbmUpO1xuICAgICAgICB0aGlzLmNsb3NlVyhjbG9uZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ2Fib3V0Jykge1xuICAgICAgICBjb250ZW50ID0gYWJvdXQoKTtcblxuICAgICAgICB0aGlzLnNldExvZ29BbmROYW1lKHRoaXMuYXBwTmFtZSwgY2xvbmUpO1xuICAgICAgICB0aGlzLmNsb3NlVyhjbG9uZSk7XG5cbiAgICB9IGVsc2UgaWYgKHRoaXMuYXBwTmFtZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICBjb250ZW50ID0gdmlkZW8oKTtcblxuICAgICAgICB0aGlzLnNldExvZ29BbmROYW1lKHRoaXMuYXBwTmFtZSwgY2xvbmUpO1xuICAgICAgICB0aGlzLmNsb3NlVyhjbG9uZSk7XG4gICAgfVxuXG4gICAgY2xvbmUuc2V0QXR0cmlidXRlKCdpZCcsIGlkKTtcbiAgICBpZCArPSAxO1xuXG4gICAgY2xvbmUuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cbiAgICB0aGlzLnBvc2l0aW9uKGNsb25lKTtcblxuICAgIGFXaW5kb3cucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChjbG9uZSk7XG59O1xuXG4vKipcbiAqIFNldHMgbG9nbyBhbmQgbmFtZSBvbiBhcHAgd2luZG93LlxuICovXG5uZXdXaW5kb3cucHJvdG90eXBlLnNldExvZ29BbmROYW1lID0gZnVuY3Rpb24oYXBwTmFtZSwgdGhlV2luZG93KSB7XG4gICAgbGV0IGxvZ28gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICBsb2dvLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2ltYWdlLycgKyBhcHBOYW1lICsgJy5wbmcnKTtcblxuICAgIGxldCBoMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgbGV0IG5hbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnICcgKyBhcHBOYW1lLnRvVXBwZXJDYXNlKCkpO1xuXG4gICAgaDMuYXBwZW5kQ2hpbGQobmFtZSk7XG5cbiAgICB0aGVXaW5kb3cuYXBwZW5kQ2hpbGQobG9nbyk7XG4gICAgdGhlV2luZG93LmFwcGVuZENoaWxkKGgzKTtcbn07XG5cbi8qKlxuICogQXR0YWNoZXMgYSBjbG9zZWJ1dHRvbiAoWCkgYW5kIGNsb3NlcyBhcHAgd2luZG93LlxuICovXG5uZXdXaW5kb3cucHJvdG90eXBlLmNsb3NlVyA9IGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgbGV0IGNsb3NlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBjbG9zZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnYnV0dG9uJyk7XG4gICAgY2xvc2VCdXR0b24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICdYJyk7XG4gICAgY2xvc2VCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdidXR0b24nKTtcblxuICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgYVdpbmRvdy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGV2ZW50LnRhcmdldC5wYXJlbnROb2RlKTtcbiAgICB9KTtcblxuICAgIGNsb25lLmFwcGVuZENoaWxkKGNsb3NlQnV0dG9uKTtcbn07XG5cbi8qKlxuICogUG9zaXRpb25zIGFwcCB3aW5kb3cgb24gb3BlbmluZy5cbiAqL1xubmV3V2luZG93LnByb3RvdHlwZS5wb3NpdGlvbiA9IGZ1bmN0aW9uKGNsb25lKSB7XG5cbiAgICBjbG9uZS5zdHlsZS5sZWZ0ID0gdGhpcy53aW5kb3dQb3NMZWZ0ICsgcGFyc2VJbnQoY2xvbmUuaWQgKyA1KSArICdweCc7XG4gICAgY2xvbmUuc3R5bGUudG9wID0gdGhpcy53aW5kb3dQb3NUb3AgKyBwYXJzZUludChjbG9uZS5pZCArIDUpICsgJ3B4JztcblxuICAgIGNsb25lLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbm9Nb3ZlJykpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0Rm9jdXMoY2xvbmUpO1xuICAgICAgICAgICAgdGhpcy5kcmFnKGNsb25lLCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBGb2N1cyBhbmQgcHV0cyBhcHAgd2luZG93IG9uIHRvcC5cbiAqL1xubmV3V2luZG93LnByb3RvdHlwZS5nZXRGb2N1cyA9IGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgLy8gR2V0IGZvY3VzIGFuZCBwdXQgd2luZG93IG9uIHRvcFxuICAgIGxldCBwYXJlbnQgPSBjbG9uZS5wYXJlbnROb2RlO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjbG9uZSk7XG59O1xuXG4vKipcbiAqIERyYWcgYW5kIGRyb3AgYXBwIHdpbmRvdy5cbiAqL1xubmV3V2luZG93LnByb3RvdHlwZS5kcmFnID0gZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQpIHtcbiAgICBsZXQgc3RhcnRYID0gZXZlbnQuY2xpZW50WCwgc3RhcnRZID0gZXZlbnQuY2xpZW50WTtcbiAgICBsZXQgb3JpZ1ggPSBlbGVtZW50Lm9mZnNldExlZnQsIG9yaWdZID0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGV0IGRlbHRhWCA9IHN0YXJ0WCAtIG9yaWdYLCBkZWx0YVkgPSBzdGFydFkgLSBvcmlnWTtcblxuICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmUsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgcmVsZWFzZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICAvLyBNb3ZlcyBhcHAgd2luZG93LlxuICAgIGZ1bmN0aW9uIG1vdmUoZSkge1xuICAgICAgICBpZiAoIWUpIHtcbiAgICAgICAgICAgIGUgPSB3aW5kb3cuZXZlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc05hbWUgPT09ICd3aW5kb3cnKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSArPSAnIGFjdGl2ZSc7XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSAoZS5jbGllbnRYIC0gZGVsdGFYKSArICdweCc7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gKGUuY2xpZW50WSAtIGRlbHRhWSkgKyAncHgnO1xuICAgIH1cblxuICAgIC8vIFJlbGVhc2VzIGFwcCB3aW5kb3cuXG4gICAgZnVuY3Rpb24gcmVsZWFzZShlKSB7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTmFtZSA9PT0gJ3dpbmRvdyBhY3RpdmUnKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICd3aW5kb3cnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCByZWxlYXNlLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmUsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4qICBFeHBvcnRzLlxuKi9cbm1vZHVsZS5leHBvcnRzID0gbmV3V2luZG93O1xuIiwiLyoqXG4gKiBTdGFydGluZyBwb2ludCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmxldCByb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlci5qcycpO1xucm91dGVyKCk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJhZGRyZXNzXCI6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcbiAgICBcImtleVwiOiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbn1cbiIsIi8qKlxuICogTW9kdWxlIGZvciByb3V0ZXIuXG4gKlxuICogQGF1dGhvciBQcm9mZXNzb3JQb3RhdGlzXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmZ1bmN0aW9uIHJvdXRlcigpIHtcbiAgICBsZXQgbWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZW51Jyk7XG4gICAgbGV0IGNsaWNrQ291bnQgPSAwO1xuICAgIGxldCBjbGlja1RpbWVyO1xuXG4gICAgIC8qKlxuICAgICAqIFNpbmdsZSBjbGljayBvbiBtZW51IG9wZW5zIG5ldyBhcHAgd2luZG93LlxuICAgICAqIERvdWJsZSBjbGljayBvbiBtZW51IGNsb3NlcyBhcHAgd2luZG93LlxuICAgICAqL1xuICAgIG1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBjbGlja0NvdW50ICs9IDE7XG5cbiAgICAgICAgbGV0IGFwcCA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmlkO1xuXG4gICAgICAgIHN3aXRjaCAoYXBwKSB7XG4gICAgICAgICAgICBjYXNlICdtZW1vcnlBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ21lbW9yeScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2xpY2tDb3VudCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2xpY2tUaW1lcik7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVBcHAoJ21lbW9yeScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NoYXRBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ2NoYXQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsaWNrQ291bnQgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNsaWNrVGltZXIpO1xuICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXBwKCdjaGF0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWJvdXRBcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ2Fib3V0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgnYWJvdXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzdHJlYW1BcHAnOlxuICAgICAgICAgICAgICAgIGlmIChjbGlja0NvdW50ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWNrVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICBjbGlja0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRBcHAoJ3ZpZGVvJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlja0NvdW50ID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgY2xpY2tDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUFwcCgndmlkZW8nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZXMgbmV3IHdpbmRvdyBhbmQgb3BlbnMgYXBwLlxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKGFwcCkge1xuICAgICAgICBsZXQgYVdpbmRvdyA9IHJlcXVpcmUoJy4vV2luZG93LmpzJyk7XG4gICAgICAgIGxldCB0aGVXaW5kb3cgPSBuZXcgYVdpbmRvdyg0MDAsIDQwMCwgYXBwKTtcbiAgICAgICAgdGhlV2luZG93Lm9wZW4oKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmVzIGFwcCB3aW5kb3dzLlxuICAgIGZ1bmN0aW9uIHJlbW92ZUFwcChhcHApIHtcbiAgICAgICAgbGV0IHdpbmRvd3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3aW5kb3cnKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHdpbmRvd3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh3aW5kb3dzW2ldLmxhc3RFbGVtZW50Q2hpbGQuY2xhc3NMaXN0LmNvbnRhaW5zKGFwcCkpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQod2luZG93c1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuKiAgRXhwb3J0cy5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjtcbiJdfQ==
