angular
    .module('editApp', ['ui.bootstrap'])
    .config(($compileProvider, $interpolateProvider) => {
        $compileProvider.debugInfoEnabled(false);
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);

        // change interpolate provider for jekyll
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })
    .controller('EditorController', EditorController)
    .controller('StreamController', StreamController)
    .controller('ConfirmController', ConfirmController)
    .run(function ($rootScope) {
        const glob = JSON.parse(document.querySelector('#glob-data').innerHTML);

        $rootScope.clientId = glob.GITHUB_CLIENT_ID;
        $rootScope.repository = glob.GITHUB_REPOSITORY;
        $rootScope.streamFilePath = '_data/streams.json';

        let tokenExpiry = localStorage.getItem('gh-token-expire');
        tokenExpiry = tokenExpiry ? parseInt(tokenExpiry, 10) : -1;

        if (Date.now() > tokenExpiry) {
            localStorage.removeItem('gh-token');
        }

        const token = localStorage.getItem('gh-token');
        $rootScope.hasToken = !!token;
    });
