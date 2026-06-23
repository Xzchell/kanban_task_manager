import { useCallback, useState } from "react";
import { api } from "../api_axios";
import type { ITags } from "../components/task_card";

export const useTags = (userId: number | undefined) => {
    const [allTags, setAllTags] = useState<ITags[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllTags = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`?endpoint=tasks&action=get_all_tags&user_id=${userId}`);
            const parsedTags = data.map((t: any) => ({
                id: Number(t.id),
                name: t.name,
                tag_color: t.tag_color,
                background_color: t.background_color
            }));

            setAllTags(parsedTags);
            setError(null);
        } catch (err) {
            console.error("Ошибка при загрузке тегов:", err);
            setError("Ошибка при загрузке тегов");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { allTags, fetchAllTags, loading, error };
};
