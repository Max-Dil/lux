export const system = {
    clipboardText: '',

    getClipboardText: async function() {
        try {
            return await navigator.clipboard.readText();
        } catch (err) {
            console.warn('Не удалось прочитать буфер обмена:', err);
            return '';
        }
    },

    setClipboardText: async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Не удалось записать в буфер обмена:', err);
            return false;
        }
    },

    getOS: function() {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('win')) return 'Windows';
        if (platform.includes('mac')) return 'OS X';
        if (platform.includes('linux')) return 'Linux';
        if (platform.includes('iphone') || platform.includes('ipad')) return 'iOS';
        if (platform.includes('android')) return 'Android';
        return 'Unknown';
    },

    getPowerInfo: function() {
        if ('getBattery' in navigator) {
            return navigator.getBattery().then(battery => {
                const state = battery.charging ? 'charging' : 'battery';
                const percent = Math.round(battery.level * 100);
                const seconds = battery.charging ? 
                    (battery.chargingTime !== Infinity ? battery.chargingTime : undefined) :
                    (battery.dischargingTime !== Infinity ? battery.dischargingTime : undefined);
                
                return {
                    state: state,
                    percent: percent,
                    seconds: seconds
                };
            });
        }
        return Promise.resolve({
            state: 'unknown',
            percent: 100,
            seconds: undefined
        });
    },

    getProcessorCount: function() {
        return navigator.hardwareConcurrency || 1;
    },

    openURL: function(url) {
        try {
            window.open(url, '_blank');
            return true;
        } catch (err) {
            console.warn('Не удалось открыть URL:', err);
            return false;
        }
    },

    vibrate: function(pattern) {
        if (!navigator.vibrate) {
            return false;
        }

        if (Array.isArray(pattern)) {
            return navigator.vibrate(pattern);
        } else if (typeof pattern === 'number') {
            return navigator.vibrate([pattern]);
        }
        return false;
    }
};