export const touch = {
    touches: {},

    init: function() {
        const canvas = document.getElementById('canvas');

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let t of e.changedTouches) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                this.touches[t.identifier] = {
                    id: t.identifier,
                    x: (t.clientX - rect.left) * scaleX,
                    y: (t.clientY - rect.top) * scaleY,
                    pressure: t.force || 1.0
                };
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let t of e.changedTouches) {
                if (this.touches[t.identifier]) {
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    this.touches[t.identifier].x = (t.clientX - rect.left) * scaleX;
                    this.touches[t.identifier].y = (t.clientY - rect.top) * scaleY;
                    this.touches[t.identifier].pressure = t.force || 1.0;
                }
            }
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (let t of e.changedTouches) {
                delete this.touches[t.identifier];
            }
        });

        canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            for (let t of e.changedTouches) {
                delete this.touches[t.identifier];
            }
        });
    },

    getPosition: function(id) {
        if (this.touches[id]) {
            return [this.touches[id].x, this.touches[id].y];
        }
        return null;
    },

    getPressure: function(id) {
        if (this.touches[id]) {
            return this.touches[id].pressure;
        }
        return 0;
    },

    getTouches: function() {
        return Object.keys(this.touches).map(id => parseInt(id));
    }
};

touch.init();