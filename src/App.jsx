import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
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
import { clearToken, getCourses, getLeaderboard, getMe, getProgress, getToken, migrateLegacyProgress, resetProgress, saveNote, saveProgress, saveToken, updateProfile, logoutUser } from "./api";
import AdminDashboard from "./components/pages/AdminDashboard";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return getToken() ? localStorage.getItem("sh_user") || null : null;
  });

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
  const [profile, setProfile] = useState(null);
  const [usersData, setUsersData] = useState({});

  const [allScoresCache, setAllScoresCache] = useState({});
  const [adminSession, setAdminSession] = useState(false);

  useEffect(() => {
    const openAdmin = () => setAdminSession(true);
    window.addEventListener("skillhub-admin-login", openAdmin);
    return () => window.removeEventListener("skillhub-admin-login", openAdmin);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sh_theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    getCourses().then((items) => {
      if (active) setCourses(items.map((course) => ({ ...course, id: course._id, t: course.title, cat: course.category, ic: course.icon, c: course.colorIndex, by: course.instructor, v: course.lessons.map((lesson) => [lesson.title, lesson.video, (lesson.questions || []).map((q) => [q.question, q.options, q.correctIndex])]) })));
    }).catch((error) => console.error("Could not load courses:", error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    let active = true;
    Promise.all([getMe(), getProgress(), getLeaderboard()]).then(([me, progress, leaderboard]) => {
      if (!active) return;
      setProfile(me.user);
      setUserProgress(progress.progress || {});
      setUserNotes(progress.notes || {});
      setAllScoresCache(Object.fromEntries(leaderboard.map((entry) => [entry.id, entry])));
      setUsersData(Object.fromEntries(leaderboard.map((entry) => [entry.id, { ...entry, name: entry.name }])));
    }).catch((error) => {
      console.warn("Session could not be restored:", error);
      clearToken();
      localStorage.removeItem("sh_user");
      setCurrentUser(null);
      setProfile(null);
    });
    return () => { active = false; };
  }, [currentUser]);

  const handleLoginSuccess = (token, userProfile) => {
    const previousUid = localStorage.getItem("sh_user");
    let legacyData = {};
    if (previousUid) {
      try {
        legacyData = {
          progress: JSON.parse(localStorage.getItem(`sh_prog_${previousUid}`) || "{}"),
          notes: JSON.parse(localStorage.getItem(`sh_notes_${previousUid}`) || "{}"),
        };
      } catch (error) { console.warn("Legacy learning data could not be read:", error); }
    }
    saveToken(token);
    setProfile(userProfile);
    const uid = userProfile._id;
    localStorage.setItem("sh_user", uid);
    setCurrentUser(uid);
    const importData = previousUid ? migrateLegacyProgress(legacyData).catch((error) => {
      if (!error.message.includes("already been imported")) console.warn("Legacy learning data import failed:", error);
      return null;
    }) : Promise.resolve(null);
    importData.then(() => getProgress()).then((progress) => { setUserProgress(progress.progress || {}); setUserNotes(progress.notes || {}); }).catch(console.error);
    getLeaderboard().then((entries) => { setAllScoresCache(Object.fromEntries(entries.map((entry) => [entry.id, entry]))); setUsersData(Object.fromEntries(entries.map((entry) => [entry.id, entry]))); }).catch(console.error);

    setCurrentTab("home");
    toast.success(`Welcome back, ${userProfile?.name || "Student"}!`);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Log out",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#1a1a1e",
      color: "#f2f2f4",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#2a2a2f",
      customClass: {
        popup: "skillhub-swal",
        confirmButton: "skillhub-swal-confirm",
        cancelButton: "skillhub-swal-cancel",
      },
    }).then((result) => {
      if (!result.isConfirmed) return;
      logoutUser().catch(() => {});
      setCurrentUser(null);
      setProfile(null);
      clearToken();
      localStorage.removeItem("sh_user");
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

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setInCourseRoom(false);
    setCurrentTab("courses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setInCourseRoom(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateProgress = (courseId, count) => {
    if (!currentUser) return;

    const updated = { ...userProgress, [courseId]: count };
    setUserProgress(updated);
    saveProgress(courseId, count).then(() => getLeaderboard()).then((entries) => setAllScoresCache(Object.fromEntries(entries.map((entry) => [entry.id, entry])))).catch((err) => console.warn("Progress sync failed:", err));
  };

  const handleSaveNote = (courseId, index, text) => {
    if (!currentUser) return;

    const key = `${courseId}_${index}`;
    const updated = { ...userNotes, [key]: text };
    setUserNotes(updated);
    saveNote(courseId, index, text).catch((err) => console.warn("Note sync failed:", err));
  };

  const handleResetProgress = () => {
    if (!currentUser) return;

    setUserProgress({});
    resetProgress().then(() => getLeaderboard()).then((entries) => setAllScoresCache(Object.fromEntries(entries.map((entry) => [entry.id, entry])))).catch(console.error);
  };

  const handleProfileUpdate = async (changes) => {
    const result = await updateProfile(changes);
    setProfile(result.user);
  };

  const totalPassedVideos = Object.values(userProgress).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0,
  );
  const totalXP = totalPassedVideos * 50;

  if (adminSession) {
    return <><Toaster position="bottom-right" toastOptions={{ duration: 3200, style: { background: "#18181b", color: "#f4f4f5", border: "1px solid rgba(255,255,255,.08)", borderRadius: "8px", fontSize: "13px" } }} /><AdminDashboard onExit={() => setAdminSession(false)} /></>;
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

  const selectedCourse = courses.find(
    (c) => String(c.id) === String(selectedCourseId),
  );

  return (
    <div className="app-shell min-h-screen">
      <Header
        profile={profile}
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

      <main className="mx-auto max-w-7xl">
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
          </>
        )}
      </main>
      <footer className="app-footer">UI refined with unslop by @heydamir · CC BY 4.0</footer>
    </div>
  );
}
