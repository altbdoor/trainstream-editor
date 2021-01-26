function EditController($http, $rootScope, $uibModal) {
    const vm = this;
    vm.streamList = [];

    vm.reloadStreams = reloadStreams;
    vm.openEditor = openEditor;

    function openEditor(editStream, editStreamIndex) {
        $uibModal
            .open({
                controller: 'StreamController',
                controllerAs: 'vm',
                templateUrl: 'assets/template/stream-edit.html',
                size: 'lg',
                resolve: { stream: angular.copy(editStream) },
            })
            .result.then(
                (newStream) => {
                    if (editStreamIndex !== -1) {
                        vm.streamList = vm.streamList.map((stream, index) =>
                            index === editStreamIndex ? newStream : stream
                        );
                    } else {
                        vm.streamList = [newStream, ...vm.streamList];
                    }
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

function StreamController(stream, $http, $rootScope, $scope) {
    const vm = this;
    vm.isEdit = !!stream;

    vm.pictureSuggestions = [];
    $http
        .get(`https://api.github.com/repos/${$rootScope.repository}/contents/pictures`, {
            headers: { Accept: 'application/vnd.github.v3+json' },
        })
        .then((data) => {
            vm.pictureSuggestions = data.data.map((item) => `/${item.path}`);
        });

    vm.stream = stream || {
        isAlive: true,
        images: [],
        extras: [],
    };

    vm.addImage = addImage;
    vm.removeImage = removeImage;
    vm.addExtra = addExtra;
    vm.removeExtra = removeExtra;

    vm.saveStream = saveStream;

    function saveStream(form, stream) {
        if (form.$invalid) {
            return;
        }

        $scope.$close(stream);
    }

    function addImage() {
        vm.stream.images = [...vm.stream.images, { src: '', alt: '', width: 0, height: 0 }];
    }

    function removeImage(removedIndex) {
        vm.stream.images = vm.stream.images.filter((_, index) => index !== removedIndex);
    }

    function addExtra() {
        vm.stream.extras = [...vm.stream.extras, { link: '', linkTitle: '', text: '' }];
    }

    function removeExtra(removedIndex) {
        vm.stream.extras = vm.stream.extras.filter((_, index) => index !== removedIndex);
    }
}
