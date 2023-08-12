sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    Controller,
    Dialog,
    Button,
    VBox,
    Label,
    Input,
    TextArea,
    JSONModel
  ) {
    "use strict";

    return Controller.extend("sap.ui.warehouse.controller.Home", {
      onInit: function () {
        var oData = {
          productName: "",
          productCode: "",
          stockQuantity: "",
          productDescription: "",
          price: "",
        };

        var that = this;

        var oModel = new JSONModel();
        oModel.setData(oData);
        that.getOwnerComponent().setModel(oModel, "newMaterial");
      },

      onTile1Press: function () {
        console.log("Depoya Transfer");

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("transferstock");
      },

      onTile2Press: function () {
        console.log("Stok Yönetimi");

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("stockmanage");
      },

      onTile3Press: function () {
        console.log("Ürünler");

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("overview");
      },

      onExitBtn: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("login");
      },
    });
  }
);
