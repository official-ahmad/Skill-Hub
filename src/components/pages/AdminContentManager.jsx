import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { createCourse, createTechnology, deleteCourse, deleteTechnology, getCourses, getTechnologies, updateCourse, updateTechnology } from "../../api";

const blankCourse = { id: "", title: "", category: "Programming", description: "", level: "Beginner", instructor: "", image: "", instructorPhoto: "", instructorUrl: "", instructorUrlVerified: false, tags: "", lessons: "[]" };
const blankTechnology = { name: "", category: "General", description: "", image: "" };

export default function AdminContentManager() {
  const [section, setSection] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [courseForm, setCourseForm] = useState(blankCourse);
  const [technologyForm, setTechnologyForm] = useState(blankTechnology);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingTechnology, setEditingTechnology] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [courseList, techList] = await Promise.all([getCourses(), getTechnologies()]);
      setCourses(courseList);
      setTechnologies(techList);
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveCourse = async (event) => {
    event.preventDefault();
    let lessons;
    try { lessons = JSON.parse(courseForm.lessons || "[]"); }
    catch { return toast.error("Lessons must be valid JSON"); }
    if (!Array.isArray(lessons)) return toast.error("Lessons JSON must be an array");
    const payload = { ...courseForm, tags: courseForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean), lessons };
    try {
      if (editingCourse) await updateCourse(editingCourse, payload);
      else await createCourse(payload);
      toast.success(editingCourse ? "Course updated" : "Course created");
      setCourseForm(blankCourse);
      setEditingCourse(null);
      await load();
    } catch (error) { toast.error(error.message); }
  };

  const editCourse = (course) => {
    setSection("courses");
    setEditingCourse(course._id);
    setCourseForm({ id: course._id, title: course.title || "", category: course.category || "Programming", description: course.description || "", level: course.level || "Beginner", instructor: course.instructor || "", image: course.image || "", instructorPhoto: course.instructorPhoto || "", instructorUrl: course.instructorUrl || "", instructorUrlVerified: Boolean(course.instructorUrlVerified), tags: (course.tags || []).join(", "), lessons: JSON.stringify(course.lessons || [], null, 2) });
  };

  const removeCourse = async (course) => {
    if (!window.confirm(`Delete “${course.title}” and its saved course progress?`)) return;
    try { await deleteCourse(course._id); toast.success("Course deleted"); await load(); }
    catch (error) { toast.error(error.message); }
  };

  const saveTechnology = async (event) => {
    event.preventDefault();
    try {
      if (editingTechnology) await updateTechnology(editingTechnology, technologyForm);
      else await createTechnology(technologyForm);
      toast.success(editingTechnology ? "Technology updated" : "Technology created");
      setTechnologyForm(blankTechnology);
      setEditingTechnology(null);
      await load();
    } catch (error) { toast.error(error.message); }
  };

  const editTechnology = (technology) => {
    setSection("technologies");
    setEditingTechnology(technology._id);
    setTechnologyForm({ name: technology.name || "", category: technology.category || "General", description: technology.description || "", image: technology.image || "" });
  };

  const removeTechnology = async (technology) => {
    if (!window.confirm(`Delete “${technology.name}”?`)) return;
    try { await deleteTechnology(technology._id); toast.success("Technology deleted"); await load(); }
    catch (error) { toast.error(error.message); }
  };

  return <section className="admin-content-manager">
    <div className="manager-tabs"><button className={section === "courses" ? "is-active" : ""} onClick={() => setSection("courses")}>Courses <span>{courses.length}</span></button><button className={section === "technologies" ? "is-active" : ""} onClick={() => setSection("technologies")}>Technologies <span>{technologies.length}</span></button></div>
    {section === "courses" ? <>
      <form className="manager-form" onSubmit={saveCourse}>
        <header><h2>{editingCourse ? "Edit course" : "Add course"}</h2>{editingCourse && <button className="button-secondary" type="button" onClick={() => { setEditingCourse(null); setCourseForm(blankCourse); }}>Cancel edit</button>}</header>
        <div className="manager-fields">
          <label>Title<input required minLength={2} maxLength={160} value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></label>
          <label>Category<input required maxLength={80} value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} /></label>
          <label>Instructor<input value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} /></label>
          <label>Level<input value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} /></label>
          <label>Course image path<input placeholder="/courses/javascript.png" value={courseForm.image} onChange={(e) => setCourseForm({ ...courseForm, image: e.target.value })} /></label>
          <label>Instructor photo path<input placeholder="/instructors/creator.jpg" value={courseForm.instructorPhoto} onChange={(e) => setCourseForm({ ...courseForm, instructorPhoto: e.target.value })} /></label>
          <label>YouTube channel URL<input type="url" value={courseForm.instructorUrl} onChange={(e) => setCourseForm({ ...courseForm, instructorUrl: e.target.value })} /></label>
          <label>Tags, comma separated<input value={courseForm.tags} onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })} /></label>
          <label className="manager-wide">Description<textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></label>
          <label className="manager-wide">Lessons JSON<textarea className="manager-json" value={courseForm.lessons} onChange={(e) => setCourseForm({ ...courseForm, lessons: e.target.value })} spellCheck="false" /></label>
          <label className="manager-check"><input type="checkbox" checked={courseForm.instructorUrlVerified} onChange={(e) => setCourseForm({ ...courseForm, instructorUrlVerified: e.target.checked })} /> I verified this instructor URL</label>
        </div>
        <button className="button-primary" type="submit"><Plus size={16} /> {editingCourse ? "Save course" : "Create course"}</button>
      </form>
      <div className="manager-list">{courses.map((course) => <article key={course._id}><span><strong>{course.title}</strong><small>{course.category} · {course.lessons?.length || 0} lessons · {course._id}</small></span><div><button className="icon-button" aria-label={`Edit ${course.title}`} onClick={() => editCourse(course)}><Pencil size={16} /></button><button className="icon-button is-danger" aria-label={`Delete ${course.title}`} onClick={() => removeCourse(course)}><Trash2 size={16} /></button></div></article>)}{!loading && courses.length === 0 && <p className="empty-state">No courses found.</p>}</div>
    </> : <>
      <form className="manager-form" onSubmit={saveTechnology}>
        <header><h2>{editingTechnology ? "Edit technology" : "Add technology"}</h2>{editingTechnology && <button className="button-secondary" type="button" onClick={() => { setEditingTechnology(null); setTechnologyForm(blankTechnology); }}>Cancel edit</button>}</header>
        <div className="manager-fields">
          <label>Name<input required minLength={2} maxLength={80} value={technologyForm.name} onChange={(e) => setTechnologyForm({ ...technologyForm, name: e.target.value })} /></label>
          <label>Category<input value={technologyForm.category} onChange={(e) => setTechnologyForm({ ...technologyForm, category: e.target.value })} /></label>
          <label>Image path<input placeholder="/courses/javascript.png" value={technologyForm.image} onChange={(e) => setTechnologyForm({ ...technologyForm, image: e.target.value })} /></label>
          <label>Description<textarea value={technologyForm.description} onChange={(e) => setTechnologyForm({ ...technologyForm, description: e.target.value })} /></label>
        </div>
        <button className="button-primary" type="submit"><Plus size={16} /> {editingTechnology ? "Save technology" : "Create technology"}</button>
      </form>
      <div className="manager-list">{technologies.map((technology) => <article key={technology._id}><span><strong>{technology.name}</strong><small>{technology.category}</small></span><div><button className="icon-button" aria-label={`Edit ${technology.name}`} onClick={() => editTechnology(technology)}><Pencil size={16} /></button><button className="icon-button is-danger" aria-label={`Delete ${technology.name}`} onClick={() => removeTechnology(technology)}><Trash2 size={16} /></button></div></article>)}{!loading && technologies.length === 0 && <p className="empty-state">No technologies found.</p>}</div>
    </>}
  </section>;
}
