export const TimeWelcome = () => {
    const timeNow = new Date();
    const hours = timeNow.getHours();

    switch (true) {
        case (6 <= hours && hours < 12): return "Доброе утро, ";
        case (12 <= hours && hours < 18): return "Добрый день, ";
        case (18 <= hours && hours < 24): return "Добрый вечер, ";
        default: return "Доброй ночи, ";
    }
}
