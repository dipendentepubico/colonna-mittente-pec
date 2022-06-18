// This Source Code Form is subject to the terms of the
// GNU General Public License, version 3.0.
var { AppConstants } = ChromeUtils.import("resource://gre/modules/AppConstants.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var MSG_VIEW_FLAG_DUMMY = 0x20000000;

const replyToColumnHandler = {
  init(win) { this.win = win; },
  getCellText(row, col) { return this.isDummy(row) ? "" : this.getAddress(this.win.gDBView.getMsgHdrAt(row)); },
  getSortStringForRow(hdr) { return this.getAddress(hdr); },
  isString() { return true; },
  getCellProperties(row, col, props) {},
  getRowProperties(row, props) {},
  getImageSrc(row, col) { return null; },
  getSortLongForRow(hdr) { return 0; },
  getAddress(aHeader) {
		let mittente = aHeader.getStringProperty( "replyTo" ) ;
		if(mittente == ''){
			mittente = aHeader.author;
		}
		return mittente;
	  },
  isDummy(row) { return (this.win.gDBView.getFlagsAt(row) & MSG_VIEW_FLAG_DUMMY) != 0; }
};

const fromColumnHandler = {
  init(win) { this.win = win; },
  getCellText(row, col) { return this.isDummy(row) ? "" : this.getAddress(this.win.gDBView.getMsgHdrAt(row)); },
  getSortStringForRow(hdr) { return this.getAddress(hdr); },
  isString() { return true; },
  getCellProperties(row, col, props) {},
  getRowProperties(row, props) {},
  getImageSrc(row, col) { return null; },
  getSortLongForRow(hdr) { return 0; },
  getAddress(aHeader) {
		const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
		let mittente = '';
		let result = aHeader.author.match(regex);
		if(result.length = 1)
		{
		  mittente = result[0];
		}
		return mittente;
	  
	},
  isDummy(row) { return (this.win.gDBView.getFlagsAt(row) & MSG_VIEW_FLAG_DUMMY) != 0; }
};

const columnOverlay = {
  init(win) {
    this.win = win;
    this.addColumns(win);
  },

  destroy() {
    this.destroyColumns();
  },

  observe(aMsgFolder, aTopic, aData) {
    try {
      replyToColumnHandler.init(this.win);
      fromColumnHandler.init(this.win);
      this.win.gDBView.addColumnHandler("replyToAddressColumn", replyToColumnHandler);
      this.win.gDBView.addColumnHandler("fromPCDAddressColumn", fromColumnHandler);
    } catch (ex) {
      console.error(ex);
      throw new Error("Cannot add column handler");
    }
  },

  addColumn(win, columnId, columnLabel) {
    if (win.document.getElementById(columnId)) return;

    const treeCol = win.document.createXULElement("treecol");
    treeCol.setAttribute("id", columnId);
    treeCol.setAttribute("persist", "hidden ordinal sortDirection width");
    treeCol.setAttribute("flex", "2");
    treeCol.setAttribute("closemenu", "none");
    treeCol.setAttribute("label", columnLabel);
    treeCol.setAttribute("tooltiptext", "Full e-mail address");

    const threadCols = win.document.getElementById("threadCols");
    threadCols.appendChild(treeCol);

    // Restore persisted attributes.
    let attributes = Services.xulStore.getAttributeEnumerator(
      this.win.document.URL,
      columnId
    );
    for (let attribute of attributes) {
      let value = Services.xulStore.getValue(this.win.document.URL, columnId, attribute);
      // See Thunderbird bug 1607575 and bug 1612055.
      if (attribute != "ordinal" || parseInt(AppConstants.MOZ_APP_VERSION, 10) < 74) {
        treeCol.setAttribute(attribute, value);
      } else {
        treeCol.ordinal = value;
      }
    }

    Services.obs.addObserver(this, "MsgCreateDBView", false);
  },

  addColumns(win) {
    this.addColumn(win, "replyToAddressColumn", "Mittente PEC");
    this.addColumn(win, "fromPCDAddressColumn", "Mittente PEC PCD");
  },

  destroyColumn(columnId) {
    const treeCol = this.win.document.getElementById(columnId);
    if (!treeCol) return;
    treeCol.remove();
  },

  destroyColumns() {
    this.destroyColumn("replyToAddressColumn");
    this.destroyColumn("fromPCDAddressColumn");
    Services.obs.removeObserver(this, "MsgCreateDBView");
  },
};

var FACHeaderView = {
  init(win) {
    this.win = win;
    columnOverlay.init(win);

    // Usually the column handler is added when the window loads.
    // In our setup it's added later and we may miss the first notification.
    // So we fire one ourserves.
    if (win.gDBView && win.document.documentElement.getAttribute("windowtype") == "mail:3pane") {
      Services.obs.notifyObservers(null, "MsgCreateDBView");
    }
  },

  destroy() {
    columnOverlay.destroy();
  },
};