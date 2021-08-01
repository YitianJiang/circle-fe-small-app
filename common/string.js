export function findNum(string, character) {
    let num = 0;
    for (let i = 0; i < string.length; i++) {
        if (string[i] === character) num++;
    }
    return num
}