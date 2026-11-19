class Student {
    #name;
    #g1;
    #g2;
    #g3;
    #attendance;

    constructor(name, g1, g2, g3, attendance) {
        this.name = name;
        this.g1 = g1;
        this.g2 = g2;
        this.g3 = g3;
        this.attendance = attendance;
    }

    set name(value) {
        if (!value || value.trim() === "") {
            throw new Error("الرجاء إدخال اسم الطالب.");
        }
        this.#name = value.trim();
    }
    get name() { return this.#name; }

    set g1(val) { this.#g1 = this.checkGrade(val, "المادة الأولى"); }
    get g1() { return this.#g1; }

    set g2(val) { this.#g2 = this.checkGrade(val, "المادة الثانية"); }
    get g2() { return this.#g2; }

    set g3(val) { this.#g3 = this.checkGrade(val, "المادة الثالثة"); }
    get g3() { return this.#g3; }

    set attendance(val) {
        const num = Number(val);
        if (val === "" || isNaN(num) || num < 0 || num > 100) {
            throw new Error("نسبة الحضور يجب أن تكون بين 0 و 100.");
        }
        this.#attendance = num;
    }
    get attendance() { return this.#attendance; }

    checkGrade(val, label) {
        const num = Number(val);
        if (val === "" || isNaN(num) || num < 0 || num > 100) {
            throw new Error(`خطأ في ${label}: يجب أن تكون الدرجة بين 0 و 100.`);
        }
        return num;
    }

    getAverage() {
        return (this.#g1 + this.#g2 + this.#g3) / 3;
    }
}

// 2. الإمساك بعناصر الشاشة (DOM)
const studentsList = [];

const nameInput = document.getElementById("studentName");
const g1Input = document.getElementById("grade1");
const g2Input = document.getElementById("grade2");
const g3Input = document.getElementById("grade3");
const attInput = document.getElementById("attendance");

const addBtn = document.getElementById("addStudentBtn");
const mercyBtn = document.getElementById("mercyBtn");
const errorBox = document.getElementById("errorBox");
const studentsListGroup = document.getElementById("studentsListGroup");
const studentsCountBadge = document.getElementById("studentsCountBadge");
const mercyReportBox = document.getElementById("mercyReportBox");

// 3. زر إضافة طالب
addBtn.onclick = function () {
    errorBox.classList.add("d-none");
    errorBox.innerHTML = "";

    try {
        const student = new Student(
            nameInput.value,
            g1Input.value,
            g2Input.value,
            g3Input.value,
            attInput.value
        );

        studentsList.push(student);
        renderStudents();

        nameInput.value = "";
        g1Input.value = "";
        g2Input.value = "";
        g3Input.value = "";
        attInput.value = "";
    } catch (err) {
        errorBox.classList.remove("d-none");
        errorBox.innerHTML = err.message;
    }
};

function renderStudents() {
    if (studentsCountBadge) {
        studentsCountBadge.textContent = studentsList.length + " طلاب";
    }
    studentsListGroup.innerHTML = "";

    studentsList.forEach((st, i) => {
        const avg = st.getAverage();
        let badge = "";
        if (avg >= 50) {
            badge = `<span class="badge bg-success">ناجح</span>`;
        } else if (avg >= 40 && avg < 50) {
            badge = `<span class="badge bg-warning text-dark">مرشح للرأفة</span>`;
        } else {
            badge = `<span class="badge bg-danger">راسب</span>`;
        }
        
        studentsListGroup.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${i + 1}. ${st.name}</strong>
                    <div class="small text-muted">المتوسط: ${avg.toFixed(1)} | الحضور: ${st.attendance}%</div>
                </div>
                ${badge}
            </li>
        `;
    });
}

// 4. زر تفعيل لجنة الرأفة
mercyBtn.onclick = function () {
    if (studentsList.length === 0) {
        mercyReportBox.innerHTML = `<div class="alert alert-danger mb-0">لا يوجد طلاب مسجلين حالياً.</div>`;
        return;
    }

    // Filter: المتوسط بين 40 و 49.9
    const struggling = studentsList.filter(st => {
        const avg = st.getAverage();
        return avg >= 40 && avg < 50;
    });

    if (struggling.length === 0) {
        mercyReportBox.innerHTML = `<div class="alert alert-warning mb-0">لا يوجد طلاب متعثرون متوسطهم بين 40 و 49.</div>`;
        return;
    }

    // Map: إضافة 5 درجات رأفة
    const newAverages = struggling.map(st => st.getAverage() + 5);

    // Reduce: جمع المتوسطات الجديدة وحساب المتوسط العام
    const total = newAverages.reduce((sum, val) => sum + val, 0);
    const generalAvg = struggling.length > 0 ? (total / struggling.length) : 0;

    // تجهيز قائمة الأسماء
    const namesHTML = struggling.map((st, idx) => {
        return `<li>${st.name} (من ${st.getAverage().toFixed(1)} إلى ${newAverages[idx].toFixed(1)})</li>`;
    }).join("");

    // العرض في صندوق التقرير
    mercyReportBox.innerHTML = `
        <div class="alert alert-success text-start mb-0">
            <p class="mb-1"><strong>عدد الطلاب المتعثرين:</strong> ${struggling.length}</p>
            <p class="mb-1"><strong>أسماء الطلاب بعد الرأفة:</strong></p>
            <ul>${namesHTML}</ul>
            <hr>
            <p class="mb-0"><strong>المتوسط العام بعد التعديل:</strong> ${generalAvg.toFixed(1)}</p>
        </div>
    `;
};