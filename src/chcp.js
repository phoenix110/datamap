import Framework7 from 'framework7/dist/framework7.esm.bundle.js';
import log from './changelog';

var app = {

    // Application Constructor

    initialize: function() {

        this.bindEvents();

    },

    // Bind any events that are required.

    // Usually you should subscribe on 'deviceready' event to know, when you can start calling cordova modules

    bindEvents: function() {

        document.addEventListener('deviceready', this.onDeviceReady, false);

        document.addEventListener('chcp_updateIsReadyToInstall', this.onUpdateReady, false);

        document.addEventListener('chcp_updateLoadFailed', this.onUpdateLoadError, false);

        document.addEventListener("resume", this.checkUpdateAvailable, false);
    },

    fetchUpdate: function() {
        chcp.fetchUpdate(function(error, data){
            if (error) {
                console.log('Failed to load the update with error code: ' + error.code);
                console.log(error.description);
            } else {
                console.log('Update is loaded');
            }
        });
    },

    // deviceready Event Handler

    onDeviceReady: function() {
        app.checkUpdateAvailable();
    },

    checkUpdateAvailable() {
        chcp.isUpdateAvailableForInstallation(function(error, data) {
            if (error) {
              console.log('Nothing to install. Executing fetch.');
              app.fetchUpdate();
              return;
            }
        
            // update is in cache and can be installed - install it
            console.log('Current version: ' + data.currentVersion);
            console.log('About to install: ' + data.readyToInstallVersion);

            app.onUpdateReady();
        });
    },

    onUpdateReady: function() {
        var app1 = Framework7.$('#app')[0];
        let content = '<div style="text-align: left;">';
        for (let index = 0; index < log.length; index++) {
            const item = log[index];
            content += `<div style="${item.style || ""}">${index+1}. ${item.text || ""}</div>`
        }
        content += `</div>`;
        app1.f7.dialog.create({
            title: "版本更新",
            content,
            buttons: [{text:"确定", onClick:function() {
                chcp.installUpdate(app.installationCallback);
            }}]
        }).open();
    },

    installationCallback: function(error) {
        if (error) {
          console.log('Failed to install the update with error code: ' + error.code);
          console.log(error.description);
        } else {
          console.log('Update installed!');
        }
    },

    onUpdateLoadError: function(eventData) {

        var error = eventData.detail.error;

        if (error && error.code == chcp.error.APPLICATION_BUILD_VERSION_TOO_LOW) {

            console.log('Native side update required');

            var dialogMessage = '请前往应用市场更新到最新版.';

            chcp.requestApplicationUpdate(dialogMessage, this.userWentToStoreCallback, this.userDeclinedRedirectCallback);

        }

    },

    userWentToStoreCallback: function() {

        // user went to the store from the dialog

    },

    userDeclinedRedirectCallback: function() {

        // User didn't want to leave the app.

        // Maybe he will update later.

    }

};

console.log('......require chcp on init');

app.initialize();
