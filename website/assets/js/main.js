angular
    .module('editApp', ['ui.bootstrap'])
    .config(($compileProvider, $interpolateProvider) => {
        $compileProvider.debugInfoEnabled(false);
        $compileProvider.commentDirectivesEnabled(false);
        $compileProvider.cssClassDirectivesEnabled(false);

        // change interpolate provider for jekyll
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })
    // .factory('DataService', function() {
    //     const glob = JSON.parse(document.querySelector('#glob-data').innerHTML)

    //     const filePath = '_data/streams.json'
    //     const filePathApi = `https://api.github.com/repos/${glob.GITHUB_REPOSITORY}/contents/${filePath}`
    //     const token = localStorage.getItem('gh-token')

    //     const instance = {
    //         glob,
    //         filePath,
    //         filePathApi,
    //         token,
    //         headers: {
    //             Authorization: `token ${token}`,
    //             Accept: 'application/vnd.github.v3+json',
    //         },
    //     }

    //     return instance;
    // })
    .controller('EditController', EditController)
    .controller('StreamController', StreamController)
    .run(function ($rootScope) {
        const glob = JSON.parse(document.querySelector('#glob-data').innerHTML);

        $rootScope.clientId = glob.GITHUB_CLIENT_ID;
        $rootScope.repository = glob.GITHUB_REPOSITORY;
        $rootScope.streamFilePath = '_data/streams.json';

        const token = localStorage.getItem('gh-token');
        $rootScope.hasToken = !!token;
    });
