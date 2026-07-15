import { useEffect, useState } from "react"
import DefaultButton from "../../components/default_button";
import EmptyBoardsState from "./empty_board_list_page";
import CustomModal from "../../components/custom_modal";
import { BoardTypeSelector } from "./board_type_selector";
import BoardCard from "./board_card";
import { AnimatedBackground } from "../../components/animated_background";
import SearchBar from "../../components/search_task_bar";
import { Plus } from "lucide-react";
import { useBoard } from "../../hook/useBoards";

const BoardsListPage: React.FC = () => {
    const { boards, fetchBoards, loading, searchQuery, setSearchQuery, filteredBoards } = useBoard();

    const [isModalOpen, setModalOpen] = useState(false);
    
    useEffect(() => {
        fetchBoards();
    }, []);

    const renderPages = () => {
        if (loading) {
            const skeletonArray = Array(6).fill(null);
            return (
                <div style={styles.contentLayer}>
                    <div style={styles.stickyHeader}>
                        <div style={styles.controlsRow}>
                            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Поиск рабочего пространства..." /> 
                            <DefaultButton
                                onClick={() => setModalOpen(true)}
                                icon={<Plus size={20}/>}
                                text="Создать доску"                
                            />
                        </div>                    
                    </div>

                    <div style={styles.gridContainer}>
                        {skeletonArray.map((_, index) => (
                            <BoardCard key={`skeleton-${index}`} isLoading={true} />
                        ))}
                    </div>
                </div>
            );
        }

        if (!boards || boards.length === 0) {
            return (
                <EmptyBoardsState onBoardCreated={fetchBoards} />
            );
        }

        return (
            <div style={styles.contentLayer}>
                <div style={styles.stickyHeader}>
                    <div style={styles.controlsRow}>
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Поиск рабочего пространства..." /> 
                        <DefaultButton
                            onClick={() => {
                                setModalOpen(true);
                            }}
                            icon={<Plus size={20}/>}
                            text="Создать доску"                
                        />
                    </div>                    
                </div>

                <div style={styles.gridContainer}>
                    {filteredBoards.map(board => (
                        <BoardCard
                            key={board.id}
                            board={board}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.backgroundFixedWrapper}>
                <AnimatedBackground />
            </div>
            
            <div style={styles.scrollContainer}>
                {renderPages()}
            </div>

            <CustomModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)}
                width="50vw"
                height="80vh"
            >
                <BoardTypeSelector 
                    onClose={() => setModalOpen(false)}
                    onSuccess={fetchBoards}
                />
            </CustomModal>
        </div>
    );
}

export default BoardsListPage;

const styles = {
    container: {
        position: "relative" as const,
        height: "100vh",
        width: "100vw",
        overflow: "hidden", 
        boxSizing: "border-box" as const,
    },
    backgroundFixedWrapper: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none" as const,
    },
    scrollContainer: {
        position: "relative" as const,
        zIndex: 10,
        height: "100vh",
        width: "100%",
        overflowY: "auto" as const,
    },
    contentLayer: {
        position: "relative" as const,
        display: "flex",
        flexDirection: "column" as const,
        gap: "28px",
        marginLeft: "120px",
        marginRight: "120px",
    },
    stickyHeader: {
        position: "sticky" as const,
        top: 0,
        zIndex: 20,
        paddingTop: "15px"
    },
    controlsRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        justifyContent: "left",
        gap: "20px",
        width: "100%"
    },
    searchIcon: {
        position: "absolute" as const,
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none" as const,
    },
    searchInput: {
        width: "100%",
        height: "46px",
        backgroundColor: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "14px",
        paddingLeft: "48px",
        paddingRight: "16px",
        color: "#ffffff",
        fontSize: "15px",
        outline: "none",
        transition: "all 0.2s ease-in-out",
        boxSizing: "border-box" as const,
        backdropFilter: "blur(6px)",
    },
    sectionHeader: {
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        paddingBottom: "12px",
        marginTop: "10px",
    },
    titleText: {
        margin: 0,
        color: "#ffffff",
        fontSize: "20px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
    },
    gridContainer: {
        display: "flex",
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        gap: "24px",
        paddingBottom: "60px"
    },
    centerContent: {
        position: "relative" as const,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh"
    }
}