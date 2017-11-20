function addWidgetsHome() {
    Home.setDefaultUnit(kony.flex.DP);
    var Button0ac56a6a037844b = new kony.ui.Button({
        "focusSkin": "slButtonGlossRed",
        "height": "50dp",
        "id": "Button0ac56a6a037844b",
        "isVisible": true,
        "left": "50dp",
        "skin": "slButtonGlossBlue",
        "text": "Appfactory",
        "top": "102dp",
        "width": "260dp",
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "displayText": true,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {});
    Home.add(Button0ac56a6a037844b);
};

function HomeGlobals() {
    Home = new kony.ui.Form2({
        "addWidgets": addWidgetsHome,
        "enabledForIdleTimeout": false,
        "id": "Home",
        "layoutType": kony.flex.FREE_FORM,
        "needAppMenu": true,
        "skin": "slForm"
    }, {
        "displayOrientation": constants.FORM_DISPLAY_ORIENTATION_PORTRAIT,
        "layoutType": kony.flex.FREE_FORM,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "footerOverlap": false,
        "headerOverlap": false,
        "menuPosition": constants.FORM_MENU_POSITION_AFTER_APPMENU,
        "retainScrollPosition": false,
        "titleBar": true,
        "titleBarSkin": "slTitleBar",
        "windowSoftInputMode": constants.FORM_ADJUST_PAN
    });
};