export function capitalizeFirstLetter(str: string): string {
    // Check for empty string
    if (!str) {
        return str;
    }
    // Capitalize the first letter and concatenate with the rest of the string
    return str.charAt(0).toUpperCase() + str.slice(1);
}
