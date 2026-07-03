import { useEffect, useState } from "react";
import type { IItemProps } from "./list_items";
import { useUsers, type ISearchedUser } from "../hook/useUsers";
import { useAuth } from "../context/auth_context";
import ListItems from "./list_items";
import FormInput from "./form_input";

interface MemberSelectorProps {
    selectedMembers: IItemProps[];
    onMembersChange: (members: IItemProps[]) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ selectedMembers, onMembersChange }) => {
    const [userInput, setUserInput] = useState("");
    const [foundUser, setFoundUser] = useState<ISearchedUser | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchExecuted, setSearchExecuted] = useState(false);

    const user = useAuth().user;

    const { searchUser } = useUsers(user?.id, undefined);

    useEffect(() =>{
        const exactQuery = userInput.trim();

        if(exactQuery.length < 3){
            setFoundUser(null);
            setSearchExecuted(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            setSearchExecuted(true);
            try{
                const data = await searchUser(exactQuery);

                if (data && data.length > 0){
                    setFoundUser(data[0]);
                }
                else{
                    setFoundUser(null);
                }
            }
            catch(error){
                console.error("Ошибка при поиске", error);
            }
            finally{
                setIsSearching(false);
            }
        }, 450);
        return () => clearTimeout(delayDebounceFn);
    }, [userInput, user?.id]);

    const handleAddClick = () => {
        if (!foundUser) return;
        
        if(!selectedMembers.some(m => m.id == foundUser.id)){
            const newMember: IItemProps = {
                id: foundUser.id,
                name: foundUser.email
            };

            onMembersChange([...selectedMembers, newMember]);

            setUserInput("");
            setFoundUser(null);
            setSearchExecuted(false);
        }
    }
    return (
        <div style={styles.container}>
            {selectedMembers.length > 0 && (
                <div style={styles.listWrapper}>
                    <ListItems items={selectedMembers} onItemChange={onMembersChange} />
                </div>
            )}

            <div style={{ position: "relative", width: "100%" }}>
                <FormInput
                    id="member-search-input"
                    label="Пригласить участника"
                    type="text"
                    value={userInput}
                    onChange={setUserInput}
                    placeholder="Введите точный email или username"
                />
                {isSearching && <span style={styles.loader}>Поиск...</span>}
            </div>

            {userInput.trim() && !isSearching && foundUser && !selectedMembers.some(m => m.id == foundUser.id) && !(foundUser.email === user?.email || foundUser.username === user?.username) && (
                <div style={styles.foundCard}>
                    <div style={styles.userInfo}>
                        <div style={styles.avatarPlaceholder}>
                            {foundUser?.username ? foundUser.username.substring(0, 2).toUpperCase() : "??"}
                        </div>
                        <div style={styles.textBlock}>
                            <span style={styles.userName}>{foundUser.username}</span>
                            <span style={styles.userEmail}>{foundUser.email}</span>
                        </div>
                    </div>
                    {true && (
                        <button type="button" onClick={handleAddClick} style={styles.addButton}>
                            Добавить
                        </button>
                    )}
                </div>
            )}

            {userInput.trim().length >= 3 && !isSearching && searchExecuted && !foundUser && (
                <span style={styles.notFoundText}>
                    Пользователь с таким email или username не найден
                </span>
            )}
        </div>
    );
};

export default MemberSelector;

const styles = {
    container: { display: "flex", flexDirection: "column" as const, gap: "10px", width: "100%" },
    listWrapper: { marginBottom: "4px" },
    loader: { position: "absolute" as const, right: "16px", top: "40px", fontSize: "13px", color: "#94a3b8", fontWeight: 500 },
    foundCard: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderRadius: "14px", backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0", marginTop: "2px", width: "100%", boxSizing: "border-box" as const,
    },
    userInfo: { display: "flex", alignItems: "center", gap: "12px" },
    avatarPlaceholder: {
        width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: 700, color: "#64748b", fontFamily: "var(--font-rounded)"
    },
    textBlock: { display: "flex", flexDirection: "column" as const },
    userName: { fontSize: "14px", fontWeight: 700, color: "#1e293b", fontFamily: "var(--font-rounded), sans-serif" },
    userEmail: { fontSize: "12px", color: "#64748b" },
    addButton: {
        padding: "8px 16px", borderRadius: "10px", backgroundColor: "#7177f4", color: "#ffffff",
        border: "none", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-rounded), sans-serif",
        cursor: "pointer"
    },
    notFoundText: { fontSize: "12px", color: "#ef4444", fontWeight: 600, marginTop: "2px", paddingLeft: "4px" }
};