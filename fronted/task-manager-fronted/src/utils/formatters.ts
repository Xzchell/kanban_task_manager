export const formatedDate = (date : string, monthStyle: 'short' | 'long' = 'short') => {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
        month: monthStyle,
        day: 'numeric',
        year: 'numeric'
    });
    return formatter.format(new Date(date));
}

export const formatFullName = (person: { first_name: string; last_name: string; middle_name?: string }) => {
    const firstInitial = person.first_name ? `${person.first_name[0]}.` : '';
    const middleInitial = person.middle_name ? `${person.middle_name[0]}.` : '';
    return `${person.last_name} ${firstInitial} ${middleInitial}`.trim();
}

export const formatToSqlTimestamp = (dateObj: Date | null | undefined): string | null => {
    if (!dateObj || isNaN(dateObj.getTime())) return null;

    const pad = (num: number) => String(num).padStart(2, '0');

    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
export const convertToSqlDateTime = (dateVal: unknown): string | null => {
    if (!dateVal) return null;

    if (dateVal instanceof Date) {
        return formatToSqlTimestamp(dateVal);
    }

    if (typeof dateVal === 'string') {
        try {
            let cleanStr = dateVal.trim();
            if (cleanStr.includes('(')) {
                cleanStr = cleanStr.split('(')[0].trim();
            }

            const parsedDate = new Date(cleanStr);

            if (!isNaN(parsedDate.getTime())) {
                return formatToSqlTimestamp(parsedDate);
            }
        } catch (error) {
            console.error("Ошибка парсинга даты:", error);
            return null;
        }
    }

    return null;
};

export const formatUtcTime = (dateStr: string | Date): string => {
    if (!dateStr) return "--:--";
    
    // Если пришел объект Date, переводим в строку
    const str = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
    const date = new Date(str);
    
    if (isNaN(date.getTime())) return "--:--";

    // Проверяем, содержит ли строка маркеры часового пояса (Z или +03:00)
    const hasTimeZone = str.includes('Z') || str.includes('+') || (str.includes('T') && str.length > 19);

    let hours: number;
    let minutes: number;

    if (hasTimeZone) {
        // Если строка с таймзоной (пришла из сокетов), берем чистый UTC
        hours = date.getUTCHours();
        minutes = date.getUTCMinutes();
    } else {
        // Если строка "сырая" из БД без таймзоны (из API), берем локальные значения,
        // чтобы JS не вычитал из нее смещение вашего пояса
        hours = date.getHours();
        minutes = date.getMinutes();
    }

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
};