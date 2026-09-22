import { api } from './axios';

export type CategoryType = 'country' | 'period' | 'field' | 'theme';
export type CategoryItem = { id: number; name: string };
export type CategoryList = { result: CategoryItem[]; total: number; totalPage: number };

export const categoryApi = {
    async list(type: CategoryType, page: number, signal?: AbortSignal) {
        return (await api.get<CategoryList>(`/${type}`, { params: { page }, signal })).data;
    },
    create: (type: CategoryType, name: string) => api.post(`/${type}`, { name }),
    update: (type: CategoryType, id: number, name: string) => api.put(`/${type}/${id}`, { name }),
    remove: (type: CategoryType, id: number) => api.delete(`/${type}/${id}`),
};
