sap.ui.define(
  ["sap/ui/core/ComponentContainer"],
  function (ComponentContainer) {
    "use strict";

    new ComponentContainer({
      name: "sap.ui.warehouse",
      settings: {
        id: "walkthrough",
      },
      async: true,
    }).placeAt("content");
  }
);
