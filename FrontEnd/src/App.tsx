import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Student pages
import Dashboard from './pages/student/StudentDashboard'
import LessonsPage from './pages/student/LessonsPage'
import LessonDetailPage from './pages/student/LessonDetailPage'
import VocabularyPage from './pages/student/VocabularyPage'
import StudentExamsPage from './pages/student/StudentExamsPage'
import ExamIntroductionPage from './pages/student/ExamIntroductionPage'
import ExamTakePage from './pages/student/ExamTakePage'
import ExamResultPage from './pages/student/ExamResultPage'
import LeaderboardPage from './pages/student/LeaderboardPage'
import MistakeNotebookPage from './pages/student/MistakeNotebookPage'
import BadgesPage from './pages/student/BadgesPage'
import DailyQuestsPage from './pages/student/DailyQuestsPage'

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ClassManagement from './pages/teacher/ClassManagement'
import TeacherLessonsPage from './pages/teacher/TeacherLessonsPage'
import TeacherLessonCreatePage from './pages/teacher/TeacherLessonCreatePage'
import TeacherLessonEditPage from './pages/teacher/TeacherLessonEditPage'
import QuestionsPage from './pages/teacher/QuestionsPage'
import TeacherQuestionCreatePage from './pages/teacher/TeacherQuestionCreatePage'
import TeacherQuestionEditPage from './pages/teacher/TeacherQuestionEditPage'
import TeacherVocabularyPage from './pages/teacher/TeacherVocabularyPage'
import TeacherVocabCreatePage from './pages/teacher/TeacherVocabCreatePage'
import TeacherVocabEditPage from './pages/teacher/TeacherVocabEditPage'
import TeacherExamsPage from './pages/teacher/TeacherExamsPage'
import TeacherExamCreatePage from './pages/teacher/TeacherExamCreatePage'
import TeacherExamEditPage from './pages/teacher/TeacherExamEditPage'
import TeacherExamResultsPage from './pages/teacher/ExamResultsPage'
import StudentProgressPage from './pages/teacher/StudentProgressPage'

// Shared
import SettingsPage from './pages/SettingsPage'
import { Toaster } from 'sonner'

function App() {
    return (
        <>
            <Toaster position="top-right" richColors expand={true} />
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    {/* Public routes */}
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />

                {/* Student routes */}
                <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="lessons" element={<LessonsPage />} />
                    <Route path="lessons/:id" element={<LessonDetailPage />} />
                    <Route path="vocabulary" element={<VocabularyPage />} />
                    <Route path="exams" element={<StudentExamsPage />} />
                    <Route path="exams/:id/introduction" element={<ExamIntroductionPage />} />
                    <Route path="exams/:id/take" element={<ExamTakePage />} />
                    <Route path="exams/:id/result" element={<ExamResultPage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="quests" element={<DailyQuestsPage />} />
                    <Route path="mistakes" element={<MistakeNotebookPage />} />
                    <Route path="badges" element={<BadgesPage />} />
                </Route>

                {/* Teacher routes */}
                <Route element={<ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN', 'ROLE_SCHOOL']} />}>
                    <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                    <Route path="teacher/management" element={<ClassManagement />} />
                    <Route path="teacher/classrooms" element={<Navigate to="/teacher/management" replace />} />
                    <Route path="teacher/lessons" element={<TeacherLessonsPage />} />
                    <Route path="teacher/lessons/create" element={<TeacherLessonCreatePage />} />
                    <Route path="teacher/lessons/:lessonId/edit" element={<TeacherLessonEditPage />} />
                    <Route path="teacher/questions" element={<QuestionsPage />} />
                    <Route path="teacher/questions/create" element={<TeacherQuestionCreatePage />} />
                    <Route path="teacher/questions/:questionId/edit" element={<TeacherQuestionEditPage />} />
                    <Route path="teacher/vocabulary" element={<TeacherVocabularyPage />} />
                    <Route path="teacher/vocabulary/create" element={<TeacherVocabCreatePage />} />
                    <Route path="teacher/vocabulary/:vocabId/edit" element={<TeacherVocabEditPage />} />
                    <Route path="teacher/exams" element={<TeacherExamsPage />} />
                    <Route path="teacher/exams/create" element={<TeacherExamCreatePage />} />
                    <Route path="teacher/exams/:examId/edit" element={<TeacherExamEditPage />} />
                    <Route path="teacher/exams/:examId/results" element={<TeacherExamResultsPage />} />
                    <Route path="teacher/progress" element={<StudentProgressPage />} />
                </Route>

                {/* Shared routes (any authenticated user) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<Navigate to="/settings" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            </Routes>
        </>
    )
}

export default App
