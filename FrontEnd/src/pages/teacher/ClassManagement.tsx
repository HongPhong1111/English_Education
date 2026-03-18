import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  classroomApi,
  ClassRoomResponse,
  ClassStudentResponse,
} from "../../services/api/classroomApi";
import {
  Users,
  Plus,
  LayoutGrid,
  GraduationCap,
  X,
  Search,
  Loader2,
  School,
  ArrowRight,
  UserPlus,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

export default function ClassManagement() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoomResponse | null>(null);
  const [students, setStudents] = useState<ClassStudentResponse[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentKeyword, setStudentKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<ClassStudentResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ClassStudentResponse | null>(null);
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    } else if (!isLoading) {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchClasses = async () => {
    setIsLoading(true);
    setActionMsg({ type: "", text: "" });
    try {
      const data = await classroomApi.getByTeacher(user!.id);
      setClasses(data);
      if (data.length > 0) {
        if (!selectedClass || !data.find((c) => c.id === selectedClass.id)) {
          setSelectedClass(data[0]);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch classes:", error);
      setActionMsg({ type: "error", text: "Không thể tải danh sách lớp học." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (classId: number) => {
    setStudentsLoading(true);
    try {
      const data = await classroomApi.getStudents(classId);
      setStudents(data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass?.id) {
      fetchStudents(selectedClass.id);
    } else {
      setStudents([]);
    }
  }, [selectedClass?.id]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedCandidate) return;

    setIsSubmitting(true);
    setActionMsg({ type: "", text: "" });
    try {
      await classroomApi.addStudent(selectedClass.id, selectedCandidate.id);
      setActionMsg({
        type: "success",
        text: "Thêm học sinh vào lớp thành công!",
      });
      setStudentKeyword("");
      setSearchResults([]);
      setSelectedCandidate(null);
      setIsAddStudentOpen(false);
      fetchClasses();
      fetchStudents(selectedClass.id);
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err.response?.data?.message || "Có lỗi xảy ra khi thêm học sinh.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAddStudentOpen || !selectedClass) return;
    const keyword = studentKeyword.trim();

    if (keyword.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSelectedCandidate(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await classroomApi.searchStudents(
          selectedClass.id,
          keyword,
        );
        setSearchResults(data || []);
        if (
          selectedCandidate &&
          !data.find((s) => s.id === selectedCandidate.id)
        ) {
          setSelectedCandidate(null);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isAddStudentOpen, selectedClass?.id, studentKeyword]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Header Section */}
      <div className="bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Badge variant="info" className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 mb-3">
              CLASSROOM MANAGEMENT
            </Badge>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
              Quản lý lớp học
            </h1>
            <p className="mt-2 text-lg font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Danh sách lớp và theo dõi học viên của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar: Class List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
              DANH SÁCH LỚP ({classes.length})
            </h3>
          </div>
          
          <div className="space-y-4">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`w-full group relative overflow-hidden p-5 rounded-3xl border transition-all flex items-center justify-between ${
                  selectedClass?.id === cls.id
                    ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/20 text-white"
                    : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-blue-500/50 text-[var(--color-text)]"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-3 rounded-2xl ${
                    selectedClass?.id === cls.id ? "bg-white/20" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">{cls.name}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                      selectedClass?.id === cls.id ? "text-white/70" : "text-[var(--color-text-secondary)]"
                    }`}>
                      Niên khóa: {cls.academicYear || "N/A"}
                    </p>
                  </div>
                </div>
                {selectedClass?.id === cls.id && (
                  <ArrowRight className="w-5 h-5 relative z-10 opacity-70" />
                )}
                <div className={`absolute inset-0 bg-white/0 ${
                  selectedClass?.id === cls.id ? "group-hover:bg-white/5" : "group-hover:bg-blue-500/5"
                } transition-colors`} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Selected Class Details */}
        <div className="lg:col-span-3">
          {selectedClass ? (
            <Card className="h-full p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm" hover={false}>
              <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-[var(--color-border)] mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
                      {selectedClass.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5 font-bold text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[10px] uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        {selectedClass.academicYear}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[10px] uppercase tracking-wider">
                        <Users className="w-3 h-3" />
                        {selectedClass.studentCount || 0} HỌC SINH
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm học sinh
                </button>
              </div>

              <div className="flex-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  DANH SÁCH HỌC SINH ({students.length})
                </h3>
                
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center animate-fadeIn">
                    <div className="bg-[var(--color-bg-tertiary)] p-10 rounded-[2rem] mb-6">
                      <Users className="w-16 h-16 text-[var(--color-text-secondary)] opacity-10" />
                    </div>
                    <p className="font-bold text-lg" style={{ color: "var(--color-text-secondary)" }}>
                      Lớp này chưa có học sinh nào.
                    </p>
                    <button 
                       onClick={() => setIsAddStudentOpen(true)}
                       className="mt-6 text-blue-500 font-black text-sm underline underline-offset-4"
                    >
                      Bắt đầu thêm học sinh ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-blue-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="size-12 rounded-2xl overflow-hidden bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.fullName || student.username}
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-black text-blue-500">
                                {(student.fullName || student.username)?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-base truncate" style={{ color: "var(--color-text)" }}>
                              {student.fullName || student.username}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                               <p className="text-xs font-bold truncate opacity-60" style={{ color: "var(--color-text-secondary)" }}>
                                 @{student.username}
                               </p>
                               {student.email && (
                                 <>
                                   <div className="w-1 h-1 rounded-full bg-[var(--color-text-secondary)] opacity-20" />
                                   <div className="flex items-center gap-1 text-[10px] font-bold opacity-60">
                                       <Mail className="w-3 h-3" />
                                       {student.email}
                                   </div>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="success" className="font-black text-[9px] tracking-widest px-2 py-1">
                          {student.status || "ACTIVE"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 text-center rounded-[2.5rem] border-[var(--color-border)]" hover={false}>
              <div className="bg-[var(--color-bg-tertiary)] p-10 rounded-full mb-6">
                <School className="w-16 h-16 text-[var(--color-text-secondary)] opacity-20" />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: "var(--color-text)" }}>
                 Chào mừng đến với Quản lý lớp học
              </h3>
              <p className="max-w-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Vui lòng chọn một lớp ở bên trái để bắt đầu quản lý học sinh và theo dõi thông tin.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Premium Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-[var(--color-bg)] w-full max-w-lg p-10 rounded-[3rem] border border-[var(--color-border)] shadow-2xl relative animate-slideUp">
            <button
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-[var(--color-bg-secondary)] border border-transparent hover:border-[var(--color-border)] transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                 <UserPlus className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
                Thêm học sinh
              </h2>
              <p className="font-medium text-[var(--color-text-secondary)]">Thêm học sinh mới vào lớp {selectedClass?.name}</p>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] ml-1">
                  Tìm kiếm thông tin
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={studentKeyword}
                    onChange={(e) => setStudentKeyword(e.target.value)}
                    className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-blue-500 rounded-[1.5rem] px-6 py-4 outline-none transition-all font-bold placeholder:text-[var(--color-text-secondary)]/40"
                    placeholder="Tên, Username hoặc Email..."
                    required
                    autoFocus
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {searching ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    ) : (
                      <Search className="w-5 h-5 opacity-20 group-focus-within:opacity-50 transition-opacity" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] font-bold opacity-40 italic ml-1" style={{ color: "var(--color-text-secondary)" }}>
                  Gõ ít nhất 2 ký tự để tìm kiếm trong hệ thống.
                </p>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 divide-y divide-[var(--color-border)]">
                  {searchResults.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`w-full text-left p-4 group transition-all flex items-center justify-between ${
                        selectedCandidate?.id === candidate.id
                          ? "bg-blue-500 text-white"
                          : "hover:bg-[var(--color-bg-tertiary)]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`size-10 rounded-xl flex items-center justify-center font-black ${
                            selectedCandidate?.id === candidate.id ? "bg-white/20" : "bg-blue-500/10 text-blue-500"
                         }`}>
                             {(candidate.fullName || candidate.username)?.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="font-black text-sm">{candidate.fullName || candidate.username}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wide opacity-60 ${
                               selectedCandidate?.id === candidate.id ? "text-white" : "text-[var(--color-text-secondary)]"
                            }`}>
                               @{candidate.username} • {candidate.email || "NO EMAIL"}
                            </p>
                         </div>
                      </div>
                      {selectedCandidate?.id === candidate.id && <ArrowRight className="w-4 h-4 opacity-70" />}
                    </button>
                  ))}
                </div>
              )}

              {studentKeyword.trim().length >= 2 && !searching && searchResults.length === 0 && (
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500 font-bold text-sm flex items-center gap-3">
                   <AlertTriangle className="w-5 h-5 shrink-0" />
                   Không tìm thấy học sinh phù hợp.
                </div>
              )}

              {selectedCandidate && (
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-black text-sm text-blue-600">
                        Đã chọn: {selectedCandidate.fullName || selectedCandidate.username}
                      </span>
                   </div>
                   <button onClick={() => setSelectedCandidate(null)} className="text-[10px] font-black uppercase text-red-500 hover:underline">XÓA</button>
                </div>
              )}

              {actionMsg.text && (
                <div className={`p-5 rounded-2xl font-bold text-sm border flex items-center gap-3 ${
                    actionMsg.type === "success"
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                      : "bg-red-500/5 border-red-500/20 text-red-500"
                  }`}
                >
                  {actionMsg.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  {actionMsg.text}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="flex-1 py-4 rounded-2xl border-2 border-[var(--color-border)] font-black text-sm hover:bg-[var(--color-bg-secondary)] transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCandidate}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
