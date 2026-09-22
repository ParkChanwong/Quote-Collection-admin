export const normalizeSearch = (value: string) => value.trim().toLowerCase();

export const matchesSearch = (value: string, keyword: string) =>
    normalizeSearch(value).includes(normalizeSearch(keyword));
