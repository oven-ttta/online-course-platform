import { LessonType } from '@prisma/client';
import prisma from '../utils/prisma';

interface CreateSectionData {
  courseId: string;
  title: string;
  description?: string;
}

interface CreateLessonData {
  sectionId: string;
  courseId: string;
  title: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  isFree?: boolean;
}

interface UpdateLessonData {
  title?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  isFree?: boolean;
  isPublished?: boolean;
  attachments?: object;
}

class LessonService {
  // Section methods
  async createSection(data: CreateSectionData, instructorId: string) {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    if (course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only add sections to your own courses' };
    }

    // Get max sort order
    const maxOrder = await prisma.section.aggregate({
      where: { courseId: data.courseId },
      _max: { sortOrder: true },
    });

    return prisma.section.create({
      data: {
        ...data,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
      include: {
        lessons: true,
      },
    });
  }

  async updateSection(sectionId: string, instructorId: string, data: { title?: string; description?: string }) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });

    if (!section) {
      throw { statusCode: 404, code: 'SECTION_NOT_FOUND', message: 'Section not found' };
    }

    if (section.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only update your own sections' };
    }

    return prisma.section.update({
      where: { id: sectionId },
      data,
    });
  }

  async deleteSection(sectionId: string, instructorId: string) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });

    if (!section) {
      throw { statusCode: 404, code: 'SECTION_NOT_FOUND', message: 'Section not found' };
    }

    if (section.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only delete your own sections' };
    }

    await prisma.section.delete({ where: { id: sectionId } });

    return { message: 'Section deleted successfully' };
  }

  async reorderSections(courseId: string, instructorId: string, sectionIds: string[]) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    if (course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only reorder your own course sections' };
    }

    // Update sort orders
    await Promise.all(
      sectionIds.map((id, index) =>
        prisma.section.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    return { message: 'Sections reordered successfully' };
  }

  // Lesson methods
  async createLesson(data: CreateLessonData, instructorId: string) {
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
      include: { course: true },
    });

    if (!section) {
      throw { statusCode: 404, code: 'SECTION_NOT_FOUND', message: 'Section not found' };
    }

    if (section.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only add lessons to your own courses' };
    }

    // Get max sort order in section
    const maxOrder = await prisma.lesson.aggregate({
      where: { sectionId: data.sectionId },
      _max: { sortOrder: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        ...data,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });

    // Update course total lessons
    await this.updateCourseTotals(data.courseId);

    return lesson;
  }

  async getLesson(lessonId: string, userId?: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: {
            id: true,
            title: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            instructorId: true,
          },
        },
        quiz: {
          include: {
            questions: {
              select: {
                id: true,
                question: true,
                questionType: true,
                options: true,
                points: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw { statusCode: 404, code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };
    }

    // Check access
    if (!lesson.isFree && userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.courseId,
          },
        },
      });

      if (!enrollment && lesson.course.instructorId !== userId) {
        throw { statusCode: 403, code: 'NOT_ENROLLED', message: 'You must enroll in this course to access this lesson' };
      }
    }

    // Get progress if enrolled
    let progress = null;
    if (userId) {
      progress = await prisma.lessonProgress.findFirst({
        where: {
          lessonId,
          userId,
        },
      });
    }

    return { ...lesson, progress };
  }

  async updateLesson(lessonId: string, instructorId: string, data: UpdateLessonData) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      throw { statusCode: 404, code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };
    }

    if (lesson.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only update your own lessons' };
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    // Update course totals if video duration changed
    if (data.videoDuration !== undefined) {
      await this.updateCourseTotals(lesson.courseId);
    }

    return updatedLesson;
  }

  async deleteLesson(lessonId: string, instructorId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      throw { statusCode: 404, code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };
    }

    if (lesson.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only delete your own lessons' };
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    // Update course totals
    await this.updateCourseTotals(lesson.courseId);

    return { message: 'Lesson deleted successfully' };
  }

  async reorderLessons(sectionId: string, instructorId: string, lessonIds: string[]) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });

    if (!section) {
      throw { statusCode: 404, code: 'SECTION_NOT_FOUND', message: 'Section not found' };
    }

    if (section.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only reorder your own lessons' };
    }

    await Promise.all(
      lessonIds.map((id, index) =>
        prisma.lesson.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    return { message: 'Lessons reordered successfully' };
  }

  // Quiz methods
  async createQuiz(
    lessonId: string,
    instructorId: string,
    data: { passingScore?: number; timeLimit?: number; maxAttempts?: number }
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true, quiz: true },
    });

    if (!lesson) {
      throw { statusCode: 404, code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };
    }

    if (lesson.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only create quizzes for your own lessons' };
    }

    if (lesson.quiz) {
      throw { statusCode: 400, code: 'QUIZ_EXISTS', message: 'This lesson already has a quiz' };
    }

    // Update lesson type to QUIZ
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { type: LessonType.QUIZ },
    });

    return prisma.quiz.create({
      data: {
        lessonId,
        ...data,
      },
    });
  }

  async addQuizQuestion(
    quizId: string,
    instructorId: string,
    data: {
      question: string;
      questionType: string;
      options: object;
      correctAnswers: object;
      explanation?: string;
      points?: number;
    }
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: { course: true },
        },
      },
    });

    if (!quiz) {
      throw { statusCode: 404, code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' };
    }

    if (quiz.lesson.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only add questions to your own quizzes' };
    }

    // Get max sort order
    const maxOrder = await prisma.quizQuestion.aggregate({
      where: { quizId },
      _max: { sortOrder: true },
    });

    return prisma.quizQuestion.create({
      data: {
        ...data,
        quizId,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });
  }

  // Helper methods
  private async updateCourseTotals(courseId: string) {
    const lessons = await prisma.lesson.findMany({
      where: { courseId, isPublished: true },
      select: { videoDuration: true },
    });

    const totalDuration = lessons.reduce((acc, lesson) => acc + (lesson.videoDuration || 0), 0);
    const totalLessons = lessons.length;

    await prisma.course.update({
      where: { id: courseId },
      data: { totalDuration, totalLessons },
    });
  }
}

export default new LessonService();
