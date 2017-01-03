
function Video() {
    let template = document.querySelector('#video');
    let content = document.importNode(template.content.firstElementChild, true);
    let video = content.firstElementChild;
    console.log(content);
    console.log(video);


    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true, video: true },
            function(stream) {
                video.srcObject = stream;
                video.onloadedmetadata = function() {
                    video.play();
                };
            },
            function(err) {
                console.log('The following error occurred: ' + err.name);
            }
        );
    } else {
        console.log('getUserMedia not supported');
    }




    /*function hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
        console.log('Good to go!');


    } else {
        alert('getUserMedia() is not supported in your browser');
    }*/


    return content;

}


module.exports = Video;
