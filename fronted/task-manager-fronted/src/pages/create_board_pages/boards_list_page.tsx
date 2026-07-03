import { useEffect, useState } from "react"
import { useBoard } from "../../hook/useBoards";
import DefaultButton from "../../components/default_button";
import EmptyBoardsState from "./empty_board_list_page";
import CustomModal from "../../components/custom_modal";
import { BoardTypeSelector } from "./board_type_selector";

const BoardsListPage: React.FC = ({}) => {
    const { boards, fetchBoards, createBoard } = useBoard();
    const [isModalOpen, setModalOpen] = useState(false);
    
    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    if (!boards) return (<h1>Ошибка в получении данных</h1>)

    if (boards.length == 0){
        return (
            <EmptyBoardsState onBoardCreated={fetchBoards} />
        );
    }

    return(
        <>
        <div>Есть данные | {boards.length} <DefaultButton
                    onClick={() => {
                        setModalOpen(true);
                    }}
                    text="Создать доску"
                /></div>
                <div style={{display: 'flex', flexDirection: 'row'}}>{boards.map(board => (
                    <div key={board.id}>
                        <h2>{board.title}</h2>
                        <p>{board.description}</p>
                        <p>Тип: {board.type.displayName}</p>
                        <p>Владелец: {board.owner.firstName} {board.owner.lastName}</p>
                        <p>Создано: {board.createdAt}</p>
                        {board.deadline && <p>Дедлайн: {board.deadline}</p>}
                    </div>
                ))}</div>
                <CustomModal 
                    isOpen={isModalOpen} 
                    onClose={() => setModalOpen(false)}
                    width="50vw"
                    height="80vh"
                    children={
                        <BoardTypeSelector 
                            onClose={() => setModalOpen(false)}
                            onSuccess={fetchBoards}
                        />
                    }
                />
                </>
    );
}

export default BoardsListPage

const styles = {

}