import { api } from './axios';

export type QuoteDTO = { id: number; personName: string; themeName: string; quote: string };
export type QuoteSubmitValues = { personId: number; themeId: number; quote: string };
export type SearchType = 'person' | 'theme' | 'content';
export type QuoteSearch = { type: SearchType; keyword: string };
export type Option = { id: number; name: string };
export const PAGE_SIZE = 10;

export const quoteApi = {
    async list(page: number, search: QuoteSearch, signal?: AbortSignal) {
        const { data } = await api.get<{ result: QuoteDTO[]; total: number; totalPage: number }>(search.keyword ? `/quote/${search.type}` : '/quote', {
            params: search.keyword ? { keyword: search.keyword } : { page }, signal,
        });
        return { items: data.result, total: search.keyword ? data.result.length : data.total, totalPages: search.keyword ? Math.ceil(data.result.length / PAGE_SIZE) : data.totalPage };
    },
    create: (values: QuoteSubmitValues) => api.post('/quote', values),
    update: (id: number, values: QuoteSubmitValues) => api.put(`/quote/${id}`, values),
    remove: (id: number) => api.delete(`/quote/${id}`),
};

export const optionApi = {
    async persons(signal?: AbortSignal) {
        return (await api.get<{ result: Option[] }>('/person', { signal })).data.result;
    },
    async themes(signal?: AbortSignal) {
        return (await api.get<{ result: Option[] }>('/theme', { signal })).data.result;
    },
};
