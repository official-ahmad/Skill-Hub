import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Header from "./components/Header";
import MobileMenu from "./components/MobileMenu";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import CoursesCatalog from "./components/pages/CoursesCatalog";
import CourseDetail from "./components/pages/CourseDetail";
import CourseRoom from "./components/pages/CourseRoom";
import Leaderboard from "./components/pages/Leaderboard";
import Profile from "./components/pages/Profile";
import MyLearning from "./components/pages/MyLearning";
import {
  clearToken,
  getCourses,
  getLeaderboard,
  getMe,
  getProgress,
  getToken,
  migrateLegacyProgress,
  resetProgress,
  saveNote,
  saveProgress,
  saveToken,
  updateProfile,
  logoutUser,
  getActiveAnnouncement,
  getCertificates,
  getAdminSession,
  getCourse,
} from "./api";
import AdminDashboard from "./components/pages/AdminDashboard";
import QueriesPage from "./components/pages/QueriesPage";
import VerificationPage from "./components/pages/VerificationPage";

export default function App() {
  const cachedProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem("sh_profile") || "null");
    } catch {
      return null;
    }
  })();
  const [currentUser, setCurrentUser] = useState(() => {
    return getToken() ? localStorage.getItem("sh_user") || null : null;
  });
  const [isHydrating, setIsHydrating] = useState(() => Boolean(getToken()));

  const [currentTab, setCurrentTab] = useState("home");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [inCourseRoom, setInCourseRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Default");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("sh_theme") || "dark";
  });

  const [userProgress, setUserProgress] = useState({});
  const [userNotes, setUserNotes] = useState({});
  const [courses, setCourses] = useState([]);
  const [detailedCourse, setDetailedCourse] = useState(null);
  const [profile, setProfile] = useState(cachedProfile);
  const [usersData, setUsersData] = useState({});

  const [allScoresCache, setAllScoresCache] = useState({});
  const [adminSession, setAdminSession] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [totalXPOverride, setTotalXPOverride] = useState(null);

  useEffect(() => {
    const openAdmin = () => setAdminSession(true);
    window.addEventListener("skillhub-admin-login", openAdmin);
    return () => window.removeEventListener("skillhub-admin-login", openAdmin);
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then(() => { if (active) setAdminSession(true); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sh_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getActiveAnnouncement()
      .then((data) => {
        if (!active) return;
        const next = data?.announcement || null;
        setAnnouncement(next);
        setAnnouncementDismissed(
          next
            ? localStorage.getItem("sh_notice_dismissed") === next._id
            : false,
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    getCertificates()
      .then((data) => {
        if (active) setTotalXPOverride(Number(data.xp || 0));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    getCourses()
      .then((items) => {
        if (active)
          setCourses(
            items.map((course) => ({
              ...course,
              id: course._id,
              t: course.title,
              cat: course.category,
              ic: course.icon,
              c: course.colorIndex,
              by: course.instructor,
              v: Array.isArray(course.lessons)
                ? course.lessons.map((lesson) => [
                    lesson.title,
                    lesson.video,
                    (lesson.questions || []).map((q) => [
                      q.question,
                      q.options,
                      q.correctIndex,
                    ]),
                  ])
                : [],
            })),
          );
      })
      .catch((error) => console.error("Could not load courses:", error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    let active = true;
    Promise.all([getMe(), getProgress(), getLeaderboard()])
      .then(([me, progress, leaderboard]) => {
        if (!active) return;
        setProfile(me.user);
        localStorage.setItem("sh_profile", JSON.stringify(me.user));
        setUserProgress(progress.progress || {});
        setUserNotes(progress.notes || {});
        setAllScoresCache(
          Object.fromEntries(leaderboard.map((entry) => [entry.id, entry])),
        );
        setUsersData(
          Object.fromEntries(
            leaderboard.map((entry) => [
              entry.id,
              { ...entry, name: entry.name },
            ]),
          ),
        );
      })
      .catch((error) => {
        console.warn("Session could not be restored:", error);
        if (error.status === 401) {
          clearToken();
          localStorage.removeItem("sh_user");
          localStorage.removeItem("sh_profile");
          setCurrentUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLoginSuccess = (token, userProfile) => {
    const previousUid = localStorage.getItem("sh_user");
    let legacyData = {};
    if (previousUid) {
      try {
        legacyData = {
          progress: JSON.parse(
            localStorage.getItem(`sh_prog_${previousUid}`) || "{}",
          ),
          notes: JSON.parse(
            localStorage.getItem(`sh_notes_${previousUid}`) || "{}",
          ),
        };
      } catch (error) {
        console.warn("Legacy learning data could not be read:", error);
      }
    }
    saveToken(token);
    setProfile(userProfile);
    localStorage.setItem("sh_profile", JSON.stringify(userProfile));
    const uid = userProfile._id;
    localStorage.setItem("sh_user", uid);
    setCurrentUser(uid);
    setIsHydrating(false);
    const importData = previousUid
      ? migrateLegacyProgress(legacyData).catch((error) => {
          if (!error.message.includes("already been imported"))
            console.warn("Legacy learning data import failed:", error);
          return null;
        })
      : Promise.resolve(null);
    importData
      .then(() => getProgress())
      .then((progress) => {
        setUserProgress(progress.progress || {});
        setUserNotes(progress.notes || {});
      })
      .catch(console.error);
    getLeaderboard()
      .then((entries) => {
        setAllScoresCache(
          Object.fromEntries(entries.map((entry) => [entry.id, entry])),
        );
        setUsersData(
          Object.fromEntries(entries.map((entry) => [entry.id, entry])),
        );
      })
      .catch(console.error);

    setCurrentTab("home");
    toast.success(
      userProfile?.name ? `Welcome back, ${userProfile.name}!` : "Signed in successfully",
    );
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: theme === "dark" ? "#0f172a" : "#ffffff",
      color: theme === "dark" ? "#f1f5f9" : "#0f172a",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: theme === "dark" ? "#334155" : "#e2e8f0",
      customClass: {
        popup: "skillhub-swal",
        confirmButton: "skillhub-swal-confirm",
        cancelButton: "skillhub-swal-cancel",
      },
    }).then((result) => {
      if (!result.isConfirmed) return;
      logoutUser().catch((error) =>
        toast.error(
          error.message || "Could not confirm logout with the server",
        ),
      );
      setCurrentUser(null);
      setProfile(null);
      clearToken();
      localStorage.removeItem("sh_user");
      localStorage.removeItem("sh_profile");
      setSelectedCourseId(null);
      setInCourseRoom(false);
      setIsMobileMenuOpen(false);
      toast.success("Logged out successfully");
    });
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleNavigate = (tab) => {
    setCurrentTab(tab);
    setSelectedCourseId(null);
    setInCourseRoom(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadDetailedCourse = async (courseId) => {
    setDetailedCourse(null);
    try {
      const course = await getCourse(courseId);
      setDetailedCourse({
        ...course,
        id: course._id,
        t: course.title,
        cat: course.category,
        ic: course.icon,
        c: course.colorIndex,
        by: course.instructor,
        v: (course.lessons || []).map((lesson) => [
          lesson.title,
          lesson.video,
          (lesson.questions || []).map((q) => [
            q.question,
            q.options,
            q.correctIndex,
          ]),
        ]),
      });
    } catch (error) {
      toast.error(error.message || "Could not load course");
    }
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setInCourseRoom(false);
    setCurrentTab("courses");
    loadDetailedCourse(courseId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setInCourseRoom(true);
    loadDetailedCourse(courseId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateProgress = (courseId, count) => {
    if (!currentUser) return;

    const updated = { ...userProgress, [courseId]: count };
    setUserProgress(updated);
    saveProgress(courseId, count)
      .then(() => getLeaderboard())
      .then((entries) =>
        setAllScoresCache(
          Object.fromEntries(entries.map((entry) => [entry.id, entry])),
        ),
      )
      .catch((err) => console.warn("Progress sync failed:", err));
  };

  const handleSaveNote = (courseId, index, text) => {
    if (!currentUser) return;

    const key = `${courseId}_${index}`;
    const updated = { ...userNotes, [key]: text };
    setUserNotes(updated);
    saveNote(courseId, index, text).catch((err) =>
      console.warn("Note sync failed:", err),
    );
  };

  const handleResetProgress = () => {
    if (!currentUser) return;
    setUserProgress({});
    resetProgress()
      .then(() => getLeaderboard())
      .then((entries) => {
        setAllScoresCache(
          Object.fromEntries(entries.map((entry) => [entry.id, entry])),
        );
        toast.success("Learning progress reset");
      })
      .catch((error) =>
        toast.error(error.message || "Could not reset progress"),
      );
  };

  const handleProfileUpdate = async (changes) => {
    const result = await updateProfile(changes);
    setProfile(result.user);
  };

  const totalPassedVideos = Object.values(userProgress).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0,
  );
  const totalXP = totalXPOverride ?? totalPassedVideos * 50;

  const verificationMatch = window.location.pathname.match(/^\/verify\/([^/]+)\/?$/);
  if (verificationMatch) return <VerificationPage certificateId={decodeURIComponent(verificationMatch[1])} />;

  if (adminSession) {
    return <AdminDashboard onExit={() => setAdminSession(false)} />;
  }

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <header className="sticky top-0 z-40 h-16 border-b border-slate-200/70 bg-white/80 px-5 dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3">
            <span className="h-9 w-9 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <span className="h-5 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
            <span className="ml-auto h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  const selectedCourse =
    detailedCourse &&
    String(detailedCourse.id) === String(selectedCourseId)
      ? detailedCourse
      : courses.find((c) => String(c.id) === String(selectedCourseId));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <Header
        profile={profile}
        isHydrating={isHydrating}
        totalXP={totalXP}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentTab !== "courses") setCurrentTab("courses");
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {announcement && !announcementDismissed && (
        <div className="mx-3 mt-4 grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-4 py-2 shadow-sm dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-slate-950 sm:mx-6 lg:mx-auto lg:max-w-[1380px]" role="status">
          <strong className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Class notice</strong>
          <span className="min-w-0 text-sm text-slate-700 dark:text-slate-200">{announcement.message}</span>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => {
              localStorage.setItem("sh_notice_dismissed", announcement._id);
              setAnnouncementDismissed(true);
            }}
          >
            ×
          </button>
        </div>
      )}

      <main className="mx-auto min-h-[calc(100vh-128px)] max-w-[1440px] px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        {selectedCourseId ? (
          inCourseRoom ? (
            <CourseRoom
              key={selectedCourse?.id || "course-loading"}
              course={selectedCourse}
              userProgress={userProgress}
              userNotes={userNotes}
              totalPassed={totalPassedVideos}
              onBackToDetails={() => setInCourseRoom(false)}
              onUpdateProgress={handleUpdateProgress}
              onSaveNote={handleSaveNote}
              onNavigate={handleNavigate}
            />
          ) : (
            <CourseDetail
              course={selectedCourse}
              courses={courses}
              userProgress={userProgress}
              onBack={() => setSelectedCourseId(null)}
              onStartCourse={handleStartCourse}
            />
          )
        ) : (
          <>
            {currentTab === "home" && (
              <Home
                courses={courses}
                isHydrating={isHydrating}
                currentUser={currentUser}
                usersData={usersData}
                userProfile={profile}
                userProgress={userProgress}
                onSelectCourse={handleSelectCourse}
                onNavigate={handleNavigate}
                onCategorySelect={(cat) => {
                  setSelectedCategory(cat);
                  setCurrentTab("courses");
                }}
                onSearchSubmit={(q) => {
                  setSearchQuery(q);
                  setCurrentTab("courses");
                }}
              />
            )}

            {currentTab === "courses" && (
              <CoursesCatalog
                courses={courses}
                userProgress={userProgress}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedLevel={selectedLevel}
                selectedSort={selectedSort}
                onCategoryChange={setSelectedCategory}
                onLevelChange={setSelectedLevel}
                onSortChange={setSelectedSort}
                onSelectCourse={handleSelectCourse}
              />
            )}

            {currentTab === "leaderboard" && (
              <Leaderboard
                currentUser={currentUser}
                usersData={usersData}
                userProgress={userProgress}
                allScoresCache={allScoresCache}
              />
            )}

            {currentTab === "dash" && (
              <MyLearning
                courses={courses}
                usersData={usersData}
                currentUser={currentUser}
                userProfile={profile}
                userProgress={userProgress}
                onSelectCourse={handleSelectCourse}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === "profile" && (
              <Profile
                courses={courses}
                usersData={usersData}
                userProfile={profile}
                onUpdateProfile={handleProfileUpdate}
                key={profile?._id || "profile"}
                currentUser={currentUser}
                userProgress={userProgress}
                allScoresCache={allScoresCache}
                onSelectCourse={handleSelectCourse}
                onResetProgress={handleResetProgress}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === "queries" && <QueriesPage />}
          </>
        )}
      </main>
      <footer className="px-6 py-5 text-center text-xs text-slate-400 dark:text-slate-500">Skillhub Team</footer>
    </div>
  );
}
