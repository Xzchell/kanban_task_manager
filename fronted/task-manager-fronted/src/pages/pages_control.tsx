import type { ReactNode } from "react";
import { useAuth } from "../context/auth_context";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useBoard } from "../hook/useBoards";
import { ProfilePage } from "./my_profile_page";
import LoginRegistrPage from "./login_registr_pages/login_registr_page";
import BoardsListPage from "./create_board_pages/boards_list_page";
import BoardTasksList from "./board_workplace/board_tasks_list";
import FloatingSidebar from "../components/sidebar/floating_sidebar";
import { theme } from "../themes/themes";
import BoardMembersPage from "./board_workplace/board_members_page/board_members_page";
import { BoardSocketSync } from "../context/board_socket_sync";
import BoardSettingsPage from "./board_workplace/board_settings_page/board_settings_page";
import { InviteWrapper } from "./invite_page/InviteWrapper";
import GlobalSettingsPage from "./global_settings_page";
import ChangePasswordPage from "./ForgotPasswordWidget";

type AuthorizedLayoutProps = {
    children: ReactNode;
};

const AuthorizedLayout = ({ children }: AuthorizedLayoutProps) => {
    if (!location.pathname.startsWith("/invite")){
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
                <FloatingSidebar/>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        );        
    }
    return(
        <>{children}</>
    );
};

const ProtectedBoardRoute = ({ children }: { children: ReactNode }) => {
    const { selectedBoard, loading } = useBoard();
    const location = useLocation();

    const isBoardRoute = location.pathname.startsWith('/board-');

    if (isBoardRoute && !selectedBoard && !loading) {
        return <Navigate to="/boards" replace />;
    }
    
    return (
        <BoardSocketSync>
            {children}
        </BoardSocketSync>
    );
};

const PagesControl = () => {
    const { isAuth } = useAuth();
    const location = useLocation();

    return (
        <div style={styles.containerStyles}>
            <AnimatePresence mode="wait">
                {!isAuth ? (
                    <motion.div
                        key="login-page"
                        {...animProps}
                        style={styles.pageStyles}
                    >
                        <LoginRegistrPage />
                    </motion.div>
                ) : (
                    <AuthorizedLayout key="auth-zone">
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                <Route path="/boards" element={
                                    <motion.div {...animProps}>
                                        <BoardsListPage/>
                                    </motion.div>
                                } />
                                <Route path="/settings" element={
                                    <motion.div {...animProps}>
                                        <GlobalSettingsPage/>
                                    </motion.div>
                                } />
                                <Route path="/profile" element={
                                    <motion.div {...animProps}>
                                        <ProfilePage />
                                    </motion.div>
                                } />
                                
                                <Route path="/board-tasks" element={
                                    <ProtectedBoardRoute>
                                        <motion.div {...animProps}>
                                            <BoardTasksList />
                                        </motion.div>
                                    </ProtectedBoardRoute>
                                } />
                                <Route path="/profile-changepassword" element={
                                    <ProtectedBoardRoute>
                                        <motion.div {...animProps}>
                                            <ChangePasswordPage />
                                        </motion.div>
                                    </ProtectedBoardRoute>
                                } />
                                <Route path="/board-members" element={
                                    <ProtectedBoardRoute>
                                        <motion.div {...animProps}>
                                            <BoardMembersPage/>
                                        </motion.div>
                                    </ProtectedBoardRoute>
                                } />
                                <Route path="/board-settings" element={
                                    <ProtectedBoardRoute>
                                        <motion.div {...animProps}>
                                            <BoardSettingsPage/>
                                        </motion.div>
                                    </ProtectedBoardRoute>
                                } />
                                <Route path="/invite/accept" element={
                                    <motion.div {...animProps}>
                                        <InviteWrapper />
                                    </motion.div>
                                } />

                                <Route path="*" element={<Navigate to="/boards" />} />
                            </Routes>
                        </AnimatePresence>
                    </AuthorizedLayout>
                )}
            </AnimatePresence>
        </div>
    );
};

const animProps = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.15, ease: easeInOut }
};

const styles = {
    containerStyles :{
        position: "relative" as const,
        width: "100%",
        height: "100vh",
        overflow: "hidden" as const,
        backgroundColor: theme.colors.bg.main,
    },
    pageStyles : {
        width: "100%",
        height: "100%"
    }
}

export default PagesControl;