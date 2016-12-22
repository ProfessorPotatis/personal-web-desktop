/**
 * Starting point of the application.
 *
 * @author ProfessorPotatis
 * @version 1.0.0
 */

/*let memory = require('./Memory.js');

memory.playMemory(2, 2, 'memoryContainer');*/

let Chat = require('./Chat.js');

let chat = new Chat(document.querySelector('#chatContainer'));
