/**
 * Module for window.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */


let aWindow, id = 0, content, memory = require('./Memory.js'), Chat = require('./Chat.js'),
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

/**
*  Exports.
*/
module.exports = newWindow;
