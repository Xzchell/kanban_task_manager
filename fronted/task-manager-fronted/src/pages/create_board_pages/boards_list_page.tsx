import { useEffect } from "react"
import { useBoard } from "../../hook/useBoards";
import DefaultButton from "../../components/default_button";
import EmptyBoardsState from "./empty_board_list_page";

const BoardsListPage: React.FC = ({}) => {
    const { boards, fetchBoards, createBoard } = useBoard();
    
    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    if (!boards) return (<h1>Ошибка в получении данных</h1>)

    if (boards.length == 0){
        return (
            <EmptyBoardsState
            onCreateBoard={() => {
                createBoard({
                            title: "Новая доска",
                            description: "Описание новой доски",
                            type_name: "hakaton",
                            columns: [
                                { name: "Нужно сделать", position: 1 },
                                { name: "В работе", position: 2 },
                                { name: "На проверке", position: 3 },
                                { name: "Завершено", position: 4 }
                            ]
                        });
            }}
        />
        );
    }

    return(
        <>
        <div>Есть данные | {boards.length} <DefaultButton
                    onClick={() => {
                        createBoard({
                            title: "Новая доска",
                            description: "Описание новой доски",
                            type_name: "hakaton",
                            columns: [
                                { name: "Нужно сделать", position: 1 },
                                { name: "В работе", position: 2 },
                                { name: "На проверке", position: 3 },
                                { name: "Завершено", position: 4 }
                            ]
                        });
                    }}
                    text="Создать доску"
                /></div>
                <div>{boards.map(board => (
                    <div key={board.id}>
                        <h2>{board.title}</h2>
                        <p>{board.description}</p>
                        <p>Тип: {board.type.displayName}</p>
                        <p>Владелец: {board.owner.firstName} {board.owner.lastName}</p>
                        <p>Создано: {board.createdAt}</p>
                        {board.deadline && <p>Дедлайн: {board.deadline}</p>}
                    </div>
                ))}</div>
                </>
    );
}

export default BoardsListPage

const styles = {

}