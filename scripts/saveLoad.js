'use strict';

Main.storage = window.localStorage;

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
Main.system.storageAvailable = function () {
    try {
        var storage = window.localStorage;
        var x = '__storage_test__';

        storage.setItem(x, x);
        storage.removeItem(x);

        return true;
    }
    catch (e) {
        return e instanceof DOMException
            && (
                // Everything except Firefox
                e.code === 22
                // Firefox
                || e.code === 1014
                // Test name field too, because code might not be present
                // everything except Firefox
                || e.name === 'QuotaExceededError'
                // Firefox
                || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            )
            // Acknowledge QuotaExceededError only if there's something already
            // stored
            && storage.length !== 0;
    }
};

Main.system.saveWizardMode = function () {
    Main.storage.setItem('wizard', Main.getDevelop());
};

Main.system.loadWizardMode = function () {
    return Main.storage.getItem('wizard') === 'true';
};

Main.system.clearStorage = function () {
    if (Main.getDevelop()) {
        Main.storage.clear();
        console.log('The local storage is cleared.');
    }
};
