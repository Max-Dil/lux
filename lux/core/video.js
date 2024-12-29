export const video = {
    newVideoStream: async function(filename) {
        const video = document.createElement('video');
        video.src = filename;

        await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
        });

        return {
            video: video,
            
            play: function() {
                return video.play();
            },
            
            pause: function() {
                video.pause();
            },
            
            rewind: function() {
                video.currentTime = 0;
            },
            
            seek: function(time) {
                video.currentTime = time;
            },
            
            tell: function() {
                return video.currentTime;
            },
            
            isPlaying: function() {
                return !video.paused;
            },
            
            getDimensions: function() {
                return [video.videoWidth, video.videoHeight];
            },
            
            getWidth: function() {
                return video.videoWidth;
            },
            
            getHeight: function() {
                return video.videoHeight;
            },
            
            getDuration: function() {
                return video.duration;
            },
            
            setVolume: function(volume) {
                video.volume = Math.max(0, Math.min(1, volume));
            },
            
            getVolume: function() {
                return video.volume;
            },
            
            setLooping: function(loop) {
                video.loop = loop;
            },
            
            isLooping: function() {
                return video.loop;
            }
        };
    }
};