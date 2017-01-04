
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
