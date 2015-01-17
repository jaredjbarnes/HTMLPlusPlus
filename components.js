var fileSystem = require("fs");
var path = require("path");

var PATH = "../components";

var stat = fileSystem.statSync(PATH);

if (stat.isDirectory()) {
    var fileNames = fileSystem.readdirSync(PATH);

    var output = [];

    fileNames.forEach(function (fileName) {
        var filePath = PATH + "/" + fileName;
        if (path.extname(fileName).toLowerCase() === ".html") {
            try {
                output.push(fileSystem.readFileSync(filePath));
            } catch (e) {

            }
        }
    });

    fileSystem.writeFileSync("../app.html", output.join("\r\n"));
}