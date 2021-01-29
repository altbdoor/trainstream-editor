const defaultHeaders = {
    Accept: 'application/vnd.github.v3+json',
};

function EditorController($http, $rootScope, $uibModal) {
    const vm = this;
    vm.streamList = [];

    vm.reloadStreams = reloadStreams;
    vm.openEditor = openEditor;
    vm.confirmSave = confirmSave;

    function openEditor(editStream, editStreamIndex) {
        $uibModal
            .open({
                controller: 'StreamController',
                controllerAs: 'vm',
                templateUrl: 'assets/template/stream-edit.html',
                size: 'lg',
                resolve: { stream: () => angular.copy(editStream) },
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

        const apiUrl = new URL(`https://api.github.com/repos/${$rootScope.repository}/commits`);
        apiUrl.searchParams.append('path', $rootScope.streamFilePath);
        apiUrl.searchParams.append('per_page', 1);

        $http
            .get(apiUrl.toString(), {
                headers: { ...defaultHeaders },
            })
            .then((data) => data.data[0].sha)
            .then((sha) =>
                $http.get(
                    `https://api.github.com/repos/${$rootScope.repository}/contents/${$rootScope.streamFilePath}?ref=${sha}`,
                    { headers: { Accept: 'application/vnd.github.v3.raw' } }
                )
            )
            .then((data) => {
                vm.streamList = data.data.data;
            });
    }
    reloadStreams();

    function confirmSave(streamList) {
        let jsonData = JSON.stringify(
            {
                $schema: './stream_definitions.json',
                data: [...streamList],
            },
            null,
            4
        );
        jsonData = Base64.encode(jsonData);

        $uibModal
            .open({
                controller: 'ConfirmController',
                controllerAs: 'vm',
                templateUrl: 'assets/template/confirm.html',
                resolve: { jsonData: () => jsonData },
                backdrop: 'static',
                keyboard: false,
            })
            .result.then(
                (isSaved) => {
                    if (isSaved) {
                        reloadStreams();
                    }
                },
                () => {}
            );
    }
}

function StreamController(stream, $http, $rootScope, $scope) {
    const vm = this;
    vm.isEdit = !!stream;

    vm.pictureSuggestions = [];
    $http
        .get(`https://api.github.com/repos/${$rootScope.repository}/contents/pictures`, {
            headers: { ...defaultHeaders },
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

function ConfirmController(jsonData, $scope, $http, $rootScope) {
    const vm = this;
    vm.isProcessing = false;
    vm.hasError = false;
    vm.errorData = '';

    vm.processData = processData;

    function processData() {
        vm.isProcessing = true;
        const filePath = $rootScope.streamFilePath;
        const urlPath = `https://api.github.com/repos/${$rootScope.repository}/contents/${filePath}`;

        $http
            .get(urlPath, { headers: { ...defaultHeaders } })
            .then((data) => data.data.sha)
            .then((sha) =>
                $http.put(
                    urlPath,
                    {
                        path: filePath,
                        message: `Updating streams.json on ${new Date().toISOString()}`,
                        content: jsonData,
                        sha,
                    },
                    {
                        headers: {
                            ...defaultHeaders,
                            Authorization: `token ${localStorage.getItem('gh-token')}`,
                        },
                    }
                )
            )
            .then(() => $scope.$close(true))
            .catch((err) => {
                vm.hasError = true;
                vm.errorData = err;
                console.error(err);
            })
            .finally(() => (vm.isProcessing = false));
    }
}
