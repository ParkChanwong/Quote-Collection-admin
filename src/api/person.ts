import { api } from './axios';
import type { CategoryItem } from './category';

export type Person = { id: number; name: string; countryName: string; periodName: string; fieldName: string };
export type PersonValues = { name: string; countryId: number; periodId: number; fieldId: number };
export const personApi = {
    async list(page: number, signal?: AbortSignal) {
        return (await api.get<{ result: Person[]; total: number; totalPage: number }>('/person', { params: { page }, signal })).data;
    },
    async all(signal?: AbortSignal) {
        return (await api.get<{ result: Person[] }>('/person', { signal })).data.result;
    },
    async options(type: 'country' | 'period' | 'field', signal?: AbortSignal) {
        return (await api.get<{ result: CategoryItem[] }>(`/${type}`, { signal })).data.result;
    },
    create: (values: PersonValues) => api.post('/person', values),
    update: (id: number, values: PersonValues) => api.put(`/person/${id}`, values),
    remove: (id: number) => api.delete(`/person/${id}`),
};
