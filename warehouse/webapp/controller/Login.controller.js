sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("sap.ui.warehouse.controller.Login", {
      onInit: function () {},

      onEntry: function () {
        console.log("Giriş 'e tıklandı");
        const usernameInput = this.getView().byId("usernameInput").getValue();
        const passwordInput = this.getView().byId("passwordInput").getValue();

        console.log("tamamlandı");

        var sUrl = "http://localhost:3000/users?";

        fetch(`${sUrl}username=${usernameInput}&password=${passwordInput}`)
          .then((response) => {
            if (!response.ok) {
              console.error("Hatalı giriş yapıldı.");
              throw new Error("Hatalı giriş");
            }

            return response.json();
          })
          .then((data) => {
            if (data.length === 1) {
              console.log("Giriş Başarılı - Login");
              MessageToast.show("Giriş Başarılı.");

              var oRouter = this.getOwnerComponent().getRouter();
              oRouter.navTo("home");
            } else {
              console.error("Kullanıcı bulunamadı veya hatalı giriş yapıldı.");
              MessageToast.show("Kullanıcı Adı veya Şifre Hatalı ");
            }
          })
          .catch((error) => {
            console.error("Veri okuma hatası:", error);
          });
      },
    });
  }
);
