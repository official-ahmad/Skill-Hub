import React, { useState, useEffect } from "react";
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
import { COURSES } from "./components/data/coursesData";

export default function App() {
  const DEFAULT_USERS = {
    "SH-1001": { name: "Ahmad Ali", pw: "123456" },
    "SH-1002": { name: "Areeba", pw: "123456" },
    "SH-1003": { name: "Hareem", pw: "123456" },
    "SH-1004": { name: "Moiz", pw: "123456" },
    "SH-1005": { name: "Maria", pw: "123456" },
    "SH-1006": { name: "Minahil", pw: "123456" },
    "SH-1007": { name: "Shahmeer", pw: "123456" },
    "SH-1008": { name: "Yusra", pw: "123456" },
  };

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem("sh_user") || null;
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

  const [userProgress, setUserProgress] = useState(() => {
    if (!currentUser) return {};
    const saved = localStorage.getItem(`sh_prog_${currentUser}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [userNotes, setUserNotes] = useState(() => {
    if (!currentUser) return {};
    const saved = localStorage.getItem(`sh_notes_${currentUser}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sh_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!currentUser) return;

    const savedProg = localStorage.getItem(`sh_prog_${currentUser}`);
    setUserProgress(savedProg ? JSON.parse(savedProg) : {});

    const savedNotes = localStorage.getItem(`sh_notes_${currentUser}`);
    setUserNotes(savedNotes ? JSON.parse(savedNotes) : {});
  }, [currentUser]);

  const handleLoginSuccess = (id) => {
    setCurrentUser(id);
    localStorage.setItem("sh_user", id);
    setCurrentTab("home");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sh_user");
    setSelectedCourseId(null);
    setInCourseRoom(false);
    setIsMobileMenuOpen(false);
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
    localStorage.setItem(`sh_prog_${currentUser}`, JSON.stringify(updated));
  };

  const handleSaveNote = (courseId, index, text) => {
    if (!currentUser) return;

    const key = `${courseId}_${index}`;
    const updated = { ...userNotes, [key]: text };
    setUserNotes(updated);
    localStorage.setItem(`sh_notes_${currentUser}`, JSON.stringify(updated));
  };

  const handleResetProgress = () => {
    if (!currentUser) return;

    setUserProgress({});
    localStorage.removeItem(`sh_prog_${currentUser}`);
  };

  const totalPassedVideos = Object.values(userProgress).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0,
  );
  const totalXP = totalPassedVideos * 50;

  if (!currentUser) {
    return (
      <Login
        usersData={DEFAULT_USERS}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  const selectedCourse = COURSES.find(
    (c) => String(c.id) === String(selectedCourseId),
  );

  return (
    <div className="min-h-screen bg-[#090919] text-[#f1f0fc]">
      <Header
        user={currentUser}
        usersData={DEFAULT_USERS}
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
        totalXP={totalXP}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-7">
        {selectedCourseId ? (
          inCourseRoom ? (
            <CourseRoom
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
              courses={COURSES}
              userProgress={userProgress}
              onBack={() => setSelectedCourseId(null)}
              onStartCourse={handleStartCourse}
            />
          )
        ) : (
          <>
            {currentTab === "home" && (
              <Home
                courses={COURSES}
                usersData={DEFAULT_USERS}
                currentUser={currentUser}
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
                courses={COURSES}
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
                usersData={DEFAULT_USERS}
                currentUser={currentUser}
                userProgress={userProgress}
                allScoresCache={{}}
              />
            )}

            {currentTab === "dash" && (
              <MyLearning
                courses={COURSES}
                usersData={DEFAULT_USERS}
                currentUser={currentUser}
                userProgress={userProgress}
                onSelectCourse={handleSelectCourse}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === "profile" && (
              <Profile
                courses={COURSES}
                usersData={DEFAULT_USERS}
                currentUser={currentUser}
                userProgress={userProgress}
                allScoresCache={{}}
                onSelectCourse={handleSelectCourse}
                onResetProgress={handleResetProgress}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
