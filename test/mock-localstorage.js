// Mock localStorage 
(function (glob) {
    var s = {};
    s.setItem = function (k, v) {
        this[k] = v + '';
    }
    s.getItem = function (k) {
        if (this.hasOwnProperty(k)) {
            return this[k];
        } else {
            return null;
        }
    }
    s.removeItem = function (k) {
        if (k != 'length' && this.hasOwnProperty(k) && typeof this[k] != 'function') {
            delete this[k];
        }
    }
    s.clear = function () {
        for (var k in this) {
            if (k != 'length' && this.hasOwnProperty(k) && typeof this[k] != 'function') {
                delete this[k];
            }
        }
    }
    Object.defineProperty(s, 'length', {
        get: function () {
            return Object.keys(this).length - 5;
        }
    });
    glob.localStorage = s;
}(typeof window !== 'undefined' ? window : global));
