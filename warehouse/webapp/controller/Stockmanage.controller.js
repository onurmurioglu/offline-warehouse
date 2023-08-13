sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("sap.ui.warehouse.controller.Stockmanage", {
      onInit: function () {
        var isOnline = navigator.onLine;

        if (isOnline) {
          console.log("Sistem ONLINE");
        } else {
          console.log("Sistem OFFLINE");
        }

        this.interval = setInterval(
          this.checkInternetConnection.bind(this),
          5000
        );

        var sUrl = "http://localhost:3000/products";

        fetch(sUrl)
          .then(async (response) => {
            var products = await response.json();
            console.log("Products: ", products);

            var oModel = new JSONModel({
              products: products,
              selectedProduct: {},
            });

            this.getView().setModel(oModel);
          })
          .catch((error) => {
            console.error("Veri okuma hatası: ", error);
          });
      },

      onItemSelect: function (oEvent) {
        var oItem = oEvent.getSource();
        var oBindingContext = oItem.getBindingContext();
        if (oBindingContext) {
          var oModel = this.getView().getModel();
          var oSelectedProduct = oBindingContext.getObject();
          oModel.setProperty("/selectedProduct", oSelectedProduct);
        }
      },

      onSave: function () {
        var oModel = this.getView().getModel();
        var oSelectedProduct = oModel.getProperty("/selectedProduct");

        if (oSelectedProduct && oSelectedProduct.id) {
          var sUrl = "http://localhost:3000/products/" + oSelectedProduct.id;

          fetch(sUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(oSelectedProduct),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Veri güncellendi:", data);

              sap.m.MessageBox.show("Veri Güncellendi.", {
                icon: sap.m.MessageBox.Icon.SUCCESS,
                title: "Başarılı",
                actions: [sap.m.MessageBox.Action.OK],
                onClose: function () {},
              });
            })
            .catch((error) => {
              console.error("Veri güncelleme hatası:", error);
            });

          console.log("Güncellendi: ", oSelectedProduct);
        } else {
          console.error("Seçili ürün bulunamadı veya ID eksik.");
        }

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
      },

      onExit: function () {
        clearInterval(this.interval);
      },

      checkInternetConnection: function () {
        var isOnline = navigator.onLine;

        if (isOnline) {
          console.log("Bağlantı mevcut - Sistem ONLINE.");
        } else {
          console.log("Bağlantı yok - Sistem OFFLINE");
        }
      },

      onBack: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("home");
      },
    });
  }
);
