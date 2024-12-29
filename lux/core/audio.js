export const audio = {
    sources: new Map(),
    effects: new Map(),
    masterVolume: 1,
    audioContext: null,
    listener: null,

    init: function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.listener = this.audioContext.listener;

            if (this.listener.positionX) {
                this.listener.positionX.value = 0;
                this.listener.positionY.value = 0;
                this.listener.positionZ.value = 0;
            } else {
                this.listener.setPosition(0, 0, 0);
            }
            
            if (this.listener.forwardX) {
                this.listener.forwardX.value = 0;
                this.listener.forwardY.value = 0;
                this.listener.forwardZ.value = -1;
                this.listener.upX.value = 0;
                this.listener.upY.value = 1;
                this.listener.upZ.value = 0;
            } else {
                this.listener.setOrientation(0, 0, -1, 0, 1, 0);
            }
        } catch (err) {
            console.error('Ошибка инициализации AudioContext:', err);
        }
    },

    async newSource(filepath, type = 'static') {
        try {
            const response = await fetch(filepath);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            const source = {
                buffer: audioBuffer,
                gainNode: this.audioContext.createGain(),
                type: type,
                volume: 1,
                pitch: 1,
                isLooping: false,
                bufferSource: null,
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                
                play: function() {
                    if (this.bufferSource) {
                        this.bufferSource.stop();
                    }
                    
                    this.bufferSource = audio.audioContext.createBufferSource();
                    this.bufferSource.buffer = this.buffer;
                    this.bufferSource.loop = this.isLooping;
                    this.bufferSource.playbackRate.value = this.pitch;
                    
                    this.bufferSource.connect(this.gainNode);
                    if (this.panner) {
                        this.gainNode.connect(this.panner);
                        this.panner.connect(audio.audioContext.destination);
                    } else {
                        this.gainNode.connect(audio.audioContext.destination);
                    }
                    
                    this.bufferSource.start(0);
                },
                
                pause: function() {
                    if (this.bufferSource) {
                        this.bufferSource.stop();
                    }
                },
                
                stop: function() {
                    if (this.bufferSource) {
                        this.bufferSource.stop();
                        this.bufferSource = null;
                    }
                },
                
                setVolume: function(volume) {
                    this.volume = volume;
                    this.gainNode.gain.value = volume * audio.masterVolume;
                },
                
                setPitch: function(pitch) {
                    this.pitch = pitch;
                    if (this.bufferSource) {
                        this.bufferSource.playbackRate.value = pitch;
                    }
                },
                
                setLooping: function(loop) {
                    this.isLooping = loop;
                    if (this.bufferSource) {
                        this.bufferSource.loop = loop;
                    }
                },

                setPosition: function(x, y, z = 0) {
                    this.position = { x, y, z };
                    if (this.panner) {
                        this.panner.positionX.value = x;
                        this.panner.positionY.value = y;
                        this.panner.positionZ.value = z;
                    }
                },

                setVelocity: function(x, y, z = 0) {
                    this.velocity = { x, y, z };
                    if (this.panner) {
                        this.panner.velocityX.value = x;
                        this.panner.velocityY.value = y;
                        this.panner.velocityZ.value = z;
                    }
                },

                setRelative: function(relative) {
                    if (!this.panner) {
                        this.panner = audio.audioContext.createPanner();
                        this.gainNode.connect(this.panner);
                        this.panner.connect(audio.audioContext.destination);
                    }
                    this.panner.distanceModel = relative ? 'linear' : 'inverse';
                }
            };
            
            this.sources.set(source, true);
            return source;
            
        } catch (err) {
            console.error('Ошибка создания источника звука:', err);
            return null;
        }
    },

    setVolume: function(volume) {
        this.masterVolume = volume;
        for (const source of this.sources.keys()) {
            source.setVolume(source.volume);
        }
    },

    getVolume: function() {
        return this.masterVolume;
    },

    play: function(source) {
        if (source && this.sources.has(source)) {
            source.play();
        }
    },

    pause: function(source) {
        if (source) {
            if (this.sources.has(source)) {
                source.pause();
            }
        } else {
            for (const src of this.sources.keys()) {
                src.pause();
            }
        }
    },

    stop: function(source) {
        if (source) {
            if (this.sources.has(source)) {
                source.stop();
            }
        } else {
            for (const src of this.sources.keys()) {
                src.stop();
            }
        }
    },

    setOrientation: function(fx, fy, fz, ux, uy, uz) {
        if (this.listener.forwardX) {
            this.listener.forwardX.value = fx;
            this.listener.forwardY.value = fy;
            this.listener.forwardZ.value = fz;
            this.listener.upX.value = ux;
            this.listener.upY.value = uy;
            this.listener.upZ.value = uz;
        } else {
            this.listener.setOrientation(fx, fy, fz, ux, uy, uz);
        }
    },

    setPosition: function(x, y, z = 0) {
        if (this.listener.positionX) {
            this.listener.positionX.value = x;
            this.listener.positionY.value = y;
            this.listener.positionZ.value = z;
        } else {
            this.listener.setPosition(x, y, z);
        }
    },

    getActiveSourceCount: function() {
        return this.sources.size;
    }
};

audio.init();