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
  } catch {
    res.status(500).json({ message: "Failed to fetch visits" });
  }
};

/* ================= GET SINGLE ================= */
export const getVisitById = async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) return res.status(404).json({ message: "Visit not found" });
  res.json(visit);
};

/* ================= CREATE ================= */
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

  if (!visit.schoolData) {
    visit.schoolData = {};
  }
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

  // ✅✅ MAIN FIX — PRINCIPAL SAVE
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


export const adminAssign = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    // ensure array exists
    if (!visit.schoolData.staffAssignments) {
      visit.schoolData.staffAssignments = [];
    }

    // 🔒 all already assigned student IDs (GLOBAL)
    const alreadyAssigned = new Set(
      visit.schoolData.staffAssignments.flatMap(sa =>
        sa.students.map(st => st._id.toString())
      )
    );

    // loop assignments from request
    req.body.staffAssignments.forEach(assign => {
      let staffBlock = visit.schoolData.staffAssignments.find(
        s => s.staffEmail === assign.staffEmail
      );

      // create block if not exists
      if (!staffBlock) {
        staffBlock = {
          staffEmail: assign.staffEmail,
          students: [],
            submitted: false,   // 🔥 YE LINE ADD KARO
          assignedAt: new Date(),
        };
        visit.schoolData.staffAssignments.push(staffBlock);
      }

      // find students from RO blocks
      visit.schoolData.roWiseStudents.forEach(ro => {
        assign.students.forEach(studentId => {
          const sid = studentId.toString();

          // ❌ already assigned somewhere
          if (alreadyAssigned.has(sid)) return;

          const student = ro.students.id(studentId);
          if (!student) return;

          // ✅ PUSH WITH SAME _id (IMPORTANT FIX)
          staffBlock.students.push({
            _id: student._id,
            studentName: student.studentName,
            studentMobile: student.studentMobile,
            parentMobile: student.parentMobile,
            className: student.className,
            gender: student.gender,
            interestedBranch: student.interestedBranch,
            mhtCet: student.mhtCet,
            admissionProcess: student.admissionProcess,
            remarks: student.remarks || [],
            assignedTo: assign.staffEmail,
          });

          alreadyAssigned.add(sid); // lock globally
        });
      });
    });

    visit.status = "ADMIN_ASSIGNED";
    await visit.save();

    res.json({
      message: "✅ Students assigned correctly (duplicate blocked)",
    });

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

  block.students = students;
  block.updatedAt = new Date();
  block.submitted = true;   // 🔥 IMPORTANT

  // 🔥 check if ALL teachers submitted
  const allSubmitted = visit.schoolData.staffAssignments.every(
    s => s.submitted === true
  );

  if (allSubmitted) {
    visit.status = "STAFF_UPDATED";
  }

  await visit.save();

  res.json({ message: "Staff updated" });
};


/* ================= REMARK ================= */
/* ================= REMARK (TEACHER FLOW) ================= */
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

    if (!staffBlock) {
      return res.status(404).json({ message: "Staff assignment not found" });
    }

    if (!staffBlock.students[studentIndex]) {
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

    // 🔥 sync for admin view
    visit.schoolData.students =
      visit.schoolData.staffAssignments.flatMap(s => s.students);

    await visit.save();
    res.json({ message: "Remark updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save remark" });
  }
};



/* ================= ADMISSION ================= */
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

    // ✅ 1️⃣ update teacher copy
    const updatedStudent = staffBlock.students[studentIndex];
    updatedStudent.admissionProcess = admissionProcess;
    staffBlock.updatedAt = new Date();

    // ✅ 2️⃣ 🔥 update RO ORIGINAL data
    visit.schoolData.roWiseStudents.forEach(ro => {
      ro.students.forEach(st => {
        if (st.studentMobile === updatedStudent.studentMobile) {
          st.admissionProcess = admissionProcess;
        }
      });
    });

    // ✅ 3️⃣ rebuild admin summary source
    visit.schoolData.students =
      visit.schoolData.roWiseStudents.flatMap(r => r.students);

    await visit.save();
    res.json({ message: "✅ Admission updated everywhere" });

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
