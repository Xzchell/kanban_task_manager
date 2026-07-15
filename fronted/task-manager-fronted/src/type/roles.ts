export interface IRoleOption {
    id: number;
    name: string;
    displayName: string;
    permission_level: number;
    description: string;
    activeColor: string;
}

export const AVAILABLE_ROLES: IRoleOption[] = [
    {
        id: 1,
        name: "owner",
        displayName: "Владелец доски",
        permission_level: 1,
        description: "Полный доступ к настройкам доски, колонкам и задачам.",
        activeColor: "#0d6fff"
    },
    {
        id: 2,
        name: "user",
        displayName: "Участник",
        permission_level: 2,
        description: "Может создавать задачи, двигать их и редактировать свои.",
        activeColor: "#00c950"
    },
    {
        id: 3,
        name: "spectator",
        displayName: "Наблюдающий",
        permission_level: 3,
        description: "Только просмотр задач доски без права на изменения.",
        activeColor: "#8b5cf6"
    }
];