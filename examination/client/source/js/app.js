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
