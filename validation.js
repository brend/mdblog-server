exports.filenameIsValid = function (filename) {
    var rg1=/^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    var rg2=/^\./; // cannot start with dot (.)
    var rg3=/^(nul|aux|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    
    console.log('is this filename valid:', filename);

    return rg1.test(filename)&&!rg2.test(filename)&&!rg3.test(filename);
  }