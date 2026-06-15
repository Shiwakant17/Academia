package mth.controller;

import mth.models.Role;
import mth.models.Student;
import mth.models.User;
import mth.repository.StudentRepository;
import mth.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final StudentRepository studentRepository;

    public AuthController(AuthService authService, StudentRepository studentRepository) {
        this.authService = authService;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {

        String token = authService.login(
                request.get("username"),
                request.get("password")
        );

        User user = authService.getUserByUsername(request.get("username"));

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());

        // If the user is a STUDENT, include their studentId
        if (user.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUser(user);
            studentOpt.ifPresent(s -> response.put("studentId", s.getStudentId()));
        }

        return response;
    }
}