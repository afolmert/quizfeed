

export function startsWith(s: string, prefix: string): boolean {
    return s.indexOf(prefix) === 0;
}

export function endsWith(s: string, suffix: string): boolean {
	return s.indexOf(suffix, s.length - suffix.length) !== -1;

}

export function isNullOrEmpty(s: string): boolean {
	return !s && s.length == 0;
}

export function isNullOrWhitespace(s: string): boolean {
	return !s && s.trim().length == 0;
}


export function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

}


export function stripQuotes(s: string): string {

	while ((this.startsWith(s, `'`) && this.endsWith(s, `'`))
			|| ((this.startsWith(s, `"`) && this.endsWith(s, `"`)))) {
		s = s.substr(1, s.length - 2);
	}
	return s;
}

export function shuffleArray(array: any[]): any[] {
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
