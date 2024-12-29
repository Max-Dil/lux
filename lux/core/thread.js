export const thread = {
    threads: new Map(),
    channels: new Map(),

    newThread: function(code) {
        const blob = new Blob([`
            // Базовая реализация каналов для коммуникации
            const channels = new Map();
            
            function getChannel(name) {
                if (!channels.has(name)) {
                    channels.set(name, []);
                }
                return {
                    push: (value) => {
                        postMessage({ type: 'channel', channel: name, value: value });
                    },
                    pop: () => null, // В воркере pop не реализован
                    supply: () => null // В воркере supply не реализован
                };
            }

            // Глобальный объект для API
            self.lux = { thread: { getChannel } };

            // Обработчик сообщений от основного потока
            self.onmessage = function(e) {
                if (e.data.type === 'start') {
                    // Выполняем код с переданными аргументами
                    const args = e.data.args || [];
                    const fn = new Function('...args', e.data.code);
                    fn.apply(null, args);
                }
            };
        `, code].join('\n'), { type: 'text/javascript' });

        const worker = new Worker(URL.createObjectURL(blob));
        
        const threadObj = {
            worker: worker,
            
            start: function(...args) {
                worker.postMessage({ 
                    type: 'start',
                    code: code,
                    args: args 
                });
            },
            
            kill: function() {
                worker.terminate();
                this.threads.delete(worker);
            },
            
            isRunning: function() {
                return !worker.terminated;
            }
        };

        worker.onmessage = (e) => {
            if (e.data.type === 'channel') {
                const channel = this.getChannel(e.data.channel);
                channel.push(e.data.value);
            }
        };

        this.threads.set(worker, threadObj);
        return threadObj;
    },

    newChannel: function() {
        const channel = {
            queue: [],
            
            push: function(value) {
                this.queue.push(value);
            },
            
            pop: function() {
                return this.queue.shift() || null;
            },
            
            supply: function() {
                return this.queue.length;
            }
        };

        return channel;
    },

    getChannel: function(name) {
        if (!this.channels.has(name)) {
            this.channels.set(name, this.newChannel());
        }
        return this.channels.get(name);
    }
};