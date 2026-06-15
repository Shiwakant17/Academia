package mth.repository;

import mth.models.Course;
import mth.models.Prerequisite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrerequisiteRepository extends JpaRepository<Prerequisite, Long> {

    List<Prerequisite> findByCourse(Course course);

}