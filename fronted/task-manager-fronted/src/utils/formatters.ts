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