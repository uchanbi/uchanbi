angular.module('app.csvUpload', [])
.directive('csvUpload', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      result: '='
    },
    template: '<input type="file"/></div>',
    link: function(scope, element) {
      element.on('click', function(e){
        //  Reset if trying to re-select a file
        e.target.value = '';
        scope.$apply(function() {
          scope.result = null;
        });
      });

      element.on('change', function(onChangeEvent) {
        var reader = new FileReader();
        reader.onload = function(onLoadEvent) {
          scope.$apply(function() {
            scope.result = Papa.parse(onLoadEvent.target.result, { header: true, skipEmptyLines: true, delimiter: "," });
          });
        };
        if ( (onChangeEvent.target.type === "file") && (onChangeEvent.target.files !== null || onChangeEvent.srcElement.files !== null) )  {
          reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
        }
      });

    }
  };
});
