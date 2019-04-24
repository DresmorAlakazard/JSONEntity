/**
 * Date: 24/04/2019
 * Version: 1.3.0
 * Author: Marton David Orosz
 */

"use strict";

(function(r, f) {
  if (typeof define === "function" && define.amd) {
      define([], f);
  } else if (typeof module === "object") {
      module.exports = f();
  } else {
      r.JSONEntity = f();
  }
}(window, function() {
  var JSONEntity = function() {
    this._bStrict = false;
    this._aFields = [ ];
  };

  function HandleVDataParam(vData, fnArray, fnObject) {
    if (typeof vData !== "object" || vData === null) {
      throw new TypeError("vData must be a non-null object!");
    } else if (Array.isArray(vData)) {
      return vData.map(function(oData) {
        return fnArray(oData);
      }, this);
    } else {
      return fnObject(vData);
    }
  }

  JSONEntity.prototype.setStrictMode = function(bValue) {
    this._bStrict = bValue;
  };

  JSONEntity.prototype.getStrictMode = function() {
    return this._bStrict;
  };

  JSONEntity.prototype.find = function(sRecv, sSend) {
    for (var i = 0; i < this._aFields.length; ++i) {
      var oField = this._aFields[i];
      if (oField.recvname === sRecv || oField.sendname === sSend) {
        return oField;
      }
    }
    return null;
  };

  JSONEntity.prototype.field = function(sRecv, sSend, fnRecv, fnSend) {
    var oField = this.find(sRecv, sSend);

    if (oField !== null) {
      throw new Error("Field already exists!");
    }

    this._aFields.push({
      recvname: sRecv || sSend,
      sendname: sSend || sRecv,
      recvfunc: fnRecv || fnSend,
      sendfunc: fnSend || fnRecv,
    });
  };

  JSONEntity.prototype.transmit = function(bMethodReceive, vData) {
    return HandleVDataParam(vData, this.transmit.bind(this, bMethodReceive), (function(oData) {
        var oResult = { };

        if (this._bStrict) {
          var sType = this.type(vData);

          if (sType === "unknown") {
            throw new Error("Unkown entity!");
          }

          var bIsSend = sType === "send";

          if ((bIsSend && !bMethodReceive) || (!bIsSend && bMethodReceive)) {
            for (var sKey in oData) {
              oResult[sKey] = oData[sKey];
            }
            return oResult;
          }
        }

        var sName = (bMethodReceive) ? "recvname" : "sendname";
        var sNameNot = (!bMethodReceive) ? "recvname" : "sendname";
        var sFunc = (bMethodReceive) ? "recvfunc" : "sendfunc";

        for (var i = 0; i < this._aFields.length; ++i) {
          var oField = this._aFields[i];
          oResult[oField[sName]] = oField[sFunc](oData[oField[sNameNot]]);
        }

        return oResult;
    }).bind(this));
  };

  JSONEntity.prototype.recv = function(vData) {
    return this.transmit(true, vData);
  };

  JSONEntity.prototype.send = function(vData) {
    return this.transmit(false, vData);
  };

  JSONEntity.prototype.validate = function(vData) {
    return HandleVDataParam(vData, this.validate.bind(this), (function(oData) {
      return this.type(oData) !== "unknown";
    }).bind(this));
  };

  JSONEntity.prototype.type = function(vData) {
    return HandleVDataParam(vData, this.type.bind(this), (function(oData) {
      var iSendFieldsCount = 0;
      var iRecvFieldsCount = 0;

      for (var sKey in oData) {
        var oRecvFind = this.find(sKey, null);
        var oSendFind = this.find(null, sKey);

        if (oRecvFind) {
          ++iRecvFieldsCount;
        }

        if (oSendFind) {
          ++iSendFieldsCount;
        }

        if (this._bStrict && !oRecvFind && !oSendFind) {
          return "unknown";
        }
      }

      if (iSendFieldsCount === this._aFields.length) {
        return "send";
      } else if (iRecvFieldsCount === this._aFields.length) {
        return "recv";
      }

      return "unknown";
    }).bind(this));
  };

  return JSONEntity;
}));