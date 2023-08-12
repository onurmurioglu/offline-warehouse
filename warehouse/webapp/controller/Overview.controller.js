sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    Filter,
    FilterOperator,
    Fragment,
    JSONModel,
    MessageBox
  ) {
    "use strict";

    return Controller.extend("sap.ui.warehouse.controller.Overview", {
      onInit: function () {
        var oData = {
          image: "",
          title: "",
          productCode: "",
          stock: "",
          description: "",
          category: "",
          price: "",
        };

        var that = this;

        var oModel = new JSONModel();
        oModel.setData(oData);
        that.getOwnerComponent().setModel(oModel, "newMaterial");

        var sUrl = "http://localhost:3000/products";

        fetch(sUrl)
          .then(async (response) => {
            var products = await response.json();
            console.log("Products: ", products);

            var oModel = new sap.ui.model.json.JSONModel({
              products: products,
            });

            this.getView().setModel(oModel);
          })
          .catch((error) => {
            console.error("Veri okuma hatası:", error);
          });
      },

      onPressList: function (oEvent) {
        console.log("Liste butonu çalıştı");

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("productDetail");
      },

      onListItemPress: function (oEvent) {
        var oSelectedItem = oEvent.getSource();
        var oBindingContext = oSelectedItem.getBindingContext();
        if (oBindingContext) {
          var sProductPath = oBindingContext.getPath();
          var sProductID = sProductPath.substr(
            sProductPath.lastIndexOf("/") + 1
          );
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("productDetail", {
            productID: sProductID,
          });
        } else {
          console.error("Binding context not found.");
        }
      },

      onSearch: function (oEvent) {
        var sSearchValue = oEvent.getParameter("newValue");
        var oList = this.byId("list");
        var oBinding = oList.getBinding("items");
        var oFilter = new oFilter(
          "title",
          FilterOperator.Contains,
          sSearchValue
        );
        oBinding.filter(oFilter);
      },

      hkDialog: null,

      onSaveBtn: function () {
        var that = this;
        var oView = that.getView();
        if (!that.hkDialog) {
          that.hkDialog = Fragment.load({
            id: "saveFrag",
            name: "sap.ui.warehouse.view.AddProduct",
            controller: that,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        that.hkDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      onCloseDialog: function () {
        var that = this;
        that.hkDialog.then(function (oDialog) {
          var oData = {
            image: "",
            title: "",
            productCode: "",
            stock: "",
            description: "",
            category: "",
            price: "",
          };

          var oModel = new JSONModel();
          oModel.setData(oData);
          that.getOwnerComponent().setModel(oModel, "newMaterial");

          oDialog.close();
        });
      },

      onAddProductPress: function () {
        var that = this;

        var data = that.getOwnerComponent().getModel("newMaterial").getData();

        console.log("Burası ajax...");
        $.ajax({
          url: "http://localhost:3000/products",
          type: "POST",
          data: JSON.stringify(data),
          contentType: "application/json",
          success: function () {
            sap.m.MessageBox.show("İşlem başarıyla tamamlandı.", {
              icon: sap.m.MessageBox.Icon.SUCCESS,
              title: "Başarılı",
              actions: [sap.m.MessageBox.Action.OK],
              onClose: function () {},
            });

            var sUrl = "http://localhost:3000/products";

            fetch(sUrl)
              .then(async (response) => {
                var products = await response.json();
                console.log("Products: ", products);

                var oModel = new sap.ui.model.json.JSONModel({
                  products: products,
                });

                this.getView().setModel(oModel);
              })
              .catch((error) => {
                console.error("Veri okuma hatası:", error);
              });
          },
          error: function (oError) {
            console.error("Ürün ekleme hatası:", oError);
          },
        });

        var isOnline = navigator.onLine;

        if (isOnline) {
          console.log("Sistem ONLINE - Senkronizason yapılıyor... .");

          //* Fake rest API verilerini çeker
          var fModel = new sap.ui.model.json.JSONModel();
          var oModel = new sap.ui.model.json.JSONModel();

          fetch("http://localhost:3000/products")
            .then((response) => response.json())
            .then((data) => {
              fModel.setData(data);

              $.ajax({
                url: "http://localhost:3001/products",
                method: "GET",
                success: function (ajaxData) {
                  oModel.setData(ajaxData);

                  data.forEach((fetchItem) => {
                    var match = ajaxData.find(
                      (ajaxItem) => ajaxItem.id === fetchItem.id
                    );
                    if (match) {
                      console.log("Veri güncellendi:", fetchItem);

                      fetch(`http://localhost:3001/edit-product/${match.id}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(fetchItem),
                      })
                        .then((response) => response.json())
                        .then((updatedData) => {
                          console.log("Veri güncellendi:", updatedData);

                          console.log("SENKRONIZASYON TAMAMLANDI !");
                        })
                        .catch((error) => {
                          console.error("Veri güncelleme hatası:", error);
                        });
                    } else {
                      console.log("Yeni veri eklendi:", fetchItem);

                      fetch(`http://localhost:3001/add-product`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(fetchItem),
                      })
                        .then((response) => response.json())
                        .then((newData) => {
                          console.log("Yeni veri eklendi:", newData);
                        })
                        .catch((error) => {
                          console.error("Veri ekleme hatası:", error);
                        });
                      console.log("SENKRONIZASYON TAMAMLANDI !");
                    }
                  });
                },
                error: function (err) {
                  console.error("Veri çekme hatası:", err);
                },
              });

              this.getView().setModel(fModel, "localApiModel");

              console.log("Veriler:", data);
            })
            .catch((error) => {
              console.error("Veri çekme hatası:", error);
            });

          this.getView().setModel(oModel, "onlineModel");
        } else {
          console.log("Bağlantı yok - Sistem OFFLINE");
        }

        that.onCloseDialog();
      },

      onFilterInvoices: function (oEvent) {
        var sSearchValue = oEvent.getParameter("newValue");
        var oList = this.byId("list");
        var oBinding = oList.getBinding("items");
        var oFilter = new Filter(
          "title",
          FilterOperator.Contains,
          sSearchValue
        );
        oBinding.filter(oFilter);
      },

      onStockManage: function () {
        var oRouter = this.getOwnerComponent().getRouter();

        oRouter.navTo("home");
      },

      onExit: function (oEvent) {
        console.log("Exit");

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("login");
      },

      onCancelPress: function () {
        this._oDialog.close();
      },
    });
  }
);
