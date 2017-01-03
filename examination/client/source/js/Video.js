
function Video() {
    let template = document.querySelector('#video');
    let content = document.importNode(template.content.firstElementChild, true);
    let video = content.firstElementChild;
    console.log(content);
    console.log(video);

    if (navigator.getUserMedia) {
        console.log('Good to go!');
        let errorCallback = function(e) {
            console.log('Rejected!', e);
        };

    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;


    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: true, video: true}, function(stream) {
        this.video.src = window.URL.createObjectURL(stream);
        }, errorCallback);
    } else {
        this.video.src = 'somevideo.webm'; // fallback.
    }

    } else {
        alert('getUserMedia() is not supported in your browser');
    }
}


Video.prototype.hasGetUserMedia = function() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
};


module.exports = Video;
