# 🗄️ Database Setup Guide

## **Quick Solution: SQLite (Recommended for Development)**

The system is now configured to use **SQLite** by default, which requires no additional installation!

### **✅ SQLite Setup (Automatic)**

1. **Run the launcher script**:
   ```bash
   # PowerShell
   .\start_system.ps1
   
   # OR Batch file
   .\start_system.bat
   ```

2. **The script will automatically**:
   - Create SQLite database file (`hrms.db`)
   - Initialize all tables
   - Add sample users and data
   - Start both servers

### **📋 Sample Users Created**:
- **Admin**: admin@hrms.com / admin123
- **HR SPOC**: hr.spoc@company.com / hr123
- **Employer**: employer@company.com / emp123
- **Recruiter**: recruiter@company.com / rec123

---

## **Alternative: MySQL Setup (For Production)**

If you prefer to use MySQL:

### **Step 1: Install MySQL**

#### **Option A: MySQL Installer**
1. Download from: https://dev.mysql.com/downloads/installer/
2. Run installer and follow setup wizard
3. Remember the root password you set

#### **Option B: XAMPP (Easier)**
1. Download from: https://www.apachefriends.org/download.html
2. Install and start MySQL from XAMPP Control Panel

### **Step 2: Create Database**

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hrms_db;
USE hrms_db;

# Exit MySQL
exit;
```

### **Step 3: Update Configuration**

Edit `backend/.env`:
```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/hrms_db
```

### **Step 4: Initialize Database**

```bash
cd backend
python init_database.py
```

---

## **Database Comparison**

| Feature | SQLite | MySQL |
|---------|--------|-------|
| **Installation** | ✅ Built-in | ❌ Requires installation |
| **Setup** | ✅ Automatic | ❌ Manual configuration |
| **Performance** | ⚠️ Good for development | ✅ Better for production |
| **Concurrent Users** | ⚠️ Limited | ✅ High |
| **File Size** | ✅ Single file | ❌ Server installation |

---

## **Current Status**

✅ **SQLite is now the default** - No MySQL installation required!

The system will work immediately with SQLite, which is perfect for:
- Development and testing
- Small to medium teams
- Quick setup and deployment

---

## **Troubleshooting**

### **SQLite Issues**
- **Database file not created**: Run `python init_database.py` manually
- **Permission errors**: Check folder write permissions
- **File locked**: Close any applications using the database

### **MySQL Issues**
- **Connection refused**: Make sure MySQL service is running
- **Access denied**: Check username/password in .env file
- **Database not found**: Create the database first

---

## **Quick Start Commands**

```bash
# Option 1: Use launcher (Recommended)
.\start_system.ps1

# Option 2: Manual setup
cd backend
python init_database.py
python main.py

# In another terminal:
cd frontend
npm run dev
```

---

**🎉 You're all set! The system will work with SQLite without any MySQL installation.** 