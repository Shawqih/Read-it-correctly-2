import React, { useState } from 'react';
import { UserProgress, resetUserProgress, saveUserProgress } from '../../utils/storage';
import {
  Award,
  Star,
  BookOpen,
  Layers,
  RotateCcw,
  Download,
  Upload,
  Printer,
  Sparkles,
  CheckCircle,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface ParentDashboardProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  progress,
  onUpdateProgress,
}) => {
  const [studentNameInput, setStudentNameInput] = useState(progress.studentName);
  const [studentGradeInput, setStudentGradeInput] = useState(progress.studentGrade);
  const [showCertificate, setShowCertificate] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // Student Title / Level based on stars
  const getStudentLevel = (stars: number) => {
    if (stars >= 150) return { title: 'سَفِيرُ لُغَةِ الضَّادِ وَالْفَصَاحَةِ', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    if (stars >= 80) return { title: 'فَارِسُ الْقِرَاءَةِ وَالْبَيَانِ', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (stars >= 30) return { title: 'الْقَارِئُ الْمُجْتَهِدُ', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    return { title: 'الْبَطَلُ الْقَارِئُ النَّاشِئُ', color: 'text-purple-700 bg-purple-100 border-purple-300' };
  };

  const levelInfo = getStudentLevel(progress.earnedStars);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...progress,
      studentName: studentNameInput.trim() || 'البطل القارئ',
      studentGrade: studentGradeInput,
    };
    saveUserProgress(updated);
    onUpdateProgress(updated);
    audioEngine.playSuccessSound();
    audioEngine.speak(`تم حفظ بيانات التلميذ: ${updated.studentName}`);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `اقراها_صح_تقرير_${progress.studentName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    audioEngine.playSuccessSound();
  };

  const handleReset = () => {
    const reset = resetUserProgress();
    onUpdateProgress(reset);
    setConfirmResetModal(false);
    audioEngine.playSuccessSound();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 dark:from-indigo-900 dark:via-blue-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-bold text-amber-200 mb-3 border border-white/20">
            <Award className="w-4 h-4 text-amber-300" />
            <span>لوحة ولي الأمر والمعلم للمتابعة والتقييم الدقيق</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            تَقْرِيرُ الْإِنْجَازِ، الْأَوْسِمَةِ، وَشَهَادَةِ التَّفَوُّقِ
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 dark:text-blue-200 leading-relaxed max-w-2xl">
            متابعة دقيقة لمستوى التلميذ، والدروس المكتملة، وحفظ أو تصفير التقدم الدراسي، مع إصدار شهادة تقدير معتمدة.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stars */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            ⭐
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{progress.earnedStars}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">مجموع النجوم المكتسبة</div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
            🎖️
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{progress.badges.length}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">أوسمة الاستحقاق</div>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            ✅
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{progress.completedLessons.length}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">دروس مكتملة بنجاح</div>
          </div>
        </div>

        {/* Stories Read */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-2xl shrink-0">
            📖
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{progress.readStories.length}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">قصص مقروءة ومستوعبة</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Side: Student Profile & Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>الملف التعريفي للتلميذ:</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                  اسم التلميذ / التلميذة:
                </label>
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                  الصف الدراسي الحالي:
                </label>
                <select
                  value={studentGradeInput}
                  onChange={(e) => setStudentGradeInput(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value={1}>الصف الأول الابتدائي</option>
                  <option value={2}>الصف الثاني الابتدائي</option>
                  <option value={3}>الصف الثالث الابتدائي</option>
                  <option value={4}>الصف الرابع الابتدائي</option>
                  <option value={5}>الصف الخامس الابتدائي</option>
                  <option value={6}>الصف السادس الابتدائي</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">اللقب والمستوى الحالي:</span>
                <div className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-black border ${levelInfo.color}`}>
                  {levelInfo.title}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition cursor-pointer shadow-xs"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>

          {/* Data Backup & Reset */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              إدارة بيانات التقدم:
            </h3>

            <div className="space-y-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>حفظ وتصدير تقرير التقدم (نسخة احتياطية JSON)</span>
              </button>

              <button
                onClick={() => setConfirmResetModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-rose-200 dark:border-rose-900/60"
              >
                <RotateCcw className="w-4 h-4" />
                <span>تصفير وإعادة تعيين التقدم</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Badges Gallery & Certificate Generator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Certificate Banner */}
          <div className="bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold bg-white/20 px-3 py-0.5 rounded-full">
                شهادة تقدير وإتقان
              </span>
              <h3 className="text-xl font-black mt-1">
                شهادة التفوق في القراءة والنطق الفصيح
              </h3>
              <p className="text-xs text-amber-100 mt-1">
                بإشراف المشرف العام المهندس شوقي حسن الجعور.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCertificate(true);
                audioEngine.playFanfare();
              }}
              className="px-6 py-3 rounded-2xl bg-white text-amber-900 font-black text-xs sm:text-sm hover:bg-amber-50 shadow-md transition cursor-pointer whitespace-nowrap"
            >
              عرض وطباعة الشهادة
            </button>
          </div>

          {/* Badges Gallery */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>معرض الأوسمة والجوائز المكتسبة ({progress.badges.length}):</span>
            </h3>

            {progress.badges.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">
                أكمل الدروس وحقق 100% في الاختبارات التقييمية لفتح الأوسمة الفخرية!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {progress.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center hover:scale-102 transition shadow-2xs"
                  >
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">{badge.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">الصف {badge.grade} • {badge.earnedAt}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border-4 border-amber-400 relative overflow-hidden text-center space-y-6 transition-colors">
            {/* Ambient decorative border */}
            <div className="absolute inset-2 border-2 border-dashed border-amber-300 dark:border-amber-500/40 rounded-2xl pointer-events-none"></div>

            <div className="space-y-2">
              <div className="text-4xl">🌟</div>
              <div className="text-xs font-black text-amber-700 dark:text-amber-400 tracking-wider">
                مُبَادَرَةُ «أَقْرَأُهَا صَحّْ» التَّعْلِيمِيَّةُ الْمُجْتَمَعِيَّةُ
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                شَهَادَةُ تَمَيُّزٍ وَإِتْقَانٍ
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              تَشْهَدُ إِدَارَةُ الْمُبَادَرَةِ بِأَنَّ التِّلْمِيذَ / التِّلْمِيذَةَ الْبَارِعَةَ:
            </p>

            <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-400 py-2 border-b-2 border-amber-300 dark:border-amber-500/40 inline-block px-8">
              {progress.studentName}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              قَدْ أَجَازَ بِنَجَاحٍ بَاهِرٍ وَحَقَّقَ <span className="font-bold text-amber-600 dark:text-amber-400">{progress.earnedStars} نَجْمَةً ذَهَبِيَّةً</span>، وَأَظْهَرَ إِتْقَاناً مُتَمَيِّزاً فِي رَسْمِ الْحُرُوفِ، وَالْقِرَاءَةِ الْجَهْرِيَّةِ، وَالنُّطْقِ الْفَصِيحِ.
            </p>

            {/* Signature & Supervision */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-right text-xs font-bold text-slate-700 dark:text-slate-300 px-6">
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px]">تاريخ المنح:</span>
                <span>{new Date().toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="text-left">
                <span className="block text-slate-400 dark:text-slate-500 text-[10px]">المشرف العام:</span>
                <span className="text-blue-900 dark:text-blue-400 font-black">المهندس شوقي حسن الجعور</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              هل أنت متأكد من تصفير كافة التقدم؟
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              سيتم إعادة ضبط النجوم والدروس المكتملة والأوسمة إلى الصفر للبدء من جديد.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmResetModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-xs"
              >
                نعم، تصفير الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
