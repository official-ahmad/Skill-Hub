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
import { db } from "./components/services/firebase";
import firebase from "firebase/compat/app";

export default function App() {
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

  const [allScoresCache, setAllScoresCache] = useState({});

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sh_theme", theme);
  }, [theme]);

  // Real-time Firestore Leaderboard sync
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = db.collection("leaderboard").onSnapshot(
      (snapshot) => {
        const cache = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.passedCount !== undefined) {
            cache[doc.id] = data;
          }
        });
        setAllScoresCache(cache);
      },
      (error) => {
        console.warn("Firebase sync notice:", error);
      },
    );
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const savedProg = localStorage.getItem(`sh_prog_${currentUser}`);
    setUserProgress(savedProg ? JSON.parse(savedProg) : {});

    const savedNotes = localStorage.getItem(`sh_notes_${currentUser}`);
    setUserNotes(savedNotes ? JSON.parse(savedNotes) : {});
  }, [currentUser]);

  const handleLoginSuccess = (uid, userProfile) => {
    setCurrentUser(uid);
    localStorage.setItem("sh_user", uid);

    if (userProfile) {
      localStorage.setItem(`sh_profile_${uid}`, JSON.stringify(userProfile));

      // Sync user profile to Firestore for Leaderboard display
      db.collection("leaderboard")
        .doc(uid)
        .set(
          {
            name: userProfile.name,
            email: userProfile.email,
            photo: userProfile.photo || "",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
        .catch((err) => console.warn("Firestore sync error:", err));
    }

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

    const totalPassed = Object.values(updated).reduce(
      (acc, val) => acc + (Number(val) || 0),
      0,
    );

    db.collection("leaderboard")
      .doc(currentUser)
      .set(
        {
          passedCount: totalPassed,
          xp: totalPassed * 50,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      .catch((err) => console.warn("Firebase update notice:", err));
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

    db.collection("leaderboard")
      .doc(currentUser)
      .set({ passedCount: 0, xp: 0 }, { merge: true })
      .catch((err) => console.warn("Firebase reset notice:", err));
  };

  const totalPassedVideos = Object.values(userProgress).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0,
  );
  const totalXP = totalPassedVideos * 50;

  if (!currentUser) {
    return (
      <Login
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
                currentUser={currentUser}
                userProgress={userProgress}
                allScoresCache={allScoresCache}
              />
            )}

            {currentTab === "dash" && (
              <MyLearning
                courses={COURSES}
                currentUser={currentUser}
                userProgress={userProgress}
                onSelectCourse={handleSelectCourse}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === "profile" && (
              <Profile
                courses={COURSES}
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
    </div>
  );
}
