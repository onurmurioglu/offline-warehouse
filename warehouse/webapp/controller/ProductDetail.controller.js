sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("sap.ui.warehouse.controller.ProductDetail", {
    onInit: function () {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter
        .getRoute("productDetail")
        .attachPatternMatched(this._onProductMatched, this);

      var sUrl = "http://localhost:3000/products";

      fetch(`${sUrl}/sProductID`)
        .then(async (response) => {
          var product = await response.json();
          console.log("Products: ", product);

          var oModel = new sap.ui.model.json.JSONModel({
            selectedProduct: product,
          });

          this.getView().setModel(oModel);
        })
        .catch((error) => {
          console.error("Veri okuma hatası:", error);
        });
    },

    _onProductMatched: function (oEvent) {
      var sProductID = oEvent.getParameter("arguments").productID;

      console.log("ID: ", sProductID);
    },
  });
});
