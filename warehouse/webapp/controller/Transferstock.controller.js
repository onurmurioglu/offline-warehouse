sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
  ],
  function (Controller, JSONModel, Fragment, MessageBox, Dialog, Button, Text) {
    "use strict";

    return Controller.extend("sap.ui.warehouse.controller.Transferstock", {
      onInit: function () {
        this.selecetedProductId = 0;
        this.selecetedStockQuantity = "";
        this.inputStock = "";
        this.selectedProdDesc = "";
        this.selectedProdCategory = "";
        this.selectedProdImage = "";
        this.selecetedProductTitle = "";
        this.selectedProdPrice = "";

        this._oDialog = null;

        var that = this;

        var endpointUrl = "http://localhost:3000";

        fetch(`${endpointUrl}/products`)
          .then(async (response) => {
            var products = await response.json();
            var pModel = new JSONModel();
            pModel.setData(products);
            that.getOwnerComponent().setModel(pModel, "listProducts");

            console.log("PR: ", products);
          })

          .catch((error) => {
            console.error("Veri çekme hatası:", error);
          });

        fetch(`${endpointUrl}/transfer_warehouse`)
          .then(async (response) => {
            var transferWarehouse = await response.json();
            var tModel = new JSONModel();
            tModel.setData(transferWarehouse);
            that.getOwnerComponent().setModel(tModel, "transferModel");

            console.log("TR: ", transferWarehouse);
          })

          .catch((error) => {
            console.error("Veri çekme hatası:", error);
          });

        fetch(`${endpointUrl}/warehouses`)
          .then(async (response) => {
            var senderWh = await response.json();
            var sModel = new JSONModel();
            sModel.setData(senderWh);
            that.getOwnerComponent().setModel(sModel, "senderModel");

            console.log("SR: ", senderWh);
          })

          .catch((error) => {
            console.error("Veri çekme hatası:", error);
          });
      },

      pDialog: null,

      onProdSelect: function () {
        var that = this;
        var oView = that.getView();
        if (!that.pDialog) {
          that.pDialog = Fragment.load({
            id: "selectProd",
            name: "sap.ui.warehouse.view.ProductSelect",
            controller: that,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        that.pDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      tDialog: null,

      onTransfer: function () {
        var that = this;
        var oView = that.getView();
        if (!that.tDialog) {
          that.tDialog = Fragment.load({
            id: "Receivewrhs",
            name: "sap.ui.warehouse.view.Receivewrhse",
            controller: that,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        that.tDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      sDialog: null,

      onSenderSelect: function () {
        var that = this;
        var oView = that.getView();
        if (!that.sDialog) {
          that.sDialog = Fragment.load({
            id: "senderWrhs",
            name: "sap.ui.warehouse.view.Senderwrhs",
            controller: that,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        that.sDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      onSavePress: function () {
        var oModel = this.getView().getModel("viewData");
        var newData = oModel.getData();

        var oODataModel = this.getView().getModel("yourODataModel");
        oODataModel.create("/products", newData, {
          success: function () {
            console.log("Ürün başarıyla kaydedildiaa.");
          },
          error: function (oError) {
            console.error("Ürün kaydetme hatasıaaa:", oError);
          },
        });
      },

      productConfirm: function (oEvent) {
        var that = this;

        var oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          var sSelectedProductName = oSelectedItem.getTitle();
          var sSelectedProductDescription = oSelectedItem.getDescription();

          console.log("Seçilen model: ", oSelectedItem);

          var oModel = that.getView().getModel("listProducts");

          var oData = oModel.getData();
          oData.productName = sSelectedProductName;
          oModel.setData(oData);

          var oInputValueHelp = that.byId("mlzFrg");
          oInputValueHelp.setValue(sSelectedProductName);

          console.log("oData: ", oData.productName);
        }

        var endpointUrl = "http://localhost:3000";

        fetch(
          `${endpointUrl}/products?title=${encodeURIComponent(
            sSelectedProductName
          )}`
        )
          .then(async (response) => {
            if (response.ok) {
              var urun = await response.json();
              console.log("Seçilen Ürün: ", urun[0]);

              that.selecetedProductId = urun[0].id;
              that.selecetedProductTitle = urun[0].title;
              that.selecetedStockQuantity = urun[0].stock;

              that.selectedProdDesc = urun[0].description;
              that.selectedProdCategory = urun[0].category;
              that.selectedProdImage = urun[0].image;
              that.selectedProdPrice = urun[0].price;
            } else {
              console.error("Veri çekme hatası:", response.statusText);
            }
          })
          .catch((error) => {
            console.error("Veri çekme hatası:", error);
          });
      },

      confReceiveWrhs: function (oEvent) {
        var that = this;

        var oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          var sSelectedProductName = oSelectedItem.getTitle();

          var oInputValueHelp = that.byId("receiveWarehouse");
          oInputValueHelp.setValue(sSelectedProductName);
        }
      },

      confSenderWrhs: function (oEvent) {
        var that = this;

        var oSelectedItem = oEvent.getParameter("selectedItem");
        if (oSelectedItem) {
          var sSelectedProductName = oSelectedItem.getTitle();

          var oInputValueHelp = that.byId("senderWarehouse");
          oInputValueHelp.setValue(sSelectedProductName);
        }
      },

      onSendTransfer: function async() {
        var inputValue = this.getView().byId("TransferMik").getValue();

        console.log("Girilen Değer: " + inputValue);

        console.log("ID değeri: ", this.selecetedProductId);

        this.inputStock = this.selecetedStockQuantity - inputValue;

        var selectedId = this.selectedProductId;

        console.log("son değer: ", inputValue);

        if (!this._oDialog) {
          this._oDialog = new Dialog({
            title: "Transfer Yapılsın mı?",
            content: new Text({
              text: "Transfer yapılsın mı?",
            }),
            beginButton: new Button({
              text: "Evet",
              press: this.onConfirm.bind(this),
            }),
            endButton: new Button({
              text: "Hayır",
              press: function () {
                this._oDialog.close();
              }.bind(this),
            }),
          });

          this.getView().addDependent(this._oDialog);
        }

        this._oDialog.open();
      },

      onConfirm: function (oEvent) {
        console.log("ID Değeri: ", this.selecetedProductId);

        var newStock = this.selecetedStockQuantity - this.inputStock;

        console.log("selecetedStockQuantity: ", this.selecetedStockQuantity);
        console.log("inputStock: ", this.inputStock);
        console.log("New Stock: ", newStock);

        var sUrl = `http://localhost:3000/products/${encodeURIComponent(
          this.selecetedProductId
        )}`;

        var requestBody = JSON.stringify({
          title: this.selecetedProductTitle,
          description: this.selectedProdDesc,
          category: this.selectedProdCategory,
          stock: this.inputStock,
          price: this.selectedProdPrice,
          image: this.selectedProdImage,
        });

        console.log("title: ", this.selecetedProductTitle);
        console.log("description: ", this.selectedProdDesc);
        console.log("category: ", this.selectedProdCategory);
        console.log("stock: ", this.inputStock);
        console.log("price: ", this.selectedProdPrice);
        console.log("image: ", this.selectedProdImage);

        fetch(sUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Veri güncellendi:", data);

            var oModel = this.getView().getModel("listProducts");
            var oData = oModel.getData();
            var updatedProduct = oData.find(
              (product) => product.id === this.selecetedProductId
            );
            if (updatedProduct) {
              updatedProduct.stock = newStock;
              oModel.refresh();
            }
          })
          .catch((error) => {
            console.error("Veri güncelleme hatası:", error);
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

                          sap.m.MessageBox.show(
                            "İşlem Yapılamadı, Tekrar deneyiniz.",
                            {
                              icon: sap.m.MessageBox.Icon.ERROR,
                              title: "Hata",
                              actions: [sap.m.MessageBox.Action.OK],
                              onClose: function () {},
                            }
                          );
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

              sap.m.MessageBox.show("İşlem başarıyla tamamlandı.", {
                icon: sap.m.MessageBox.Icon.SUCCESS,
                title: "Başarılı",
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function () {},
              });

              console.log("Veriler:", data);
            })
            .catch((error) => {
              console.error("Veri çekme hatası:", error);
            });

          this.getView().setModel(oModel, "onlineModel");
        } else {
          console.log("Bağlantı yok - Sistem OFFLINE");
        }

        this._oDialog.close();
      },

      onHomeButton: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("home");
      },

      onSelectItem: function () {
        var that = this;
      },

      onBack: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("home");
      },
    });
  }
);
