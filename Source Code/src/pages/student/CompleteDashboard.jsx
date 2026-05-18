import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import studentService from '@/services/api/studentService';
import { useAuth } from '@/hooks/useAuth';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Student data states
    const [studentProfile, setStudentProfile] = useState(null);
    const [studentAcademics, setStudentAcademics] = useState(null);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [grades, setGrades] = useState([]);
    const [gpa, setGPA] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [exams, setExams] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [feeStructure, setFeeStructure] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [scholarships, setScholarships] = useState([]);
    const [academicProgress, setAcademicProgress] = useState(null);
    const [performanceAnalytics, setPerformanceAnalytics] = useState(null);

    // Additional data states
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [learningPaths, setLearningPaths] = useState([]);
    const [collaborations, setCollaborations] = useState([]);
    const [libraryBooks, setLibraryBooks] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [realtimeNotifications, setRealtimeNotifications] = useState([]);
    const [courseRegistration, setCourseRegistration] = useState({ courseId: '' });
    const [leaveRequest, setLeaveRequest] = useState({ 
        reason: '', 
        startDate: '', 
        endDate: '', 
        type: 'medical' 
    });
    const [supportTicket, setSupportTicket] = useState({ 
        subject: '', 
        description: '', 
        category: 'academic' 
    });
    const [feedback, setFeedback] = useState({ 
        courseId: '', 
        rating: 5, 
        comments: '' 
    });
    const [leaveRequest, setLeaveRequest] = useState({ 
        reason: '', 
        startDate: '', 
        endDate: '', 
        type: 'medical' 
    });

    useEffect(() => {
        if (user?.id) {
            loadStudentData();
        }
    }, [user]);

    const loadStudentData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load critical data first
            const criticalData = await Promise.allSettled([
                studentService.getStudentProfile(user.id),
                studentService.getEnrolledCourses(user.id),
                studentService.getAssignments(user.id),
                studentService.getGrades(user.id)
            ]);

            // Set critical data immediately
            if (criticalData[0].status === 'fulfilled') setStudentProfile(criticalData[0].value);
            if (criticalData[1].status === 'fulfilled') setEnrolledCourses(criticalData[1].value.data?.courses || []);
            if (criticalData[2].status === 'fulfilled') setAssignments(criticalData[2].value.data?.assignments || []);
            if (criticalData[3].status === 'fulfilled') setGrades(criticalData[3].value.data?.grades || []);

            // Load secondary data in background
            const secondaryData = await Promise.allSettled([
                studentService.getStudentAcademics(user.id),
                studentService.getCurrentSemester(user.id),
                studentService.getGPA(user.id),
                studentService.getAttendanceRecords(user.id),
                studentService.getExams(user.id),
                studentService.getExamResults(user.id),
                studentService.getTimetable(user.id),
                studentService.getTodaySchedule(user.id),
                studentService.getNotifications(user.id),
                studentService.getAnnouncements(user.id),
                studentService.getFeeStructure(user.id),
                studentService.getPaymentHistory(user.id),
                studentService.getScholarships(user.id),
                studentService.getAcademicProgress(user.id),
                studentService.getPerformanceAnalytics(user.id)
            ]);

            // Set secondary data
            if (secondaryData[0].status === 'fulfilled') setStudentAcademics(secondaryData[0].value);
            if (secondaryData[1].status === 'fulfilled') setCurrentSemester(secondaryData[1].value);
            if (secondaryData[2].status === 'fulfilled') setGPA(secondaryData[2].value);
            if (secondaryData[3].status === 'fulfilled') setAttendance(secondaryData[3].value.data?.attendance || []);
            if (secondaryData[4].status === 'fulfilled') setExams(secondaryData[4].value.data?.exams || []);
            if (secondaryData[5].status === 'fulfilled') setExamResults(secondaryData[5].value.data?.results || []);
            if (secondaryData[6].status === 'fulfilled') setTimetable(secondaryData[6].value.data?.timetable || []);
            if (secondaryData[7].status === 'fulfilled') setTodaySchedule(secondaryData[7].value.data?.schedule || []);
            if (secondaryData[8].status === 'fulfilled') setNotifications(secondaryData[8].value.data?.notifications || []);
            if (secondaryData[9].status === 'fulfilled') setAnnouncements(secondaryData[9].value.data?.announcements || []);
            if (secondaryData[10].status === 'fulfilled') setFeeStructure(secondaryData[10].value);
            if (secondaryData[11].status === 'fulfilled') setPaymentHistory(secondaryData[11].value.data?.payments || []);
            if (secondaryData[12].status === 'fulfilled') setScholarships(secondaryData[12].value.data?.scholarships || []);
            if (secondaryData[13].status === 'fulfilled') setAcademicProgress(secondaryData[13].value);
            if (secondaryData[14].status === 'fulfilled') setPerformanceAnalytics(secondaryData[14].value);

            // Load tertiary data in background
            const tertiaryData = await Promise.allSettled([
                studentService.getCalendarEvents(user.id),
                studentService.getMessages(user.id),
                studentService.getAnalytics(user.id),
                studentService.getCertificates(user.id),
                studentService.getLearningPaths(user.id),
                studentService.getCollaborations(user.id),
                studentService.getLibraryBooks(user.id),
                studentService.getAchievements(user.id),
                studentService.getRealtimeNotifications(user.id)
            ]);

            // Set tertiary data
            if (tertiaryData[0].status === 'fulfilled') setCalendarEvents(tertiaryData[0].value.data?.events || []);
            if (tertiaryData[1].status === 'fulfilled') setMessages(tertiaryData[1].value.data?.messages || []);
            if (tertiaryData[2].status === 'fulfilled') setAnalytics(tertiaryData[2].value);
            if (tertiaryData[3].status === 'fulfilled') setCertificates(tertiaryData[3].value.data?.certificates || []);
            if (tertiaryData[4].status === 'fulfilled') setLearningPaths(tertiaryData[4].value.data?.paths || []);
            if (tertiaryData[5].status === 'fulfilled') setCollaborations(tertiaryData[5].value.data?.collaborations || []);
            if (tertiaryData[6].status === 'fulfilled') setLibraryBooks(tertiaryData[6].value.data?.books || []);
            if (tertiaryData[7].status === 'fulfilled') setAchievements(tertiaryData[7].value.data?.achievements || []);
            if (tertiaryData[8].status === 'fulfilled') setRealtimeNotifications(tertiaryData[8].value.data?.notifications || []);

        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to load student data');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseRegistration = async () => {
        try {
            await studentService.registerForCourse(user.id, courseRegistration.courseId);
            setCourseRegistration({ courseId: '' });
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to register for course');
        }
    };

    const handleDropCourse = async (courseId) => {
        try {
            await studentService.dropCourse(user.id, courseId);
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to drop course');
        }
    };

    const handleSubmitAssignment = async (assignmentId, submissionData) => {
        try {
            await studentService.submitAssignment(assignmentId, submissionData);
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to submit assignment');
        }
    };

    const handleSubmitLeaveRequest = async () => {
        try {
            await studentService.submitLeaveRequest(user.id, leaveRequest);
            setLeaveRequest({ reason: '', startDate: '', endDate: '', type: 'medical' });
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to submit leave request');
        }
    };

    const handleCreateSupportTicket = async () => {
        try {
            await studentService.createSupportTicket(user.id, supportTicket);
            setSupportTicket({ subject: '', description: '', category: 'academic' });
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to create support ticket');
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            await studentService.submitFeedback(user.id, feedback);
            setFeedback({ courseId: '', rating: 5, comments: '' });
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to submit feedback');
        }
    };

    const handleMarkNotificationRead = async (notificationId) => {
        try {
            await studentService.markNotificationRead(notificationId);
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to mark notification as read');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await studentService.updateStudentProfile(user.id, studentProfile);
            await loadStudentData();
        } catch (err) {
            setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Failed to update profile');
        }
    };

    const refreshData = () => {
        loadStudentData();
    };

    // Add error recovery
    const retryFailedRequests = async () => {
        setError(null);
        await loadStudentData();
    };

    // Add data caching to prevent unnecessary reloads
    const lastDataLoad = useRef(Date.now());
    const dataCacheTimeout = 5 * 60 * 1000; // 5 minutes

    const loadStudentDataWithCache = async () => {
        const now = Date.now();
        if (now - lastDataLoad.current < dataCacheTimeout && !error) {
            return; // Use cached data
        }
        lastDataLoad.current = now;
        await loadStudentData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-lg font-medium">Loading Student Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Student Dashboard</h1>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={refreshData} variant="outline" size="sm">
                        Refresh Data
                    </Button>
                    {error && (
                        <Button onClick={retryFailedRequests} variant="destructive" size="sm">
                            Retry
                        </Button>
                    )}
                    <Badge variant="secondary">
                        {studentProfile?.name || 'Student'}
                    </Badge>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </Alert>
            )}

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-9">
                    <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="courses" className="text-xs md:text-sm">Courses</TabsTrigger>
                    <TabsTrigger value="assignments" className="text-xs md:text-sm">Assignments</TabsTrigger>
                    <TabsTrigger value="grades" className="text-xs md:text-sm">Grades</TabsTrigger>
                    <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
                    <TabsTrigger value="messages" className="text-xs md:text-sm">Messages</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs md:text-sm">Analytics</TabsTrigger>
                    <TabsTrigger value="library" className="text-xs md:text-sm">Library</TabsTrigger>
                    <TabsTrigger value="profile" className="text-xs md:text-sm">Profile</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Student Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {studentProfile && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Name</span>
                                            <Badge>{studentProfile.name}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Student ID</span>
                                            <span className="text-sm">{studentProfile.studentId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Program</span>
                                            <Badge variant="outline">{studentProfile.program?.name || 'N/A'}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Semester</span>
                                            <Badge variant="outline">{currentSemester?.semesterNumber || 'N/A'}</Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Academic Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {gpa && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Current GPA</span>
                                            <Badge variant={gpa.currentGPA >= 3.5 ? "default" : gpa.currentGPA >= 2.5 ? "secondary" : "destructive"}>
                                                {gpa.currentGPA || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Cumulative GPA</span>
                                            <Badge variant={gpa.cumulativeGPA >= 3.5 ? "default" : gpa.cumulativeGPA >= 2.5 ? "secondary" : "destructive"}>
                                                {gpa.cumulativeGPA || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Completed Credits</span>
                                            <span>{gpa.completedCredits || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Credits</span>
                                            <span>{gpa.totalCredits || 0}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Attendance Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attendance.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span>Overall Attendance</span>
                                            <Progress value={attendance[0]?.percentage || 0} className="w-20" />
                                            <Badge>{attendance[0]?.percentage || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Classes Attended</span>
                                            <span>{attendance[0]?.attended || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Classes</span>
                                            <span>{attendance[0]?.total || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status</span>
                                            <Badge variant={attendance[0]?.percentage >= 75 ? "default" : "destructive"}>
                                                {attendance[0]?.percentage >= 75 ? 'Good' : 'Poor'}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {todaySchedule.length > 0 ? (
                                    <div className="space-y-2">
                                        {todaySchedule.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                                                <div>
                                                    <div className="font-medium">{item.courseName}</div>
                                                    <div className="text-sm text-muted-foreground">{item.time}</div>
                                                </div>
                                                <Badge variant="outline">{item.type}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No classes scheduled for today</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Notifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {notifications.length > 0 ? (
                                    <div className="space-y-2">
                                        {notifications.slice(0, 3).map((notification, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                                                <div>
                                                    <div className="font-medium">{notification.title}</div>
                                                    <div className="text-sm text-muted-foreground">{notification.message}</div>
                                                </div>
                                                <Badge variant={notification.read ? "secondary" : "default"}>
                                                    {notification.read ? 'Read' : 'New'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No new notifications</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={() => setActiveTab('courses')} className="w-full">
                                    Course Registration
                                </Button>
                                <Button onClick={() => setActiveTab('assignments')} variant="outline" className="w-full">
                                    View Assignments
                                </Button>
                                <Button onClick={() => setActiveTab('grades')} variant="outline" className="w-full">
                                    Check Grades
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Enrolled Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Enrolled Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {enrolledCourses.map((course, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{course.name}</div>
                                                <div className="text-sm text-muted-foreground">{course.code}</div>
                                                <div className="text-sm text-muted-foreground">Credits: {course.credits}</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <Badge variant={course.status === 'active' ? "default" : "secondary"}>
                                                    {course.status}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDropCourse(course.id)}
                                                >
                                                    Drop
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Registration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Registration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Select Course</Label>
                                    <Select value={courseRegistration.courseId} onValueChange={(value) => setCourseRegistration({ ...courseRegistration, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course to register" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* This would be populated with available courses */}
                                            <SelectItem value="course1">Introduction to Computer Science</SelectItem>
                                            <SelectItem value="course2">Data Structures</SelectItem>
                                            <SelectItem value="course3">Algorithms</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCourseRegistration} className="w-full">
                                    Register for Course
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Assignments List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Assignments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {assignments.map((assignment, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{assignment.title}</div>
                                                <div className="text-sm text-muted-foreground">{assignment.courseName}</div>
                                                <div className="text-sm text-muted-foreground">Due: {assignment.dueDate}</div>
                                                <div className="text-sm text-muted-foreground">Points: {assignment.totalPoints}</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <Badge variant={assignment.status === 'submitted' ? "default" : assignment.status === 'overdue' ? "destructive" : "secondary"}>
                                                    {assignment.status}
                                                </Badge>
                                                {assignment.status !== 'submitted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSubmitAssignment(assignment.id, { submittedAt: new Date() })}
                                                    >
                                                        Submit
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Assignments</span>
                                        <Badge>{assignments.length}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Submitted</span>
                                        <Badge variant="default">{assignments.filter(a => a.status === 'submitted').length}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pending</span>
                                        <Badge variant="secondary">{assignments.filter(a => a.status === 'pending').length}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Overdue</span>
                                        <Badge variant="destructive">{assignments.filter(a => a.status === 'overdue').length}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Grades List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Grades</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {grades.map((grade, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{grade.courseName}</div>
                                                <div className="text-sm text-muted-foreground">{grade.assignmentName}</div>
                                                <div className="text-sm text-muted-foreground">Grade: {grade.grade}</div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={grade.grade >= 'A' ? "default" : grade.grade >= 'C' ? "secondary" : "destructive"}>
                                                    {grade.grade}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {academicProgress && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Overall Progress</span>
                                            <Progress value={academicProgress.overallProgress || 0} className="w-20" />
                                            <Badge>{academicProgress.overallProgress || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Semester Progress</span>
                                            <Progress value={academicProgress.semesterProgress || 0} className="w-20" />
                                            <Badge>{academicProgress.semesterProgress || 0}%</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Credits Completed</span>
                                            <span>{academicProgress.creditsCompleted || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>CGPA</span>
                                            <Badge variant={academicProgress.cgpa >= 3.5 ? "default" : academicProgress.cgpa >= 2.5 ? "secondary" : "destructive"}>
                                                {academicProgress.cgpa || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Timetable */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Timetable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {timetable.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{item.courseName}</div>
                                                <div className="text-sm text-muted-foreground">{item.day}</div>
                                                <div className="text-sm text-muted-foreground">{item.time}</div>
                                                <div className="text-sm text-muted-foreground">{item.room}</div>
                                            </div>
                                            <Badge variant="outline">{item.type}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Today's Detailed Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Detailed Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {todaySchedule.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <div className="font-medium">{item.courseName}</div>
                                                <div className="text-sm text-muted-foreground">{item.time}</div>
                                                <div className="text-sm text-muted-foreground">{item.duration} min</div>
                                            </div>
                                            <Badge variant={item.type === 'lecture' ? "default" : item.type === 'lab' ? "secondary" : "outline"}>
                                                {item.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Calendar Widget */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Calendar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {calendarEvents.length > 0 ? (
                                        calendarEvents.slice(0, 5).map((event, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{event.title}</div>
                                                    <div className="text-sm text-muted-foreground">{event.date}</div>
                                                    <div className="text-sm text-muted-foreground">{event.type}</div>
                                                </div>
                                                <Badge variant={event.type === 'exam' ? 'destructive' : event.type === 'assignment' ? 'default' : 'secondary'}>
                                                    {event.type}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No upcoming events</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {todaySchedule.length > 0 ? (
                                        todaySchedule.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{item.course}</div>
                                                    <div className="text-sm text-muted-foreground">{item.time}</div>
                                                    <div className="text-sm text-muted-foreground">{item.room}</div>
                                                </div>
                                                <Badge variant="outline">
                                                    {item.type}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No classes today</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Messages */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Messages</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {messages.length > 0 ? (
                                        messages.slice(0, 5).map((message, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{message.sender}</div>
                                                    <div className="text-sm text-muted-foreground">{message.subject}</div>
                                                    <div className="text-sm text-muted-foreground">{message.time}</div>
                                                </div>
                                                <Badge variant={message.read ? 'secondary' : 'default'}>
                                                    {message.read ? 'Read' : 'Unread'}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No messages</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Compose */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Compose</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>To</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="faculty">Faculty</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="support">Support</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Subject</Label>
                                    <Input placeholder="Enter subject" />
                                </div>
                                <div>
                                    <Label>Message</Label>
                                    <Textarea placeholder="Enter your message" />
                                </div>
                                <Button className="w-full">Send Message</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analytics ? (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span>Overall Performance</span>
                                                <Progress value={analytics.overallPerformance || 0} className="w-20" />
                                                <Badge>{analytics.overallPerformance || 0}%</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Assignment Completion Rate</span>
                                                <span>{analytics.assignmentCompletion || 0}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Attendance Rate</span>
                                                <span>{analytics.attendanceRate || 0}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Study Hours per Week</span>
                                                <span>{analytics.studyHours || 0}h</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">No analytics data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Learning Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Learning Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {learningPaths.length > 0 ? (
                                        learningPaths.slice(0, 3).map((path, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{path.title}</div>
                                                    <div className="text-sm text-muted-foreground">{path.description}</div>
                                                </div>
                                                <Progress value={path.progress || 0} className="w-16" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No learning paths available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Library Tab */}
                <TabsContent value="library" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Borrowed Books */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Borrowed Books</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {libraryBooks.length > 0 ? (
                                        libraryBooks.filter(book => book.status === 'borrowed').map((book, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{book.title}</div>
                                                    <div className="text-sm text-muted-foreground">{book.author}</div>
                                                    <div className="text-sm text-muted-foreground">Due: {book.dueDate}</div>
                                                </div>
                                                <Badge variant={book.overdue ? 'destructive' : 'secondary'}>
                                                    {book.overdue ? 'Overdue' : 'On Time'}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No borrowed books</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Achievements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {achievements.length > 0 ? (
                                        achievements.slice(0, 5).map((achievement, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                                <div>
                                                    <div className="font-medium">{achievement.title}</div>
                                                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                                                </div>
                                                <Badge variant="default">
                                                    {achievement.type}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No achievements yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Profile Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={studentProfile?.name || ''}
                                        onChange={(e) => setStudentProfile({ ...studentProfile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        value={studentProfile?.email || ''}
                                        onChange={(e) => setStudentProfile({ ...studentProfile, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={studentProfile?.phone || ''}
                                        onChange={(e) => setStudentProfile({ ...studentProfile, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Bio</Label>
                                    <Textarea
                                        value={studentProfile?.bio || ''}
                                        onChange={(e) => setStudentProfile({ ...studentProfile, bio: e.target.value })}
                                        placeholder="Enter your bio"
                                    />
                                </div>
                                <Button onClick={handleUpdateProfile} className="w-full">
                                    Update Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Support & Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Support & Feedback</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Support Ticket</Label>
                                    <Input
                                        value={supportTicket.subject}
                                        onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                                        placeholder="Enter subject"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={supportTicket.description}
                                        onChange={(e) => setSupportTicket({ ...supportTicket, description: e.target.value })}
                                        placeholder="Enter description"
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select value={supportTicket.category} onValueChange={(value) => setSupportTicket({ ...supportTicket, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="academic">Academic</SelectItem>
                                            <SelectItem value="technical">Technical</SelectItem>
                                            <SelectItem value="administrative">Administrative</SelectItem>
                                            <SelectItem value="financial">Financial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreateSupportTicket} className="w-full">
                                    Create Support Ticket
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Course Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Feedback</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Course</Label>
                                    <Select value={feedback.courseId} onValueChange={(value) => setFeedback({ ...feedback, courseId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enrolledCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Rating</Label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Button
                                                key={star}
                                                type="button"
                                                variant={star <= feedback.rating ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setFeedback({ ...feedback, rating: star })}
                                            >
                                                {star}★
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label>Comments</Label>
                                    <Textarea
                                        value={feedback.comments}
                                        onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                                        placeholder="Enter your feedback"
                                    />
                                </div>
                                <Button onClick={handleSubmitFeedback} className="w-full">
                                    Submit Feedback
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Leave Request */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Request</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Leave Type</Label>
                                    <Select value={leaveRequest.type} onValueChange={(value) => setLeaveRequest({ ...leaveRequest, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="medical">Medical</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                            <SelectItem value="academic">Academic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Reason</Label>
                                    <Textarea
                                        value={leaveRequest.reason}
                                        onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                                        placeholder="Enter reason for leave"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={leaveRequest.startDate}
                                            onChange={(e) => setLeaveRequest({ ...leaveRequest, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={leaveRequest.endDate}
                                            onChange={(e) => setLeaveRequest({ ...leaveRequest, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleSubmitLeaveRequest} className="w-full">
                                    Submit Leave Request
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentDashboard;
