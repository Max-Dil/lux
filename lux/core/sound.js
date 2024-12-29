export const sound = {
    async newDecoder(filepath) {
        try {
            const response = await fetch(filepath);
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            return {
                audioBuffer,
                audioContext,
                getDuration() {
                    return audioBuffer.duration;
                },
                getBitDepth() {
                    return 16;
                },
                getChannelCount() {
                    return audioBuffer.numberOfChannels;
                },
                getSampleRate() {
                    return audioBuffer.sampleRate;
                }
            };
        } catch (error) {
            console.error('Ошибка при декодировании аудио:', error);
            throw error;
        }
    },

    async newSoundData(source) {
        if (typeof source === 'string') {
            const decoder = await this.newDecoder(source);
            return {
                audioBuffer: decoder.audioBuffer,
                audioContext: decoder.audioContext,
                play() {
                    const source = this.audioContext.createBufferSource();
                    source.buffer = this.audioBuffer;
                    source.connect(this.audioContext.destination);
                    source.start(0);
                    return source;
                },
                getDuration() {
                    return this.audioBuffer.duration;
                },
                getChannels() {
                    return this.audioBuffer.numberOfChannels;
                },
                getSampleRate() {
                    return this.audioBuffer.sampleRate;
                }
            };
        } else {
            throw new Error('Неподдерживаемый тип источника звука');
        }
    }
};