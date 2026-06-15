package mth.service;

import mth.models.Course;
import mth.models.SemesterPlan;
import mth.models.Student;
import mth.repository.CourseRepository;
import mth.repository.SemesterPlanRepository;
import mth.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SemesterPlanService {

    private final SemesterPlanRepository semesterPlanRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public SemesterPlanService(
            SemesterPlanRepository semesterPlanRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository) {

        this.semesterPlanRepository = semesterPlanRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public SemesterPlan addCourseToSemester(
            Long studentId,
            Long courseId,
            Integer semesterNo) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        List<SemesterPlan> existingPlans =
                semesterPlanRepository.findByStudentAndSemesterNo(
                        student,
                        semesterNo);

        int totalCredits = existingPlans.stream()
                .mapToInt(plan -> plan.getCourse().getCredits())
                .sum();

        if (totalCredits + course.getCredits() > 24) {
            throw new RuntimeException(
                    "Maximum semester credit limit exceeded");
        }

        SemesterPlan plan = new SemesterPlan();

        plan.setStudent(student);
        plan.setCourse(course);
        plan.setSemesterNo(semesterNo);

        return semesterPlanRepository.save(plan);
    }

    public List<SemesterPlan> getStudentPlan(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return semesterPlanRepository.findByStudent(student);
    }

    public List<SemesterPlan> getSemesterPlan(
            Long studentId,
            Integer semesterNo) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return semesterPlanRepository
                .findByStudentAndSemesterNo(student, semesterNo);
    }
    
    public Integer getTotalCredits(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return semesterPlanRepository.findByStudent(student)
                .stream()
                .mapToInt(plan -> plan.getCourse().getCredits())
                .sum();
    }
}