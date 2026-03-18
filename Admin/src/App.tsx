import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import RoleBasedRedirect from '@/components/RoleBasedRedirect'
import { ROLES } from '@/lib/roles'
import LoginPage from '@/features/auth/LoginPage'
import UsersPage from '@/features/users/UsersPage'
import UserCreatePage from '@/features/users/UserCreatePage'
import UserEditPage from '@/features/users/UserEditPage'
import UserDetailPage from '@/features/users/UserDetailPage'
import LessonCreatePage from './features/lessons/LessonCreatePage'
import LessonEditPage from './features/lessons/LessonEditPage'
import SchoolsPage from '@/features/schools/SchoolsPage'
import ExamCreatePage from './features/exams/ExamCreatePage'
import ExamEditPage from './features/exams/ExamEditPage'
import SchoolCreatePage from '@/features/schools/SchoolCreatePage'
import SchoolEditPage from '@/features/schools/SchoolEditPage'
import SchoolDetailPage from '@/features/schools/SchoolDetailPage'
import ClassRoomsPage from '@/features/classrooms/ClassRoomsPage'
import ClassRoomCreatePage from '@/features/classrooms/ClassRoomCreatePage'
import ClassRoomEditPage from '@/features/classrooms/ClassRoomEditPage'
import ClassRoomDetailPage from './features/classrooms/ClassRoomDetailPage'
import VocabularyPage from './features/vocabulary/VocabularyPage'
import VocabularyCreatePage from './features/vocabulary/VocabularyCreatePage'
import VocabularyEditPage from './features/vocabulary/VocabularyEditPage'
import ExamsPage from './features/exams/ExamsPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import BadgesPage from '@/features/badges/BadgesPage'
import LeaderboardPage from '@/features/leaderboard/LeaderboardPage'
import TeachersPage from '@/features/teachers/TeachersPage'
import StudentsPage from '@/features/students/StudentsPage'
import GradesPage from '@/features/grades/GradesPage'
import UnauthorizedPage from '@/features/error/UnauthorizedPage'
import SettingsPage from '@/features/settings/SettingsPage'

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Routes for ADMIN, SCHOOL and TEACHER */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SCHOOL, ROLES.TEACHER]} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/lessons" element={<LessonsPage />} />
                    <Route path="/lessons/create" element={<LessonCreatePage />} />
                    <Route path="/lessons/edit/:id" element={<LessonEditPage />} />
                    <Route path="/vocabulary" element={<VocabularyPage />} />
                    <Route path="/vocabulary/create" element={<VocabularyCreatePage />} />
                    <Route path="/vocabulary/edit/:id" element={<VocabularyEditPage />} />
                    <Route path="/exams" element={<ExamsPage />} />
                    <Route path="/exams/create" element={<ExamCreatePage />} />
                    <Route path="/exams/edit/:id" element={<ExamEditPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                </Route>
            </Route>

            {/* Role specific routes - Classes, Students, Teachers, Grades */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SCHOOL]} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/classrooms" element={<ClassRoomsPage />} />
                    <Route path="/classrooms/create" element={<ClassRoomCreatePage />} />
                    <Route path="/classrooms/:id" element={<ClassRoomDetailPage />} />
                    <Route path="/classrooms/edit/:id" element={<ClassRoomEditPage />} />
                    <Route path="/teachers" element={<TeachersPage />} />
                    <Route path="/grades" element={<GradesPage />} />
                </Route>
            </Route>

            {/* ADMIN role routes - only 5 pages: Schools, Users, Notifications, Leaderboard, Badges */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/schools" element={<SchoolsPage />} />
                    <Route path="/schools/create" element={<SchoolCreatePage />} />
                    <Route path="/schools/:id" element={<SchoolDetailPage />} />
                    <Route path="/schools/edit/:id" element={<SchoolEditPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/users/create" element={<UserCreatePage />} />
                    <Route path="/users/:id" element={<UserDetailPage />} />
                    <Route path="/users/edit/:id" element={<UserEditPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                </Route>
            </Route>

            {/* Redirects - smart redirect based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
    )
}

export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppRoutes />
                <Toaster richColors position="top-right" />
            </BrowserRouter>
        </Provider>
    )
}
