exports.isInteger = function(val) {
    var intRegex = /^\d+$/;
    if (intRegex.test(val)) return true;
    else return false;
};

// Handle any errors on callback
exports.copyFile = function copyFile(fs, source, target, callback) {
    var cbCalled = false;
    var rd = fs.createReadStream(source);
        rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
        wr.on("error", function(err) {
        done(err);
    });
        wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
          callback(err);
          cbCalled = true;
        }
    }
};