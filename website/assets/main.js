angular
    .module('editApp', ['ui.bootstrap'])
    .config(($compileProvider, $interpolateProvider) => {
        $compileProvider.debugInfoEnabled(false)
        $compileProvider.commentDirectivesEnabled(false)
        $compileProvider.cssClassDirectivesEnabled(false)

        // change interpolate provider for jekyll
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })
    .factory('DataService', function() {
        const glob = JSON.parse(document.querySelector('#glob-data').innerHTML)
        const filePath = '_data/streams.json'
        const filePathApi = `https://api.github.com/repos/${glob.GITHUB_REPOSITORY}/contents/${filePath}`
        const token = localStorage.getItem('gh-token')

        const instance = {
            glob,
            filePath,
            filePathApi,
            token,
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        }

        return instance;
    })
    .controller('MainController', function(DataService) {
        const vm = this
        vm.clientId = DataService.glob.GITHUB_CLIENT_ID
        vm.isLoggedIn = !!DataService.token
    })
    .controller('EditController', function ($http, DataService) {
        const vm = this
        vm.repository = DataService.glob.GITHUB_REPOSITORY
        vm.streamList = []

        function reloadStreams() {
            $http.get(`https://cdn.jsdelivr.net/gh/${DataService.glob.GITHUB_REPOSITORY}/${DataService.filePath}`).then((data) => {
                vm.streamList = data.data.data
            })
        }

        reloadStreams()
    })
    .run();
