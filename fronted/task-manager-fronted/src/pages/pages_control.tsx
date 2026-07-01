import type { ReactNode } from "react";
import TaskList from "./table_tasks_page";
import { useAuth } from "../context/auth_context";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import TeamPage from "./my_team_page";
import SideBar from "../components/side_bar";
import { ProfilePage } from "./my_profile_page";
import LoginRegistrPage from "./login_registr_pages/login_registr_page";
import BoardsListPage from "./create_board_pages/boards_list_page";

type AuthorizedLayoutProps = {
    children: ReactNode;
};

const AuthorizedLayout = ({ children }: AuthorizedLayoutProps) => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <SideBar />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {children}
            </div>
        </div>
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
                                <Route path="/tasks" element={
                                    <motion.div {...animProps}>
                                        {/*<TaskList />*/}
                                        <BoardsListPage/>
                                    </motion.div>
                                } />
                                <Route path="/team" element={
                                    <motion.div {...animProps}>
                                        <TeamPage />
                                    </motion.div>
                                } />
                                <Route path="/profile" element={
                                    <motion.div {...animProps}>
                                        <ProfilePage />
                                    </motion.div>
                                } />
                                <Route path="*" element={<Navigate to="/tasks" />} />
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
        backgroundColor: "#F4F7F9"
    },
    pageStyles : {
    width: "100%",
    height: "100%"
    }
}

export default PagesControl;