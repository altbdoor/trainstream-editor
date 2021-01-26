function EditController($http, $rootScope, $uibModal) {
    const vm = this;
    vm.streamList = [];

    vm.reloadStreams = reloadStreams;
    vm.openEditor = openEditor;

    function openEditor(entry, index) {
        $uibModal
            .open({
                controller: 'EntryController',
                controllerAs: 'vm',
                templateUrl: 'assets/template/stream-edit.html',
                size: 'lg',
                resolve: { entry: angular.copy(entry) },
            })
            .result.then(
                () => {
                    console.log('closed');
                },
                () => {}
            );
    }

    function reloadStreams() {
        vm.streamList = [];

        $http.get(`https://cdn.jsdelivr.net/gh/${$rootScope.repository}/${$rootScope.streamFilePath}`).then((data) => {
            vm.streamList = data.data.data;
        });
    }
    reloadStreams();
}

function EntryController(entry, $http, $rootScope) {
    const vm = this;
    vm.isEdit = !!entry;

    vm.pictureSuggestions = [];
    $http
        .get(`https://api.github.com/repos/${$rootScope.repository}/contents/pictures`, {
            headers: { Accept: 'application/vnd.github.v3+json' },
        })
        .then((data) => {
            vm.pictureSuggestions = data.data.map((item) => `/${item.path}`);
        });

    vm.entry = entry || {};
}
