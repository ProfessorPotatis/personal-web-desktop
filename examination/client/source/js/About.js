
function about() {
    let template = document.querySelector('#about');
    let content = document.importNode(template.content, true);

    return content;
}

module.exports = about;
