export const filesystem = {
    FileType: {
        FILE: 'file',
        DIRECTORY: 'directory',
        SYMLINK: 'symlink',
        OTHER: 'other'
    },

    FileMode: {
        READ: 'read',
        WRITE: 'write',
        APPEND: 'append'
    },

    identity: null,
    mountPoints: new Map(),

    init: function(identity) {
        this.identity = identity;
        this.mountPoints.clear();
    },

    async read(filepath, type = 'string') {
        try {
            const response = await fetch(filepath);
            if (!response.ok) throw new Error('File not found');

            switch(type) {
                case 'string':
                    return await response.text();
                case 'data':
                    return await response.arrayBuffer();
                case 'json':
                    return await response.json();
                default:
                    throw new Error('Unsupported read type');
            }
        } catch (err) {
            console.error('Error reading file:', err);
            return null;
        }
    },

    async write(filepath, data) {
        try {
            localStorage.setItem(this.getStorageKey(filepath), data);
            return true;
        } catch (err) {
            console.error('Error writing file:', err);
            return false;
        }
    },

    async append(filepath, data) {
        try {
            const existing = localStorage.getItem(this.getStorageKey(filepath)) || '';
            localStorage.setItem(this.getStorageKey(filepath), existing + data);
            return true;
        } catch (err) {
            console.error('Error appending to file:', err);
            return false;
        }
    },

    async createDirectory(path) {
        try {
            const key = this.getStorageKey(path);
            localStorage.setItem(key + '/_isdir', 'true');
            return true;
        } catch (err) {
            console.error('Error creating directory:', err);
            return false;
        }
    },

    async getDirectoryItems(path) {
        try {
            const prefix = this.getStorageKey(path);
            const items = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix) && key !== prefix + '/_isdir') {
                    const relativePath = key.slice(prefix.length + 1);
                    const firstPart = relativePath.split('/')[0];
                    if (!items.includes(firstPart)) {
                        items.push(firstPart);
                    }
                }
            }
            
            return items;
        } catch (err) {
            console.error('Error getting directory items:', err);
            return [];
        }
    },

    async getInfo(path, filtertype = null) {
        try {
            const key = this.getStorageKey(path);
            const isDir = localStorage.getItem(key + '/_isdir') === 'true';
            const content = localStorage.getItem(key);
            
            if (content === null && !isDir) return null;
            
            const info = {
                type: isDir ? 'directory' : 'file',
                size: isDir ? 0 : content.length,
                modtime: Date.now(),
            };
            
            return filtertype ? (info.type === filtertype ? info : null) : info;
        } catch (err) {
            console.error('Error getting file info:', err);
            return null;
        }
    },

    getStorageKey(path) {
        return `${this.identity || 'lux'}:${path}`;
    },

    async exists(path) {
        const key = this.getStorageKey(path);
        return localStorage.getItem(key) !== null || 
               localStorage.getItem(key + '/_isdir') === 'true';
    },

    async isDirectory(path) {
        const key = this.getStorageKey(path);
        return localStorage.getItem(key + '/_isdir') === 'true';
    },

    async isFile(path) {
        const key = this.getStorageKey(path);
        return localStorage.getItem(key) !== null && 
               localStorage.getItem(key + '/_isdir') !== 'true';
    },

    // Пути и директории
    getIdentity() {
        return this.identity;
    },

    setIdentity(identity) {
        this.identity = identity;
    },

    getSaveDirectory() {
        return 'localStorage';
    },

    getUserDirectory() {
        return '/';
    },

    getWorkingDirectory() {
        return '/';
    },

    async mount(archive, mountpoint, jointed = false) {
        try {
            this.mountPoints.set(mountpoint, archive);
            return true;
        } catch (err) {
            console.error('Error mounting:', err);
            return false;
        }
    },

    async unmount(archive) {
        for (const [point, mounted] of this.mountPoints.entries()) {
            if (mounted === archive) {
                this.mountPoints.delete(point);
                return true;
            }
        }
        return false;
    }
};