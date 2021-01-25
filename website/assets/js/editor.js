function EditController($http, $rootScope, $uibModal) {
    const vm = this
    vm.streamList = []

    vm.reloadStreams = reloadStreams
    vm.openEditor = openEditor

    function openEditor(entry) {
        $uibModal.open({
            controller: 'EntryController',
            controllerAs: 'vm',
            templateUrl: 'assets/template/entry.html',
            size: 'lg',
            resolve: { entry }
        }).result.then(
            () => {
                console.log('closed')
            },
            () => {}
        )
    }

    function reloadStreams() {
        vm.streamList = []

        $http.get(`https://cdn.jsdelivr.net/gh/${$rootScope.repository}/${$rootScope.streamFilePath}`).then((data) => {
            vm.streamList = data.data.data
        })
    }
    reloadStreams()
}

function EntryController(entry) {
    const vm = this
    console.log(entry)
}
