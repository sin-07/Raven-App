import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Header, CourseCard, Badge } from '../components';
import { categories, platformStats } from '../constants/mockData';
import { Course, LiveSession, Testimonial } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isLoggedIn, user, loginAsStudent, logout, toggleMode } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const tracks = ['All', 'IIT-JEE', 'NEET Medical', 'Foundation (9-10)', 'Board Exam'];

  const loadData = async () => {
    const [coursesData, liveData, testimonialsData] = await Promise.all([
      apiService.getCourses(),
      apiService.getLiveSessions(),
      apiService.getTestimonials(),
    ]);
    setCourses(coursesData);
    setLiveSessions(liveData);
    setTestimonials(testimonialsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.info('Data Refreshed', 'Latest course schedule & notices updated.');
  };

  const filteredCourses =
    selectedTrack === 'All'
      ? courses
      : selectedTrack === 'IIT-JEE'
      ? courses.filter((c) => c.title.includes('Physics') || c.title.includes('Mathematics'))
      : selectedTrack === 'NEET Medical'
      ? courses.filter((c) => c.title.includes('Biology') || c.title.includes('Chemistry'))
      : selectedTrack === 'Foundation (9-10)'
      ? courses.filter((c) => c.level === 'Beginner')
      : courses;

  const currentLive = liveSessions.find((s) => s.status === 'live') || liveSessions[0];

  const facultyMembers = [
    {
      name: 'Dr. Priya Singh',
      role: 'Head of Physics',
      qual: 'Ph.D. IIT Delhi (12+ Yrs Exp)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&h=140&fit=crop',
    },
    {
      name: 'Prof. Amit Kumar',
      role: 'Head of Mathematics',
      qual: 'M.Sc. IIT Kanpur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&h=140&fit=crop',
    },
    {
      name: 'Dr. Neha Gupta',
      role: 'Head of Chemistry',
      qual: 'Ph.D. Organic Chemistry',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=140&h=140&fit=crop',
    },
    {
      name: 'Dr. Ravi Verma',
      role: 'Head of Biology',
      qual: 'MBBS, Ex-AIIMS Faculty',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=140&h=140&fit=crop',
    },
  ];

  const campusFeatures = [
    { icon: 'snow', title: 'Smart AC Classrooms', desc: 'Acoustic sound-insulated digital lecture halls' },
    { icon: 'book', title: 'Self-Study Library', desc: 'Open 8:00 AM - 8:00 PM with curated reference books' },
    { icon: 'chatbubbles', title: 'Doubt Clearance Desks', desc: '1-on-1 personal mentor desks after every lecture' },
    { icon: 'finger-print', title: 'Biometric Attendance', desc: 'Instant SMS updates to parents for safety & focus' },
  ];

  // ============================================================================
  // 1. VISITOR VIEW (For unauthenticated / first-time prospective students & parents)
  // ============================================================================
  const renderVisitorView = () => (
    <>
      {/* Mode Banner */}
      <View style={styles.modeBar}>
        <View style={styles.modeBadge}>
          <Ionicons name="sparkles" size={13} color="#FFFFFF" />
          <Text style={styles.modeBarText}>Visitor Prospectus Mode</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => loginAsStudent()}
          style={styles.loginBannerBtn}
        >
          <Ionicons name="log-in-outline" size={14} color="#000000" />
          <Text style={styles.loginBannerBtnText}>Student Login</Text>
        </TouchableOpacity>
      </View>

      {/* Visitor Hero Card */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroPill}>
              <Ionicons name="school" size={12} color="#FFFFFF" />
              <Text style={styles.heroPillText}>ADMISSIONS OPEN 2026-27</Text>
            </View>
            <View style={styles.heroLocation}>
              <Ionicons name="location" size={12} color="#E4E4E7" />
              <Text style={styles.heroLocationText}>Patna, Bihar</Text>
            </View>
          </View>

          <Text style={styles.heroHeading}>
            Engineered for Rankers.{'\n'}
            <Text style={styles.heroHighlight}>Built in Patna.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Patna's premier coaching institute for IIT-JEE (Main + Advanced), NEET Medical, and Class 9-12 Foundation batches with expert faculty and proven results.
          </Text>

          <View style={styles.heroActionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                toast.info('Admissions Desk', 'Opening 2026-27 batch registration form.');
                navigation.navigate('Admission');
              }}
              style={styles.heroButton}
            >
              <Text style={styles.heroButtonText}>Apply for Admission</Text>
              <Ionicons name="arrow-forward" size={14} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => loginAsStudent()}
              style={styles.heroSecondaryButton}
            >
              <Text style={styles.heroSecondaryButtonText}>Student Portal</Text>
            </TouchableOpacity>
          </View>

          {/* 4-Item Trust Grid */}
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <Text style={styles.trustNum}>15+</Text>
              <Text style={styles.trustLabel}>Yrs in Patna</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustNum}>1,200+</Text>
              <Text style={styles.trustLabel}>Selections</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustNum}>98.4%</Text>
              <Text style={styles.trustLabel}>Success Rate</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Text style={styles.trustNum}>AIR 48</Text>
              <Text style={styles.trustLabel}>Top Rank</Text>
            </View>
          </View>
        </View>
      </View>

      {/* RSAT Scholarship Test Card */}
      <View style={styles.scholarshipWrapper}>
        <View style={styles.scholarshipCard}>
          <View style={styles.scholarshipLeft}>
            <View style={styles.scholarshipBadge}>
              <Ionicons name="ribbon" size={12} color="#FFFFFF" />
              <Text style={styles.scholarshipBadgeText}>SCHOLARSHIP ADMISSION TEST</Text>
            </View>
            <Text style={styles.scholarshipTitle}>RSAT 2026 Scholarship</Text>
            <Text style={styles.scholarshipSub}>
              Avail up to <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>100% Tuition Fee Waiver</Text> for Class 9-12 & Dropper batches in Patna.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                toast.success('RSAT Scholarship', 'Registering for upcoming Sunday scholarship exam in Patna.');
                navigation.navigate('Admission');
              }}
              style={styles.scholarshipBtn}
            >
              <Text style={styles.scholarshipBtnText}>Register Free for RSAT</Text>
              <Ionicons name="chevron-forward" size={13} color="#000000" />
            </TouchableOpacity>
          </View>
          <View style={styles.scholarshipDiscountBadge}>
            <Text style={styles.discountNum}>100%</Text>
            <Text style={styles.discountSub}>SCHOLARSHIP</Text>
          </View>
        </View>
      </View>

      {/* Quick Services Grid for Visitors */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Institute Portals</Text>
        <Text style={styles.sectionSubtitle}>Quick access for students, parents & applicants</Text>
      </View>

      <View style={styles.shortcutsGrid}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            toast.info('Admissions', 'Opening new student admission portal.');
            navigation.navigate('Admission');
          }}
          style={styles.shortcutItem}
        >
          <View style={styles.shortcutIcon}>
            <Ionicons name="school-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.shortcutText}>New Admission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CoursesTab')}
          style={styles.shortcutItem}
        >
          <View style={styles.shortcutIcon}>
            <Ionicons name="book-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.shortcutText}>All Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            toast.info('Free Test Series', 'Attempt free sample MCQ test.');
            navigation.navigate('TestsTab');
          }}
          style={styles.shortcutItem}
        >
          <View style={styles.shortcutIcon}>
            <Ionicons name="document-text-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.shortcutText}>Mock Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LiveTab')}
          style={styles.shortcutItem}
        >
          <View style={styles.shortcutIcon}>
            <Ionicons name="videocam-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.shortcutText}>Demo Lectures</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notices')}
          style={styles.shortcutItem}
        >
          <View style={styles.shortcutIcon}>
            <Ionicons name="megaphone-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.shortcutText}>Circulars</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            toast.info('Feedback Desk', 'Opening inquiry desk.');
            navigation.navigate('Feedback');
          }}
          style={styles.shortcutItem}
        >
          <View style={styles.shortcutIcon}>
            <Ionicons name="chatbubbles-outline" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.shortcutText}>Ask Query</Text>
        </TouchableOpacity>
      </View>

      {/* 4 Core Pillars */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>The Raven Advantage</Text>
        <Text style={styles.sectionSubtitle}>Why thousands of Patna aspirants choose Raven Tutorials</Text>
      </View>

      <View style={styles.pillarsGrid}>
        <View style={styles.pillarCard}>
          <View style={styles.pillarIconBox}>
            <Ionicons name="people" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.pillarTitle}>100% IIT & Doctor Faculty</Text>
          <Text style={styles.pillarDesc}>Experienced mentors from top IITs and AIIMS delivering concept mastery.</Text>
        </View>

        <View style={styles.pillarCard}>
          <View style={styles.pillarIconBox}>
            <Ionicons name="fitness" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.pillarTitle}>Daily DPP Drill Sets</Text>
          <Text style={styles.pillarDesc}>Structured homework problem sets evaluated and discussed daily in class.</Text>
        </View>

        <View style={styles.pillarCard}>
          <View style={styles.pillarIconBox}>
            <Ionicons name="desktop" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.pillarTitle}>All India Test Series</Text>
          <Text style={styles.pillarDesc}>Computer-based tests on exact NTA exam pattern with percentile rank.</Text>
        </View>

        <View style={styles.pillarCard}>
          <View style={styles.pillarIconBox}>
            <Ionicons name="help-buoy" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.pillarTitle}>Personal Doubt Desks</Text>
          <Text style={styles.pillarDesc}>Dedicated 1-on-1 faculty doubt sessions after classroom lectures.</Text>
        </View>
      </View>

      {/* Academic Program Filter Chips */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Classroom Programs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CoursesTab')}>
          <Text style={styles.viewAllText}>View All ({courses.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {tracks.map((t) => {
          const isSelected = selectedTrack === t;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedTrack(t);
                toast.info(`Filtered by ${t}`);
              }}
              style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured Courses Carousel */}
      <FlatList
        horizontal
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            compact
            onPress={() => {
              toast.info(item.title, `Duration: ${item.duration} • ₹${item.price.toLocaleString('en-IN')}`);
              navigation.navigate('CourseDetail', { id: item.id });
            }}
          />
        )}
      />

      {/* Free Learning Resources Card */}
      <View style={styles.freeResourcesWrapper}>
        <View style={styles.freeResourcesCard}>
          <View style={styles.freeBadge}>
            <Ionicons name="gift-outline" size={13} color="#FFFFFF" />
            <Text style={styles.freeBadgeText}>FREE DEMO DIAGNOSTIC</Text>
          </View>

          <Text style={styles.freeTitle}>Take Raven Free Diagnostic Test</Text>
          <Text style={styles.freeDesc}>
            Attempt a 20-minute conceptual test in Physics, Chemistry, or Maths without logging in. Receive immediate analysis and faculty solutions.
          </Text>

          <View style={styles.freeButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                toast.success('Starting Free Mock', '20-Minute Conceptual Diagnostic Test initialized.');
                navigation.navigate('TestsTab');
              }}
              style={styles.freePrimaryBtn}
            >
              <Text style={styles.freePrimaryBtnText}>Start Free Test</Text>
              <Ionicons name="arrow-forward" size={14} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                toast.info('Demo Lectures', 'Opening faculty video preview archive.');
                navigation.navigate('LiveTab');
              }}
              style={styles.freeSecondaryBtn}
            >
              <Text style={styles.freeSecondaryBtnText}>Watch Free Video Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Faculty Showcase */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Distinguished Faculty</Text>
        <Text style={styles.sectionSubtitle}>Learn from top IITians and seasoned Patna mentors</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {facultyMembers.map((fac, idx) => (
          <View key={idx} style={styles.facultyCard}>
            <Image source={{ uri: fac.avatar }} style={styles.facultyAvatar} />
            <Text style={styles.facultyName}>{fac.name}</Text>
            <Text style={styles.facultyRole}>{fac.role}</Text>
            <Text style={styles.facultyQual}>{fac.qual}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Campus Facilities */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Patna Campus Infrastructure</Text>
        <Text style={styles.sectionSubtitle}>Designed for focused and disciplined learning</Text>
      </View>

      <View style={styles.campusGrid}>
        {campusFeatures.map((feat, idx) => (
          <View key={idx} style={styles.campusItem}>
            <View style={styles.campusIconBox}>
              <Ionicons name={feat.icon as any} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.campusTitle}>{feat.title}</Text>
            <Text style={styles.campusDesc}>{feat.desc}</Text>
          </View>
        ))}
      </View>

      {/* Hall of Fame / Results */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Topper Hall of Fame</Text>
        <Text style={styles.sectionSubtitle}>Recent qualifying results from Raven Tutorials</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {testimonials.map((t) => (
          <View key={t.id} style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <Image source={{ uri: t.avatar }} style={styles.testimonialAvatar} />
              <View style={styles.testimonialAuthor}>
                <Text style={styles.testimonialName}>{t.name}</Text>
                <Text style={styles.testimonialRole}>{t.role}</Text>
              </View>
            </View>
            <View style={styles.testimonialStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={13} color="#FFFFFF" />
              ))}
            </View>
            <Text style={styles.testimonialContent}>"{t.content}"</Text>
          </View>
        ))}
      </ScrollView>

      {/* Visit Raven Tutorials in Patna (Single Unified Patna Campus) */}
      <View style={styles.centersSection}>
        <Text style={styles.centersTitle}>Visit Raven Tutorials in Patna</Text>
        <Text style={styles.centersSub}>Visit our classroom campus for academic counseling and offline admissions</Text>

        <View style={styles.centerBox}>
          <View style={styles.centerIconCircle}>
            <Ionicons name="location" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.centerName}>Raven Tutorials Campus</Text>
            <Text style={styles.centerAddress}>Opposite Pillar 42, Kankarbagh Main Road, Patna - 800020</Text>
            <Text style={styles.centerTimings}>Counseling Hours: 08:30 AM - 07:30 PM (Mon-Sun)</Text>
          </View>
        </View>

        {/* Quick Contact Actions */}
        <View style={styles.contactActionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              toast.info('Admissions Helpline', 'Calling Raven Admissions Desk: +91 91234 56789');
              Linking.openURL('tel:+919123456789').catch(() => {});
            }}
            style={styles.callButton}
          >
            <Ionicons name="call" size={16} color="#000000" />
            <Text style={styles.callButtonText}>Call Admissions Desk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              toast.info('Enquiry Desk', 'Opening Patna faculty feedback and inquiry form.');
              navigation.navigate('Feedback');
            }}
            style={styles.whatsappButton}
          >
            <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
            <Text style={styles.whatsappButtonText}>Enquire Online</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Bottom Callout for Visitors */}
      <View style={styles.bottomVisitorCallout}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomCalloutTitle}>Enrolled Student?</Text>
          <Text style={styles.bottomCalloutSub}>Access your test series, timetable & live lectures.</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => loginAsStudent()}
          style={styles.bottomCalloutBtn}
        >
          <Text style={styles.bottomCalloutBtnText}>Student Login ➔</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // ============================================================================
  // 2. LOGGED-IN STUDENT VIEW (LMS Learning Management System Dashboard)
  // ============================================================================
  const renderStudentView = () => (
    <>
      {/* Student Mode Bar */}
      <View style={styles.studentModeBar}>
        <View style={styles.studentStatusPill}>
          <View style={styles.activeDot} />
          <Text style={styles.studentStatusText}>Enrolled Student LMS • {user?.registrationId || 'RAV-2026-0842'}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => logout()}
          style={styles.signOutBtn}
        >
          <Ionicons name="log-out-outline" size={13} color="#A1A1AA" />
          <Text style={styles.signOutBtnText}>Exit LMS</Text>
        </TouchableOpacity>
      </View>

      {/* Student Welcome & KPI Dashboard */}
      <View style={styles.studentHeroWrapper}>
        <View style={styles.studentHeroCard}>
          <View style={styles.studentProfileRow}>
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&h=140&fit=crop' }}
              style={styles.studentHeroAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.studentGreeting}>Welcome back,</Text>
              <Text style={styles.studentNameDisplay}>{user?.name || 'Rahul Sharma'}</Text>
              <Text style={styles.studentBatchText}>Class 12th IIT-JEE Super-30 • Patna Campus</Text>
            </View>
          </View>

          {/* 3 KPI Metric Cards */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Ionicons name="checkmark-done-circle" size={18} color="#FFFFFF" />
              <Text style={styles.kpiValue}>94.2%</Text>
              <Text style={styles.kpiLabel}>Attendance (48/51)</Text>
            </View>

            <View style={styles.kpiCard}>
              <Ionicons name="book" size={18} color="#FFFFFF" />
              <Text style={styles.kpiValue}>4</Text>
              <Text style={styles.kpiLabel}>Enrolled Courses</Text>
            </View>

            <View style={styles.kpiCard}>
              <Ionicons name="trophy" size={18} color="#FFFFFF" />
              <Text style={styles.kpiValue}>#4</Text>
              <Text style={styles.kpiLabel}>Batch Standing</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Today's Live Class / Schedule Alert */}
      <View style={styles.studentSection}>
        <View style={styles.studentSectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.liveRedPill}>
              <View style={styles.liveBlinkDot} />
              <Text style={styles.liveRedText}>TODAY'S LECTURE</Text>
            </View>
            <Text style={styles.studentSectionTitle}>Classroom Live Stream</Text>
          </View>
          <Text style={styles.studentSectionSub}>Patna Classroom Stream</Text>
        </View>

        <View style={styles.liveClassCard}>
          <View style={styles.liveClassTop}>
            <View style={styles.liveClassSubjectBadge}>
              <Text style={styles.liveClassSubjectText}>PHYSICS</Text>
            </View>
            <Text style={styles.liveClassTime}>04:30 PM - 06:30 PM</Text>
          </View>

          <Text style={styles.liveClassTitle}>Rotational Dynamics: Advanced Center of Mass & Torque Problem Solving</Text>
          <Text style={styles.liveClassInstructor}>Instructor: Dr. Priya Singh (Ph.D. IIT Delhi)</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              toast.success('Joining Lecture', 'Connecting to Patna Classroom live stream server...');
              navigation.navigate('LiveTab');
            }}
            style={styles.joinLiveBtn}
          >
            <Ionicons name="videocam" size={16} color="#000000" />
            <Text style={styles.joinLiveBtnText}>Join Live Lecture Stream</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active & Upcoming Test Series */}
      <View style={styles.studentSection}>
        <View style={styles.studentSectionHeader}>
          <Text style={styles.studentSectionTitle}>Bi-Weekly Test Series</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TestsTab')}>
            <Text style={styles.viewAllText}>All Tests ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testAlertCard}>
          <View style={styles.testAlertTop}>
            <Badge label="NTA CBT PATTERN" variant="primary" size="sm" />
            <Text style={styles.testDueText}>Expires in 4 Hours</Text>
          </View>

          <Text style={styles.testAlertTitle}>JEE Advanced Full Mock Test #4 (Paper 1)</Text>
          <Text style={styles.testAlertMeta}>Physics, Chemistry & Maths • 54 Questions • 180 Mins • 180 Marks</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              toast.info('Starting Test', 'Loading test questions and starting stopwatch.');
              navigation.navigate('TestsTab');
            }}
            style={styles.startTestBtn}
          >
            <Text style={styles.startTestBtnText}>Start Test Now</Text>
            <Ionicons name="arrow-forward" size={15} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Classroom Study Materials & DPP Downloads */}
      <View style={styles.studentSection}>
        <View style={styles.studentSectionHeader}>
          <Text style={styles.studentSectionTitle}>Daily Practice Problems (DPPs)</Text>
          <Text style={styles.studentSectionSub}>Latest assignments discussed in Patna classroom</Text>
        </View>

        <View style={styles.dppCard}>
          <View style={styles.dppIcon}>
            <Ionicons name="document-attach" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dppTitle}>DPP #42 - Rotational Dynamics (JEE Adv)</Text>
            <Text style={styles.dppMeta}>25 Advanced Numerical Problems • PDF (2.4 MB)</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toast.success('DPP Downloaded', 'Saved to local device storage.')}
            style={styles.dppDownloadBtn}
          >
            <Ionicons name="download-outline" size={16} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.dppCard}>
          <View style={styles.dppIcon}>
            <Ionicons name="document-attach" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dppTitle}>DPP #41 - Definite Integrals & Properties</Text>
            <Text style={styles.dppMeta}>30 Problems with step-by-step hints • PDF (1.8 MB)</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toast.success('DPP Downloaded', 'Saved to local device storage.')}
            style={styles.dppDownloadBtn}
          >
            <Ionicons name="download-outline" size={16} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.dppCard}>
          <View style={styles.dppIcon}>
            <Ionicons name="document-attach" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dppTitle}>Formula Sheet - Chemical Kinetics & Electrochem</Text>
            <Text style={styles.dppMeta}>Comprehensive revision chart • PDF (1.1 MB)</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toast.success('Formula Sheet Downloaded', 'Saved to offline library.')}
            style={styles.dppDownloadBtn}
          >
            <Ionicons name="download-outline" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Student Action Shortcuts */}
      <View style={styles.studentSection}>
        <View style={styles.studentSectionHeader}>
          <Text style={styles.studentSectionTitle}>Student Hub Tools</Text>
        </View>

        <View style={styles.studentToolsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              toast.info('Ask Faculty Doubt', 'Submit your problem or upload snapshot.');
              navigation.navigate('Feedback');
            }}
            style={styles.studentToolItem}
          >
            <View style={styles.studentToolIconBox}>
              <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.studentToolText}>Ask Doubt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              toast.info('Test Analysis', 'Viewing your percentile and weak topic diagnostics.');
              navigation.navigate('TestsTab');
            }}
            style={styles.studentToolItem}
          >
            <View style={styles.studentToolIconBox}>
              <Ionicons name="bar-chart-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.studentToolText}>Test Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              toast.info('Attendance Record', '48 present out of 51 total classes (94.2%).');
              navigation.navigate('ProfileTab');
            }}
            style={styles.studentToolItem}
          >
            <View style={styles.studentToolIconBox}>
              <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.studentToolText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              toast.info('Notices', 'Opening institute circulars board.');
              navigation.navigate('Notices');
            }}
            style={styles.studentToolItem}
          >
            <View style={styles.studentToolIconBox}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.studentToolText}>Circulars</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Mode Switcher */}
      <View style={styles.bottomVisitorCallout}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomCalloutTitle}>Need to browse as a visitor?</Text>
          <Text style={styles.bottomCalloutSub}>Switch to institute prospectus and batch details.</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => logout()}
          style={styles.bottomSignOutBtn}
        >
          <Text style={styles.bottomSignOutBtnText}>Exit LMS</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Universal Top Header */}
      <Header
        onPressNotifications={() => navigation.navigate('Notices')}
        onPressProfile={() => navigation.navigate('ProfileTab')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {isLoggedIn ? renderStudentView() : renderVisitorView()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },

  // Visitor Mode Bar
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeBarText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  loginBannerBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  loginBannerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },

  // Student Mode Bar
  studentModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    backgroundColor: '#121214',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  studentStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  studentStatusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  signOutBtnText: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '600',
  },

  // Visitor Hero Section
  heroWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  heroCard: {
    backgroundColor: '#111113',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    gap: 5,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  heroLocationText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 31,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroHighlight: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  heroButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  heroButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  heroSecondaryButton: {
    flex: 1,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  heroSecondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Trust Grid
  trustGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustNum: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  trustLabel: {
    fontSize: 10,
    color: '#71717A',
    marginTop: 2,
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },

  // RSAT Scholarship Card
  scholarshipWrapper: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  scholarshipCard: {
    backgroundColor: '#16161A',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scholarshipLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  scholarshipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    gap: 4,
    marginBottom: 6,
  },
  scholarshipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scholarshipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scholarshipSub: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 17,
    marginBottom: SPACING.md,
  },
  scholarshipBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  scholarshipBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  scholarshipDiscountBadge: {
    backgroundColor: '#27272A',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  discountNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  discountSub: {
    fontSize: 8,
    fontWeight: '800',
    color: '#A1A1AA',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Student View Styles
  studentHeroWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  studentHeroCard: {
    backgroundColor: '#121214',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  studentProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  studentHeroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  studentGreeting: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  studentNameDisplay: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  studentBatchText: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  kpiLabel: {
    fontSize: 9,
    color: '#71717A',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },

  // Student Section
  studentSection: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  studentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  studentSectionSub: {
    fontSize: 11,
    color: '#71717A',
  },
  liveRedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  liveBlinkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveRedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveClassCard: {
    backgroundColor: '#121214',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  liveClassTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  liveClassSubjectBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  liveClassSubjectText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveClassTime: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  liveClassTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  liveClassInstructor: {
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: SPACING.md,
  },
  joinLiveBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  joinLiveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  // Test Alert Card
  testAlertCard: {
    backgroundColor: '#121214',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testAlertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  testDueText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '600',
  },
  testAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  testAlertMeta: {
    fontSize: 11,
    color: '#71717A',
    marginBottom: SPACING.md,
  },
  startTestBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  startTestBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  // DPP Cards
  dppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  dppIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: '#1E1E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dppTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dppMeta: {
    fontSize: 10,
    color: '#71717A',
  },
  dppDownloadBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Student Tools Grid
  studentToolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  studentToolItem: {
    alignItems: 'center',
    flex: 1,
  },
  studentToolIconBox: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  studentToolText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Common Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Shortcuts Grid
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  shortcutItem: {
    width: '31%',
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Pillars Grid
  pillarsGrid: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  pillarCard: {
    backgroundColor: '#111113',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillarIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  pillarDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 17,
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  categoryChipTextActive: {
    color: '#000000',
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
  },

  // Free Resources
  freeResourcesWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  freeResourcesCard: {
    backgroundColor: '#141418',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  freeTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  freeDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  freeButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  freePrimaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  freePrimaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  freeSecondaryBtn: {
    flex: 1,
    backgroundColor: '#1F1F24',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
  },
  freeSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Faculty
  facultyCard: {
    width: 150,
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  facultyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  facultyName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  facultyRole: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 2,
  },
  facultyQual: {
    fontSize: 9,
    color: '#71717A',
    textAlign: 'center',
  },

  // Campus Facilities
  campusGrid: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  campusItem: {
    width: '48%',
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  campusIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  campusTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  campusDesc: {
    fontSize: 10,
    color: '#71717A',
    lineHeight: 14,
  },

  // Testimonials
  testimonialCard: {
    width: 250,
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: SPACING.sm,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  testimonialAuthor: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  testimonialRole: {
    fontSize: 10,
    color: '#71717A',
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 6,
  },
  testimonialContent: {
    fontSize: 11,
    color: '#A1A1AA',
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // Centers Section (Patna Only Unified Campus)
  centersSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  centersTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  centersSub: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: SPACING.md,
    marginTop: 2,
  },
  centerBox: {
    flexDirection: 'row',
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  centerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  centerAddress: {
    fontSize: 11,
    color: '#A1A1AA',
    lineHeight: 16,
    marginBottom: 2,
  },
  centerTimings: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  whatsappButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Bottom Visitor Callout
  bottomVisitorCallout: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: '#141418',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  bottomCalloutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bottomCalloutSub: {
    fontSize: 11,
    color: '#71717A',
    lineHeight: 15,
  },
  bottomCalloutBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
  },
  bottomCalloutBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  bottomSignOutBtn: {
    backgroundColor: '#27272A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomSignOutBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 24,
  },
});
