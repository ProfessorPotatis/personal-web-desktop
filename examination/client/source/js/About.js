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
