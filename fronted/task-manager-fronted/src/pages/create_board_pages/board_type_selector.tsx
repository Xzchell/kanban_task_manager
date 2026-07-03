import React, { useState } from "react";
import { Zap, Building, X, Users, RefreshCw, Timer, ShieldCheck, BarChart3, ArrowRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "../../components/progress_bar";
import FormInput from "../../components/form_input";
import { DeadlinePicker } from "../../components/deadline_picker/deadline_picker";
import type { IItemProps } from "../../components/list_items";
import ListItems from "../../components/list_items";
import MemberSelector from "../../components/selection_user";
import { useBoard, type IBoardCreate, type IColumns, type IInvitedUser, TYPE_BOARD, type BoardTypeKind } from "../../hook/useBoards";
import DefaultButton from "../../components/default_button";

interface BoardTypeSelectorProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BoardTypeSelector: React.FC<BoardTypeSelectorProps> = ({ onClose, onSuccess }) => {
    const { createBoard } = useBoard();
    
    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<BoardTypeKind | null>(null);
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
    
    const [title, setTitle] = useState("");
    const [desc, setDescs] = useState("");
    const [column, setColumn] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<IItemProps[]>([]);

    const startColumns = selectedType === TYPE_BOARD.hakaton
    ? [{id: 0, name: 'Идеи'}, {id: 1, name: 'Задачи'}, {id: 2, name: 'В разработке'}, {id: 3, name: "Тестирование"}, {id: 4, name: 'Готово'}] 
    : [{id: 0, name: 'К исполнению'}, {id: 1, name: 'В работе'}, {id: 2, name: 'Ревью'}, {id: 3, name: "Готово"}];

    const [columns, setColumns] = useState<IItemProps[]>(startColumns);
    const [deadline, setDeadline] = useState<Date | null>(new Date());

    const onSelectType = (type: BoardTypeKind) => {
        setSelectedType(type);
        setAnimationDirection('next');
        setStep(1);
    };

    const paramsTitle = [
        { title: "Новая доска", description: "Выберите тип пространства для вашей команды" },
        { title: "Настройте доску", description: "Заполните параметры доски и пригласите участников" },
    ];

    const headerVariants = {
        initial: (direction: 'next' | 'prev') => ({
            opacity: 0,
            y: direction === 'next' ? 16 : -16,
            filter: 'blur(4px)'
        }),
        animate: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)'
        },
        exit: (direction: 'next' | 'prev') => ({
            opacity: 0,
            y: direction === 'next' ? -16 : 16,
            filter: 'blur(4px)'
        })
    };

    const onCreateBoard = async () => {
        if (title.length === 0 || columns.length === 0 || !selectedType) return;

        const formattedColumns: IColumns[] = columns.map((col, index) => ({
            name: col.name.trim(),
            position: index
        }));

        const invitedMembers: IInvitedUser[] = selectedMembers.map(member => ({
            user_id: member.id,
            role_id: 2
        }));

        const newBoard : IBoardCreate = {
            title: title.trim(),
            type_name: selectedType,
            columns: formattedColumns,
            deadline: deadline ? deadline.toISOString() : null,
            invited_users: invitedMembers,
            description: desc
        }

        await createBoard(newBoard);
        onSuccess();

        onClose();
    }

    const prevArrow = () => {
        if (step === 0) return null;
        return (
            <button
                type="button"
                onClick={handlePrevStep}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ArrowRight size={20} color="#6b7280" style={{ transform: 'rotate(180deg)' }} />
            </button>
        );
    };

    const handlePrevStep = () => {
        if (step > 0) {
            setAnimationDirection('prev');
            setStep((prev) => prev - 1);
        }
    };

    const btnUIAdd = () => {
        return(
            <button
                type="button"
                onClick={btnAddColumn}
                style={styles.inlineAddButton}
            >
                <Plus size={18} color="#ffffff" />
            </button>
        );
    }

    const btnAddColumn = () => {
        if (!column.trim()) return;

        const newColumn: IItemProps = {
            id: columns.length,
            name: column.trim()
        }

        setColumns([...columns, newColumn]);
        setColumn("");
    }

    const typeBoardSelection = () => {
        return (
            <motion.div
                key="step-selection"
                style={styles.typeBoardSelection}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", damping: 20, stiffness: 120 }}
            >
                <motion.div
                    whileHover={{ y: -4, borderColor: "#7177f4", boxShadow: "0 12px 25px rgba(113, 119, 244, 0.08)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelectType(TYPE_BOARD.hakaton)}
                    style={styles.typeCard}
                >
                    <div style={styles.iconHakatonWrapper}><Zap size={24} color="#fff" /></div>
                    <h3 style={styles.cardTitle}>Хакатон доска</h3>
                    <p style={styles.cardDescription}>Для краттковременных спринтов, соревнований и MVP.</p>
                    <div style={styles.featuresList}>
                        <div style={styles.featureItem}><Users size={14} style={styles.featureIcon} /> <span>Вместимость: <b>до 5 чел.</b></span></div>
                        <div style={styles.featureItem}><RefreshCw size={14} style={styles.featureIcon} /> <span>Онлайн обновление</span></div>
                        <div style={styles.featureItem}><Timer size={14} style={styles.featureIcon} /> <span>Таймер дедлайна</span></div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -4, borderColor: "#00c79a", boxShadow: "0 12px 30px rgba(0, 199, 154, 0.15)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelectType(TYPE_BOARD.company)}
                    style={styles.typeCard}
                >
                    <div style={styles.iconBusinessWrapper}><Building size={24} color="#fff" /></div>
                    <h3 style={styles.cardTitle}>Бизнес доска</h3>
                    <p style={styles.cardDescription}>Для долгосрочных проектов и регулярных задач компании.</p>
                    <div style={styles.featuresList}>
                        <div style={styles.featureItem}><Users size={14} style={styles.featureIconBiz} /> <span>Вместимость: <b>до 20 чел.</b></span></div>
                        <div style={styles.featureItem}><ShieldCheck size={14} style={styles.featureIconBiz} /> <span>Роли и доступы</span></div>
                        <div style={styles.featureItem}><BarChart3 size={14} style={styles.featureIconBiz} /> <span>Спринт-отчёты</span></div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    const boardForm = (type : string) => {
        if (type === TYPE_BOARD.hakaton) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <FormInput
                        id="board-name"
                        label="Название доски"
                        type="text"
                        value={title}
                        onChange={setTitle}
                        placeholder="Hakaton IT"
                        required
                    />
                    <ListItems
                        items={columns}
                        onItemChange={setColumns}
                    />
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'end', gap: '10px'}}>
                        <FormInput
                            id="column-name"
                            label="Название колонки"
                            type="text"
                            value={column}
                            onChange={setColumn}
                            placeholder="Тестирование"
                            required
                        />
                        {btnUIAdd()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Дедлайн проекта
                        </label>
                        <DeadlinePicker
                            value={deadline} 
                            onChange={setDeadline} 
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <MemberSelector
                            selectedMembers={selectedMembers} 
                            onMembersChange={setSelectedMembers}
                        />
                    </div>
                    
                    <DefaultButton
                        onClick={onCreateBoard}
                        text="Создать пространство"
                        fullWidth={true}
                    />
                    
                    <div style = {{height: "20px"}}/>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={styles.modalContent}>
            <button onClick={onClose} style={styles.closeButton}>
                <X size={18} color="#64748b" />
            </button>

            <div style={styles.modalHeader}>
                <div style={{ minHeight: "64px", width: "100%", position: "relative" }}>
                    <AnimatePresence mode="wait" custom={animationDirection}>
                        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px'}}>
                            {prevArrow()}
                            <motion.div
                                key={`title-${step}`}
                                custom={animationDirection}
                                variants={headerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                style={styles.textAnimationContainer}
                            >
                                <h2 style={styles.modalTitle}>{paramsTitle[step]?.title}</h2>
                                <label style={styles.modalSubLabel}>{paramsTitle[step]?.description}</label>
                            </motion.div>
                        </div>
                    </AnimatePresence>
                </div>
                
                <div style={{ width: "30%", marginTop: "8px" }}>
                    <ProgressBar currentStep={step} totalSteps={2} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && typeBoardSelection()}
                {step === 1 && (
                    <motion.div
                        key="step-form"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 220 }}
                        style={{ color: "#64748b" }}
                    >
                        {boardForm(selectedType || "")}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    modalContent: {
        position: "relative" as const,
        padding: "20px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "32px",
        backgroundColor: "#ffffff",
        height: "100%",
        boxSizing: "border-box" as const,
    },
    closeButton: {
        position: "absolute" as const,
        top: "36px",
        right: "36px",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: "#f1f5f9",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 30
    },
    modalHeader: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start",
        gap: "6px",
        width: "100%"
    },
    modalTitle: {
        margin: 0,
        fontSize: "26px",
        fontWeight: 800,
        fontFamily: "var(--font-rounded), sans-serif",
        color: "#1e293b",
    },
    modalSubLabel: {
        color: "#94a3b8",
        fontSize: "15px",
        fontWeight: 500,
    },
    typeBoardSelection: {
        display: "flex",
        gap: "24px",
        width: "100%",
        flexDirection: "row" as const,
        alignItems: "stretch",
    },
    typeCard: {
        display: "flex",
        flex: 1,
        flexDirection: "column" as const,
        alignItems: "flex-start",
        padding: "32px 28px",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        textAlign: "left" as const,
    },
    iconHakatonWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "54px",
        height: "54px",
        borderRadius: "16px",
        backgroundColor: "#6366f1",
        marginBottom: "24px",
        boxShadow: "0 8px 20px rgba(99, 102, 241, 0.2)",
    },
    iconBusinessWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "54px",
        height: "54px",
        borderRadius: "16px",
        backgroundColor: "#00c79a",
        marginBottom: "24px",
        boxShadow: "0 8px 20px rgba(0, 199, 154, 0.2)",
    },
    cardTitle: {
        margin: "0 0 12px 0",
        fontSize: "18px",
        fontWeight: 700,
        color: "#1e293b",
    },
    cardDescription: {
        margin: "0 0 24px 0",
        fontSize: "14px",
        color: "#64748b",
        lineHeight: "1.6",
        minHeight: "68px"
    },
    featuresList: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "10px",
        width: "100%",
        borderTop: "1px solid #f1f5f9",
        paddingTop: "20px",
    },
    featureItem: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "13px",
        color: "#334155",
    },
    featureIcon: {
        color: "#6366f1",
        flexShrink: 0,
    },
    featureIconBiz: {
        color: "#00c79a",
        flexShrink: 0,
    },
    textAnimationContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
    },
    inlineAddButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50px",
        minWidth: "50px",
        height: "50px",
        width: "50px",
        borderRadius: "12px",
        backgroundColor: "#7177f4",
        border: "none",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    }
};