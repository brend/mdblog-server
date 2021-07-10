exports.titleify = function (filename)  {
    return filename.split('-').join(' ')
                .replace(/\.md$/, '')
                .replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}

exports.filenameify = function (title) {
    return title.replace(/ /g, '-')
            .toLowerCase()
            + ".md";
}