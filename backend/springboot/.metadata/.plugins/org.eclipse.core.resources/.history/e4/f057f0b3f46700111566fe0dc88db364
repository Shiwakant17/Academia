package mth.repository;

import mth.models.SemesterPlan;
import mth.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SemesterPlanRepository extends JpaRepository<SemesterPlan, Long> {

    List<SemesterPlan> findByStudent(Student student);

    List<SemesterPlan> findByStudentAndSemesterNo(Student student, Integer semesterNo);

}