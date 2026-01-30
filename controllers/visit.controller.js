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

/* ================= GET SINGLE ================= */
export const getVisitById = async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) {
    return res.status(404).json({ message: "Visit not found" });
  }
  res.json(visit);
};

/* ================= CREATE ================= */
export const createVisit = async (req, res) => {
  const visit = await Visit.create({
    ...req.body,
    status: "CREATED",
  });

  res.status(201).json(visit);
};

/* ================= RO UPLOAD ================= */
export const roUpload = async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) {
    return res.status(404).json({ message: "Visit not found" });
  }

  if (!visit.schoolData) visit.schoolData = {};
  if (!visit.schoolData.roWiseStudents) {
    visit.schoolData.roWiseStudents = [];
  }

  const alreadySubmitted = visit.schoolData.roWiseStudents.find(
    r => r.roEmail === req.user.email
  );

  if (alreadySubmitted) {
    return res.status(400).json({
      message: "You already submitted data for this visit",
    });
  }

  visit.schoolData.principal = req.body.principal;

  visit.schoolData.roWiseStudents.push({
    roEmail: req.user.email,
    students: req.body.students,
    submittedAt: new Date(),
  });

  visit.status = "RO_UPLOADED";
  await visit.save();

  res.json({ message: "RO data submitted successfully" });
};

/* ================= ADMIN ASSIGN ================= */
export const adminAssign = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    if (!visit.schoolData.staffAssignments) {
      visit.schoolData.staffAssignments = [];
    }

    // 🔒 already assigned students (global)
    const alreadyAssigned = new Set(
      visit.schoolData.staffAssignments.flatMap(sa =>
        sa.students.map(st => st._id.toString())
      )
    );

    req.body.staffAssignments.forEach(assign => {
      let staffBlock = visit.schoolData.staffAssignments.find(
        s => s.staffEmail === assign.staffEmail
      );

      if (!staffBlock) {
        staffBlock = {
          staffEmail: assign.staffEmail,
          students: [],
          submitted: false,
          updatedAt: new Date(),
        };
        visit.schoolData.staffAssignments.push(staffBlock);
      }

      visit.schoolData.roWiseStudents.forEach(ro => {
        assign.students.forEach(studentId => {
          const sid = studentId.toString();
          if (alreadyAssigned.has(sid)) return;

          const student = ro.students.id(studentId);
          if (!student) return;

          // 🔥🔥 MAIN FIX (MASTER DATA)
          student.assigned = true;

          // STAFF COPY
          staffBlock.students.push({
            ...student.toObject(),
            assigned: true,
          });

          alreadyAssigned.add(sid);
        });
      });
    });

    visit.status = "ADMIN_ASSIGNED";
    await visit.save();

    res.json({ message: "Students assigned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assign failed" });
  }
};

/* ================= STAFF UPDATE ================= */
export const staffUpdate = async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  const { staffEmail, students } = req.body;

  const block = visit.schoolData.staffAssignments.find(
    s => s.staffEmail === staffEmail
  );

  if (!block) {
    return res.status(404).json({ message: "Staff not found" });
  }

  const updatedCount = students.filter(
    s =>
      s.admissionProcess === "Yes" ||
      (s.remarks && s.remarks.length > 0)
  ).length;

  block.students = students;
  block.updatedAt = new Date();
  block.submittedAt = new Date();
  block.submitted = true;
  block.updatedCount = updatedCount;

  // 🔥 MAIN FIX
  visit.status = "STAFF_UPDATED";

  await visit.save();

  res.json({
    message: "Staff updated",
    updatedCount,
  });
};


/* ================= UPDATE REMARK ================= */
export const updateStudentRemark = async (req, res) => {
  try {
    const { studentIndex, remarkIndex, remark } = req.body;

    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    const staffBlock = visit.schoolData.staffAssignments.find(
      s => s.staffEmail === req.user.email
    );

    if (!staffBlock || !staffBlock.students[studentIndex]) {
      return res.status(400).json({ message: "Student not found" });
    }

    if (!staffBlock.students[studentIndex].remarks) {
      staffBlock.students[studentIndex].remarks = [];
    }

    staffBlock.students[studentIndex].remarks[remarkIndex] = {
      ...remark,
      updatedBy: req.user.email,
      updatedAt: new Date(),
    };

    // ❌ duplicate sync removed (IMPORTANT FIX)

    await visit.save();
    res.json({ message: "Remark updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save remark" });
  }
};

/* ================= UPDATE ADMISSION ================= */
export const updateAdmission = async (req, res) => {
  try {
    const { studentIndex, admissionProcess } = req.body;

    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    const staffBlock = visit.schoolData.staffAssignments.find(
      s => s.staffEmail === req.user.email
    );

    if (!staffBlock || !staffBlock.students[studentIndex]) {
      return res.status(400).json({ message: "Student not found" });
    }

    const updatedStudent = staffBlock.students[studentIndex];
    updatedStudent.admissionProcess = admissionProcess;
    staffBlock.updatedAt = new Date();

    // 🔥 update ORIGINAL RO data
    visit.schoolData.roWiseStudents.forEach(ro => {
      ro.students.forEach(st => {
        if (st.studentMobile === updatedStudent.studentMobile) {
          st.admissionProcess = admissionProcess;
        }
      });
    });

    // ❌ rebuild admin summary removed

    await visit.save();
    res.json({ message: "Admission updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update admission" });
  }
};

/* ================= ADMIN VERIFY ================= */
export const adminVerify = async (req, res) => {
  const visit = await Visit.findById(req.params.id);

  visit.status = "ADMIN_VERIFIED";
  visit.schoolData.verifiedBy = req.user.email;
  visit.schoolData.verifiedAt = new Date();

  await visit.save();
  res.json({ message: "Final verified" });
};
