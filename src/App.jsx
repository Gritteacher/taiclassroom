// src/App.jsx
import { useState } from 'react'
import Swal from 'sweetalert2' 
import { supabase } from './supabaseClient' 
import './App.css'

const TSN_LOGO_URL = 'https://www.tsn.ac.th/web/wp-content/uploads/2013/12/Logo_Blue-700x639.png';

function App() {
  const [studentId, setStudentId] = useState('');
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  
  // สร้าง State สำหรับเก็บข้อมูลที่ดึงมาจากฐานข้อมูล
  const [dashboardData, setDashboardData] = useState({
    scores: [],
    attendance: null,
    tasks: []
  });

const handleLogin = async () => {
    if (studentId.length === 5) {
      
      // 1. เรียกแอนิเมชัน Loading ของ SweetAlert2 ขึ้นมาทันทีที่กดปุ่ม
      Swal.fire({
        title: 'กำลังค้นหาข้อมูล...',
        html: 'โปรดรอสักครู่ครับ ⏳',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // 2. ดึงข้อมูลประวัตินักเรียนจาก Supabase
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .single(); 

      if (student) {
        // 3. ดึงข้อมูลคะแนน, การเข้าเรียน, และภาระงาน (ทำพร้อมกันเพื่อความรวดเร็ว)
        const [scoresRes, attRes, tasksRes] = await Promise.all([
          supabase.from('scores').select('*').eq('student_id', studentId),
          supabase.from('attendance').select('*').eq('student_id', studentId).single(),
          supabase.from('tasks').select('*').eq('student_id', studentId)
        ]);

        setDashboardData({
          scores: scoresRes.data || [],
          attendance: attRes.data || { absent_count: 0, leave_count: 0, late_count: 0 },
          tasks: tasksRes.data || []
        });

        // 4. เปลี่ยนจากหน้า Loading เป็นหน้า Success อัตโนมัติ
        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับ ${student.full_name}`,
          icon: 'success',
          timer: 1500, // โชว์ 1.5 วินาทีแล้วปิดเอง
          showConfirmButton: false
        }).then(() => {
          // โชว์แอนิเมชันเสร็จ ค่อยพาเข้าหน้า Dashboard
          setLoggedInStudent(student);
        });

      } else {
        // ถ้าหาไม่เจอ ก็เปลี่ยนเป็นแจ้งเตือน Error
        Swal.fire({
          title: 'ไม่พบข้อมูล!',
          text: 'ไม่มีรหัสนักเรียนนี้ในระบบครับ',
          icon: 'error',
          confirmButtonColor: '#FFD200'
        });
      }
    } else {
      Swal.fire('ข้อมูลไม่ครบถ้วน!', 'กรุณากรอกรหัสให้ครบ 5 หลักครับ', 'warning');
    }
  }

  const handleLogout = () => {
    setLoggedInStudent(null);
    setStudentId('');
    setDashboardData({ scores: [], attendance: null, tasks: [] }); // ล้างข้อมูลออกเมื่อกดออกระบบ
  }

  return (
    <div className="main-container">
      <header className="header">
        <div className="logo-container">
          <img src={TSN_LOGO_URL} alt="Logo TSN" className="school-logo" />
          <h1 className="website-title">Grithteacher's Classroom</h1>
        </div>
        <div className="class-info">ม.6 สังคมศึกษา</div>
      </header>

      <main className="main-content">
        
        {!loggedInStudent ? (
          <div className="login-card">
            <h3 className="card-title"><span>👤</span> เข้าสู่ระบบนักเรียน</h3>
            <p className="card-instructions">ยินดีต้อนรับนักเรียนชั้น ม.6<br />กรุณากรอกรหัสนักเรียนเพื่อเข้าดูข้อมูลส่วนตัว</p>
            <div className="form-group">
              <label className="form-label">รหัสนักเรียน 5 หลัก</label>
              <input 
                type="text" 
                placeholder="เช่น 12345" 
                maxLength={5}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="login-input"
              />
            </div>
            <button className="login-button" onClick={handleLogin}>เข้าสู่ระบบ</button>
          </div>
        ) 
        
        : (
          <div className="dashboard-wrapper">
            <div className="dashboard-header-bar">
              <div className="student-info">
                <h2>ยินดีต้อนรับ, {loggedInStudent.full_name} 🎓</h2>
                <p>รหัสประจำตัว: {loggedInStudent.student_id} | ชั้นมัธยมศึกษาปีที่ {loggedInStudent.room}</p>
              </div>
              <button className="logout-button" onClick={handleLogout}>ออกจากระบบ</button>
            </div>

            <div className="dashboard-grid">
              
              {/* กล่อง 1: คะแนนเก็บ (ดึงจากฐานข้อมูลจริง) */}
              <div className="dash-card">
                <h3>📊 สรุปคะแนนเก็บ</h3>
                {dashboardData.scores.length > 0 ? (
                  dashboardData.scores.map((item) => (
                    <div key={item.id} className="subject-row">
                      <span className="subject-name">{item.subject}</span>
                      <span className="subject-score">{item.score}/{item.max_score}</span>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', color: '#999'}}>ยังไม่มีข้อมูลคะแนน</p>
                )}
              </div>

              {/* กล่อง 2: สถิติการเข้าเรียน (ดึงจากฐานข้อมูลจริง) */}
              <div className="dash-card">
                <h3>⏱️ สถิติการเข้าเรียน</h3>
                <div className="attendance-flex">
                  <div className="att-box absent">
                    ขาด<span className="att-num">{dashboardData.attendance?.absent_count || 0}</span>
                  </div>
                  <div className="att-box leave">
                    ลา<span className="att-num">{dashboardData.attendance?.leave_count || 0}</span>
                  </div>
                  <div className="att-box late">
                    สาย<span className="att-num">{dashboardData.attendance?.late_count || 0}</span>
                  </div>
                </div>
              </div>

              {/* กล่อง 3: ภาระงานค้างส่ง (ดึงจากฐานข้อมูลจริง) */}
              <div className="dash-card">
                <h3>📝 ภาระงานและใบงาน</h3>
                {dashboardData.tasks.length > 0 ? (
                  dashboardData.tasks.map((task) => (
                    <div key={task.id} className={`task-item ${task.is_done ? 'done' : ''}`}>
                      <strong>วิชา{task.subject}:</strong> {task.task_name}
                      <br />
                      <small style={{color: task.is_done ? 'green' : 'red'}}>
                        {task.is_done ? '*ส่งแล้ว' : `*กำหนดส่ง: ${task.due_date}`}
                      </small>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', color: '#999'}}>ไม่มีงานค้างส่ง เยี่ยมมาก!</p>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      <footer className="footer">
        © 2026 Grithteacher's Classroom | โรงเรียนเทพศิรินทร์ นนทบุรี<br/>
        <span style={{fontSize: '13px', color: '#AAA'}}>Dev by Grithteacher</span>
      </footer>
    </div>
  )
}

export default App;