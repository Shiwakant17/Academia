package mth.controller;

import mth.models.Role;
import mth.models.SemesterPlan;
import mth.models.User;
import mth.repository.UserRepository;
import mth.service.SemesterPlanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plans")
@CrossOrigin(origins = "*")
public class SemesterPlanController {

    private final SemesterPlanService semesterPlanService;
    private final UserRepository userRepository;

    public SemesterPlanController(
            SemesterPlanService semesterPlanService,
            UserRepository userRepository) {

        this.semesterPlanService = semesterPlanService;
        this.userRepository = userRepository;
    }

    @PostMapping("/add")
    public SemesterPlan addCourse(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam Integer semesterNo) {

        return semesterPlanService
                .addCourseToSemester(
                        studentId,
                        courseId,
                        semesterNo);
    }

    @GetMapping("/student/{studentId}")
    public List<SemesterPlan> getStudentPlan(
            @PathVariable Long studentId,
            @RequestParam String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only STUDENT can access plans");
        }

        return semesterPlanService.getStudentPlan(studentId);
    }

    @GetMapping("/student/{studentId}/{semesterNo}")
    public List<SemesterPlan> getSemesterPlan(
            @PathVariable Long studentId,
            @PathVariable Integer semesterNo) {

        return semesterPlanService
                .getSemesterPlan(studentId, semesterNo);
    }
    
    @GetMapping("/summary/{studentId}")
    public Integer getSummary(
            @PathVariable Long studentId) {

        return semesterPlanService
                .getTotalCredits(studentId);
    }
}