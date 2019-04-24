var IntToString = function(v) { return typeof v === "number" ? v.toString(10) : ""; };
var StringToInt = function(v) { return typeof v === "string" ? parseInt(v, 10) : 0; };
var ReturnParam = function(v) { return v; };
var StringToString = function(v) { return String(v || ""); };

var oEntity = new JSONEntity();

oEntity.field("Name", "f0", StringToString);
oEntity.field("Age", "f1", StringToInt, IntToString);
oEntity.field("Height", "f2", StringToInt, IntToString);
oEntity.field("Weight", "f3", StringToInt, IntToString);

var aRecvData = [
  { f0: "John", f1: "19", f2: "183", f3: "69" },
  { f0: "Esther", f1: "20", f2: "167", f3: "58" },
  { f0: "Jesus", f1: "0", f2: "185", f3: "50" }
];

var aSendData = oEntity.recv(aRecvData);

console.log(aSendData);
console.log(oEntity.send(aSendData));
console.log(oEntity.validate(aSendData));
console.log(oEntity.validate(aRecvData));