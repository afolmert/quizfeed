function startsWith(s, prefix) {
    return s.indexOf(prefix) === 0;
}
exports.startsWith = startsWith;
function endsWith(s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
}
exports.endsWith = endsWith;
function isNullOrEmpty(s) {
    return !s && s.length == 0;
}
exports.isNullOrEmpty = isNullOrEmpty;
function isNullOrWhitespace(s) {
    return !s || s.trim().length == 0;
}
exports.isNullOrWhitespace = isNullOrWhitespace;
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
exports.escapeRegExp = escapeRegExp;
function stripQuotes(s) {
    while ((this.startsWith(s, "'") && this.endsWith(s, "'"))
        || ((this.startsWith(s, "\"") && this.endsWith(s, "\"")))) {
        s = s.substr(1, s.length - 2);
    }
    return s;
}
exports.stripQuotes = stripQuotes;
function shuffleArray(array) {
    var counter = array.length, temp, index;
    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;
        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
exports.shuffleArray = shuffleArray;
