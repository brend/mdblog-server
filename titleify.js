exports.titleify = function titleify(filename)  {
    return filename.split('-').join(' ')
                .replace(/\.md$/, '')
                .replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}