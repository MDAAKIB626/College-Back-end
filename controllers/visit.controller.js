import Visit from "../models/Visit.js";

/* ================= GET VISITS ================= */
export const getVisits = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.json(await Visit.find());
    }

    if (req.user.role === "ro") {
      return res.json(
        await Visit.find({ "relationOfficers.email": req.user.email })
      );
    }

    if (req.user.role === "teacher") {
      return res.json(
        await Visit.find({ "teachers.email": req.user.email })
      );
    }

    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch visits" });
  }
};

/* ================= GET SINGLE VISIT ================= */
export const getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }
    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch visit" });
  }
};

/* ================= CREATE VISIT (ADMIN) – SIMPLE ================= */
export const createVisit = async (req, res) => {
  try {
    const visit = await Visit.create({
      school: req.body.school,
      className: req.body.className,
      visitDate: req.body.visitDate,
      teachers: req.body.teachers || [],
      relationOfficers: req.body.relationOfficers || [],
      speaker: req.body.speaker,
      peon: req.body.peon,
      status: "Pending",
    });

    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ message: "Failed to create visit" });
  }
};

/* ================= UPDATE VISIT (ADMIN) ================= */
export const updateVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= SUBMIT SCHOOL DATA (RO) ================= */
export const submitSchoolData = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    visit.status = "Completed";

    visit.schoolData = {
      ...visit.schoolData,
      ...req.body,
      students:
        req.body.students && req.body.students.length > 0
          ? req.body.students
          : visit.schoolData.students,
    };

    await visit.save();
    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit school data" });
  }
};

/* ================= ADD STUDENT REMARK (RO) ================= */
export const addStudentRemark = async (req, res) => {
  try {
    const { id, sid } = req.params;

    const visit = await Visit.findById(id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    const student = visit.schoolData.students.id(sid);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.remarks.push({ text: req.body.text });
    await visit.save();

    res.json({ message: "Remark added" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add remark" });
  }
};
