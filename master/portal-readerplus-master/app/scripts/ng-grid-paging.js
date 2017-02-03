/*jshint unused:false*/
function ngGridPaging(opts){
  var self = this;
  self.grid = null;
  self.scope = null;
  self.init = function (scope, grid, services) {
    self.domUtilityService = services.DomUtilityService;
    self.grid = grid;
    self.scope = scope;

    var parentScope = self.scope.$parent;
    var pagingOptions = parentScope.pagingOptions;

    var checkPagingNeeded = function() {
      if(self.grid.data.length > pagingOptions.pageSize) {
        parentScope.showFooter = true;
        parentScope.footerRowHeight = self.grid.config.footerRowHeight;
        setupPaging();
      } else {
        parentScope.showFooter = false;
        parentScope.footerRowHeight = 0;
        recalcHeightForData();
      }
    };

    var setupPaging = function() {

      var allData = self.grid.data;
      parentScope.totalServerItems = allData.length;
      self.grid.data = allData.slice((pagingOptions.currentPage - 1) * pagingOptions.pageSize, pagingOptions.currentPage * pagingOptions.pageSize);

      parentScope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          self.grid.data = allData.slice((pagingOptions.currentPage - 1) * pagingOptions.pageSize, pagingOptions.currentPage * pagingOptions.pageSize);
          render();
        }
      }, true);

      render();

    };

    var render = function() {
      self.grid.rowFactory.fixRowCache();
      angular.forEach(self.grid.data, function (item, j) {
          var indx = self.grid.rowMap[j] || j;
          if (self.grid.rowCache[indx]) {
              self.grid.rowCache[indx].ensureEntity(item);
          }
          self.grid.rowMap[indx] = j;
      });
      self.grid.searchProvider.evalFilter();
      self.grid.configureColumnWidths();
      self.grid.refreshDomSizes();
    };

    var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); };
    var innerRecalcForData = function () {

      var gridId = self.grid.gridId;
      var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
      var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
      var naturalHeight = self.grid.$canvas.height();
      if (opts) {
        if (opts.minHeight && (naturalHeight + extraHeight) < opts.minHeight) {
          naturalHeight = opts.minHeight - extraHeight;
        }
        if (opts.maxHeight && (naturalHeight + extraHeight) > opts.maxHeight) {
          naturalHeight = opts.maxHeight;
        }
      }

      var newViewportHeight = naturalHeight + 1;

      self.grid.$viewport.css('height', newViewportHeight + 'px');
      self.grid.$root.css('height', (newViewportHeight + extraHeight) + 'px');
      self.scope.baseViewportHeight = newViewportHeight;
      self.domUtilityService.RebuildGrid(self.scope, self.grid);

    };
    self.scope.catHashKeys = function () {
      var hash = '',
        idx;
      for (idx in self.scope.renderedRows) {
        hash += self.scope.renderedRows[idx].$$hashKey;
      }
      return hash;
    };

    self.scope.$watch('catHashKeys()', innerRecalcForData);
    self.scope.$watch(self.grid.config.data, checkPagingNeeded);
  };
}
