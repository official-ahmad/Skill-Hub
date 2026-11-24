export const categoryAssets = {
  Programming: "/programming.jpg",
  "Web Development": "/web-dev.png",
  Database: "/database.jpg",
  Tools: "/tools.jpg",
  "Computer Science": "/cs.jpg",
  DevOps: "/dev-ops.jpg",
  "Mobile Development": "/mobile-dev.jpg",
};

const courseAssets = {
  js: "/courses/javascript.png",
  py: "/courses/python.png",
  html: "/courses/html.png",
  css: "/courses/css.png",
  c: "/courses/C.png",
  java: "/courses/java.png",
  cpp: "/courses/c++.png",
  sql: "/courses/sql.png",
  git: "/courses/javascript.png",
  react: "/courses/javascript.png",
  node: "/courses/javascript.png",
  dsa: "/courses/c++.png",
  linux: "/courses/c++.png",
  ts: "/courses/javascript.png",
  django: "/courses/python.png",
  flutter: "/courses/java.png",
};

const instructorAssets = {
  "Shradha Khapra": "/instructors/Shradha%20Khapra.jpg",
  "Shradha Khapra (Apna College)": "/instructors/apna-college.jpg",
  "Coder Army": "/instructors/coder-army.jpg",
  "CodeWithHarry": "/instructors/codewithharry.jpg",
  "CodeWithHarry / Community": "/instructors/CodeWithHarry Community.jpg",
  "Varun Singla (Gate Smashers)": "/instructors/varun.jpg",
  "Thapa Technical": "/instructors/thapa.jpg",
  "CodeStepByStep": "/instructors/codestepbystep.jpg",
  "Bro Code": "/instructors/brocode.jpg",
  MPrashant: "/instructors/MPrashant.jpg",
};

const instructorPhotoFiles = [
  "varun.jpg",
  "thapa.jpg",
  "Shradha Khapra.jpg",
  "MPrashant.jpg",
  "codewithharry.jpg",
  "CodeWithHarry Community.jpg",
  "codestepbystep.jpg",
  "coder-army.jpg",
  "brocode.jpg",
  "apna-college.jpg",
];

const normalizeInstructorName = (value) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const getInstructorPhotoCandidates = (courseOrName) => {
  const instructor =
    typeof courseOrName === "string"
      ? courseOrName
      : courseOrName?.by || courseOrName?.instructor || "";
  const customPhoto =
    typeof courseOrName === "object" && courseOrName
      ? courseOrName.instructorPhoto
      : "";
  const parentheticalNames = [...String(instructor).matchAll(/\(([^)]+)\)/g)].map(
    ([, value]) => value,
  );
  const withoutParentheticals = String(instructor)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .trim();
  const nameVariants = [
    instructor,
    withoutParentheticals,
    ...parentheticalNames,
    instructorAssets[instructor] ? instructor : "",
  ].filter(Boolean);
  const normalizedNames = [...new Set(nameVariants.map(normalizeInstructorName))];
  const matchedFiles = instructorPhotoFiles
    .map((file) => {
      const normalizedFile = normalizeInstructorName(file.replace(/\.[^.]+$/, ""));
      const exactIndex = normalizedNames.indexOf(normalizedFile);
      if (exactIndex >= 0) return { file, score: exactIndex };
      const prefixIndex = normalizedNames.findIndex(
        (name) =>
          name.length >= 4 &&
          normalizedFile.length >= 4 &&
          (name.startsWith(normalizedFile) || normalizedFile.startsWith(name)),
      );
      return prefixIndex >= 0
        ? { file, score: 100 + prefixIndex }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .map(({ file }) => `/instructors/${encodeURIComponent(file)}`);

  const mappedPhoto = instructorAssets[instructor];
  return [...new Set([customPhoto, mappedPhoto, ...matchedFiles].filter(Boolean))];
};

export const getCourseImage = (course) =>
  course?.image || courseAssets[course?.id] || courseAssets[course?._id] || null;

export const getInstructorPhoto = (course) =>
  getInstructorPhotoCandidates(course)[0] || null;

export const creatorChannels = {
  "Shradha Khapra": { url: "https://www.youtube.com/@ApnaCollegeOfficial", verified: true },
  "Shradha Khapra (Apna College)": { url: "https://www.youtube.com/@ApnaCollegeOfficial", verified: true },
  "Coder Army": { url: "https://www.youtube.com/channel/UC-QLxQ7cFp-3CFnSZO6oXXw", verified: true },
  "CodeWithHarry": { url: "https://www.youtube.com/@CodeWithHarry", verified: true },
  "CodeWithHarry / Community": { url: "https://www.youtube.com/@CodeWithHarry", verified: true },
  "Varun Singla (Gate Smashers)": { url: "https://www.youtube.com/@GateSmashers", verified: true },
  "Thapa Technical": { url: "https://www.youtube.com/@ThapaTechnical", verified: true },
  CodeStepByStep: { url: "https://www.youtube.com/@codestepbystep", verified: true },
  "Bro Code": { url: "https://www.youtube.com/@BroCodez", verified: true },
  MPrashant: { url: "https://www.youtube.com/@MPrashant", verified: true },
};

export const getCreatorChannel = (course) =>
  course?.instructorUrl
    ? { url: course.instructorUrl, verified: Boolean(course.instructorUrlVerified) }
    : creatorChannels[course?.by || course?.instructor] || { url: "", verified: false };
