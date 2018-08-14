class Global {
    constructor() {
        this.global = {}
    }

    set(key, val) {
        this.global[key] = val;
    }

    get(key) {
        return this.global[key];
    }
}

const global = new Global();

export default global;