import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';
import { courseApi, lessonApi, enrollmentApi } from '../../services/api';
import { Course, Lesson } from '../../types';
import toast from 'react-hot-toast';

export default function LearnPage() {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId?: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseSlug]);

  useEffect(() => {
    if (lessonId) {
      loadLesson(lessonId);
    }
  }, [lessonId]);

  const loadCourse = async () => {
    try {
      const response = await courseApi.getBySlug(courseSlug!);
      const courseData = response.data.data;
      setCourse(courseData);

      // If no lesson selected, go to first lesson
      if (!lessonId && courseData.sections?.[0]?.lessons?.[0]) {
        const firstLesson = courseData.sections[0].lessons[0];
        navigate(`/learn/${courseSlug}/${firstLesson.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/dashboard/my-courses');
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (id: string) => {
    try {
      const response = await lessonApi.getLesson(id);
      setCurrentLesson(response.data.data);
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      await enrollmentApi.updateProgress(currentLesson.id, { isCompleted: true });
      toast.success('บทเรียนเสร็จสมบูรณ์!');

      // Find next lesson
      if (course?.sections) {
        let foundCurrent = false;
        for (const section of course.sections) {
          for (const lesson of section.lessons) {
            if (foundCurrent) {
              navigate(`/learn/${courseSlug}/${lesson.id}`);
              return;
            }
            if (lesson.id === currentLesson.id) {
              foundCurrent = true;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-white flex-shrink-0 overflow-hidden transition-all duration-300`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <button
              onClick={() => navigate('/dashboard/my-courses')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              กลับ
            </button>
            <h2 className="font-semibold text-gray-900 line-clamp-2">
              {course?.title}
            </h2>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto">
            {course?.sections?.map((section, sectionIndex) => (
              <div key={section.id}>
                <div className="px-4 py-3 bg-gray-50 font-medium text-sm text-gray-700">
                  {sectionIndex + 1}. {section.title}
                </div>
                <ul>
                  {section.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id}>
                      <button
                        onClick={() => navigate(`/learn/${courseSlug}/${lesson.id}`)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                          currentLesson?.id === lesson.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3">
                          {lesson.progress?.isCompleted ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                          ) : lesson.type === 'VIDEO' ? (
                            <PlayIcon className="h-3 w-3 text-gray-400" />
                          ) : lesson.type === 'QUIZ' ? (
                            <AcademicCapIcon className="h-3 w-3 text-gray-400" />
                          ) : (
                            <DocumentTextIcon className="h-3 w-3 text-gray-400" />
                          )}
                        </span>
                        <span className="flex-1 text-sm text-gray-700 line-clamp-2">
                          {sectionIndex + 1}.{lessonIndex + 1} {lesson.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          <ChevronLeftIcon
            className={`h-5 w-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
          />
        </button>

        {/* Video/Content Area */}
        <div className="flex-1 flex flex-col">
          {currentLesson?.type === 'VIDEO' && currentLesson.videoUrl ? (
            <div className="aspect-video bg-black">
              <ReactPlayer
                url={currentLesson.videoUrl}
                width="100%"
                height="100%"
                controls
                onEnded={handleLessonComplete}
              />
            </div>
          ) : currentLesson?.type === 'TEXT' ? (
            <div className="flex-1 bg-white p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto prose">
                <h1>{currentLesson.title}</h1>
                <div className="whitespace-pre-line">{currentLesson.content}</div>
              </div>
            </div>
          ) : currentLesson?.type === 'QUIZ' ? (
            <div className="flex-1 bg-white p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
                <p className="text-gray-600 mb-6">แบบทดสอบสำหรับบทเรียนนี้</p>
                {currentLesson.quiz && (
                  <div className="space-y-6">
                    {currentLesson.quiz.questions.map((q, index) => (
                      <div key={q.id} className="bg-gray-50 rounded-lg p-6">
                        <p className="font-medium mb-4">
                          {index + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {(q.options as string[]).map((option, optIndex) => (
                            <label
                              key={optIndex}
                              className="flex items-center p-3 bg-white rounded border cursor-pointer hover:border-primary-500"
                            >
                              <input type="radio" name={`q-${q.id}`} className="mr-3" />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button className="btn btn-primary w-full py-3">
                      ส่งคำตอบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              เลือกบทเรียนเพื่อเริ่มเรียน
            </div>
          )}

          {/* Bottom Bar */}
          {currentLesson && (
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{currentLesson.title}</h3>
              </div>
              <button
                onClick={handleLessonComplete}
                className="btn bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                ทำเครื่องหมายว่าเสร็จสิ้น
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
