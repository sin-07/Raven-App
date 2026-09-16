// Raven Tutorials Mobile API Service Layer
// Seamlessly connects to standalone Express API (port 5000) or falls back to mock LMS data

import {
  dummyCourses,
  dummyTests,
  dummyLiveSessions,
  dummyVideoLectures,
  dummyNotices,
  currentUser,
  dummyTestimonials,
  platformStats,
  studentEnrollments,
} from '../constants/mockData';
import { Course, Test, LiveSession, VideoLecture, Notice, User, AdmissionFormData, FeedbackFormData, TestResult } from '../types';

// Configure base URL:
// On Standalone Express Backend: http://localhost:4000/api
// On Android emulator: http://10.0.2.2:4000/api
// On Physical device via Expo Go: http://<your-local-ip>:4000/api
const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  private useMockFallback = true;

  // Set mock fallback behavior
  setMockFallback(enabled: boolean) {
    this.useMockFallback = enabled;
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    try {
      if (!this.useMockFallback) {
        const res = await fetch(`${API_BASE_URL}/courses`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.courses)) return json.courses;
        }
      }
    } catch {
      // Fall through to mock
    }
    return Promise.resolve(dummyCourses);
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const courses = await this.getCourses();
    return courses.find((c) => c.id === id);
  }

  // Tests
  async getTests(): Promise<Test[]> {
    try {
      if (!this.useMockFallback) {
        const res = await fetch(`${API_BASE_URL}/tests`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.tests)) return json.tests;
        }
      }
    } catch {
      // Fall through to mock
    }
    return Promise.resolve(dummyTests);
  }

  async getTestById(id: string): Promise<Test | undefined> {
    return Promise.resolve(dummyTests.find((t) => t.id === id));
  }

  // Live Classes
  async getLiveSessions(): Promise<LiveSession[]> {
    return Promise.resolve(dummyLiveSessions);
  }

  // Video Lectures
  async getVideoLectures(): Promise<VideoLecture[]> {
    return Promise.resolve(dummyVideoLectures);
  }

  // Notices
  async getNotices(): Promise<Notice[]> {
    try {
      if (!this.useMockFallback) {
        const res = await fetch(`${API_BASE_URL}/notices`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) return json.data;
        }
      }
    } catch {
      // Fall through to mock
    }
    return Promise.resolve(dummyNotices);
  }

  // Current User
  async getCurrentUser(): Promise<User> {
    return Promise.resolve(currentUser);
  }

  // Testimonials & Stats
  async getTestimonials() {
    return Promise.resolve(dummyTestimonials);
  }

  async getPlatformStats() {
    return Promise.resolve(platformStats);
  }

  async getStudentEnrollments() {
    return Promise.resolve(studentEnrollments);
  }

  // Admission Submission
  async submitAdmission(data: AdmissionFormData): Promise<{ success: boolean; registrationId: string; message: string }> {
    try {
      if (!this.useMockFallback) {
        const res = await fetch(`${API_BASE_URL}/admission`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          return json;
        }
      }
    } catch {
      // Fallback
    }

    // Simulate instant successful generation
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regId = `RAV-2026-${randomSuffix}`;
    return Promise.resolve({
      success: true,
      registrationId: regId,
      message: 'Admission form submitted successfully! Please retain this registration ID.',
    });
  }

  // Feedback Submission
  async submitFeedback(data: FeedbackFormData): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.useMockFallback) {
        const res = await fetch(`${API_BASE_URL}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          return json;
        }
      }
    } catch {
      // Fallback
    }
    return Promise.resolve({
      success: true,
      message: 'Your query / feedback has been sent to Raven faculty. We will respond within 24 hours.',
    });
  }

  // Submit Test Result
  async submitTestResult(result: TestResult): Promise<{ success: boolean; result: TestResult }> {
    return Promise.resolve({
      success: true,
      result,
    });
  }
}

export const apiService = new ApiService();
