import React, { useEffect, useState } from "react";
import { Zap, Building, X, Users, RefreshCw, Timer, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "../../components/progress_bar";
import FormInput from "../../components/form_input";
import { DeadlinePicker } from "../../components/deadline_picker/deadline_picker";
import MemberSelector from "../../components/selection_user";
import { useBoard, type IBoardCreate, type IColumns, type IInvitedUser, TYPE_BOARD, type BoardTypeKind, type IBoardMember, type ITimePoint } from "../../hook/useBoards";
import DefaultButton from "../../components/default_button";
import TimePointsFormManager from "../../components/time_points_form_manager";
import { useAlert } from "../../context/alert_context";
import ColumnsFormManager from "../../components/columns_selector/columns_manager";

interface BoardTypeSelectorProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BoardTypeSelector: React.FC<BoardTypeSelectorProps> = ({ onClose, onSuccess }) => {
    const { createBoard } = useBoard();
    const { showAlert, hideAlert } = useAlert();
    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<BoardTypeKind | null>(null);
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
    
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    
    const [selectedMembers, setSelectedMembers] = useState<IBoardMember[]>([]);
    const [timePoints, setTimePoints] = useState<ITimePoint[]>([]);

    const getStartColumns = (type: BoardTypeKind | null): IColumns[] => {
        if (type === TYPE_BOARD.hakaton) {
            return [
                { id: 0, name: 'Идеи', position: 0 }, 
                { id: 1, name: 'Задачи', position: 1 }, 
                { id: 2, name: 'В разработке', position: 2 }, 
                { id: 3, name: "Тестирование", position: 3 }, 
                { id: 4, name: 'Готово', position: 4 }
            ];
        }
        return [
            { id: 0, name: 'К исполнению', position: 0 }, 
            { id: 1, name: 'В работе', position: 1 }, 
            { id: 2, name: 'Ревью', position: 2 }, 
            { id: 3, name: "Готово", position: 3 }
        ]; 
    };

    const [columns, setColumns] = useState<IColumns[]>(getStartColumns(selectedType));
    const [deadline, setDeadline] = useState<Date | null>(new Date());

    const onSelectType = (type: BoardTypeKind) => {
        setSelectedType(type);
        setAnimationDirection('next');
        setStep(1);
    };

    useEffect(() => {
        setColumns(getStartColumns(selectedType));
    }, [selectedType]);

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
        const activeColumns = columns.filter(col => col.name.trim().length > 0);

        if (title.length === 0 || activeColumns.length === 0 || !selectedType) {
            showAlert(
                "Ошибка создания рабочего пространства",
                "Пожалуйста, заполните все поля.",
                [
                    { text: "Окей", status: "secondary", onClick: () => { hideAlert(); } },
                ],
            );    
            return;           
        }

        const formattedColumns: IColumns[] = activeColumns.map((col, index) => ({
            name: col.name.trim(),
            position: index,
        }));

        const invitedMembers: IInvitedUser[] = selectedMembers.map(member => ({
            user_id: member.id,
            role_id: member.role?.id ?? 2
        }));

        const newBoard : IBoardCreate = {
            title: title.trim(),
            type_name: selectedType,
            columns: formattedColumns,
            deadline: deadline ? deadline.toISOString() : null,
            invited_users: invitedMembers,
            description: desc,
            milestones: timePoints
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
                    <p style={styles.cardDescription}>Для кратковременных спринтов, соревнований и MVP.</p>
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
                </motion.div>
            </motion.div>
        );
    };

    const boardForm = (type : string) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <FormInput
                    id="board-name"
                    label="Название доски"
                    type="text"
                    value={title}
                    onChange={setTitle}
                    placeholder={type === TYPE_BOARD.hakaton ? "Hakaton IT" : "Разработка ПО"}
                    required
                    maxLength={100}
                />

                <FormInput
                    id="desc-board"
                    label="Краткое описание"
                    onChange={setDesc}
                    value={desc}
                    placeholder="Пару слов о доске..."
                    type="textarea"
                    maxLength={500}
                />

                <ColumnsFormManager
                    columns={columns}
                    onChange={setColumns}
                />

                {type === TYPE_BOARD.hakaton && (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <label style={{ fontSize: "12px", fontWeight: 700, color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Дедлайн проекта
                            </label>
                            <DeadlinePicker
                                value={deadline} 
                                onChange={setDeadline} 
                            />
                        </div>
                        <div style={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}>
                            <TimePointsFormManager 
                                boardDeadline={deadline}
                                timePoints={timePoints} 
                                onChange={setTimePoints} 
                            />
                        </div>
                    </>
                )}

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
                
                <div style={{height: "20px"}}/>
            </div>
        );
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
        height: "100%",
        boxSizing: "border-box" as const,
    },
    textarea: {
        padding: '12px',
        borderRadius: '10px',
        border: '1.5px solid #eee',
        fontSize: '16px',
        outline: 'none',
        minHeight: '80px',
        resize: 'none' as const,
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
        zIndex: 20
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
    }
};