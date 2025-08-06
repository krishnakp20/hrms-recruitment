# 🔧 Frontend Troubleshooting Guide

## **Issue: Frontend Not Connecting to Backend**

If your frontend is running but not performing any actions, follow these steps:

### **✅ Step 1: Verify Backend is Running**

1. **Check if backend is accessible**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Test login endpoint**:
   ```bash
   Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "admin@hrms.com", "password": "admin123"}'
   ```

### **✅ Step 2: Verify Frontend Environment**

1. **Check if `.env` file exists**:
   ```bash
   cd frontend
   cat .env
   ```
   Should contain:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_APP_NAME=HRMS Recruitment System
   ```

2. **If `.env` is missing, create it**:
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   echo "VITE_APP_NAME=HRMS Recruitment System" >> .env
   ```

### **✅ Step 3: Restart Frontend**

1. **Stop the frontend server** (Ctrl+C in the terminal)
2. **Restart with environment variables**:
   ```bash
   npm run dev
   ```

### **✅ Step 4: Test Login**

1. **Open browser** to http://localhost:3000
2. **Use these credentials**:
   - Email: `admin@hrms.com`
   - Password: `admin123`
3. **Check browser console** (F12) for any errors

### **✅ Step 5: Check Network Tab**

1. **Open browser developer tools** (F12)
2. **Go to Network tab**
3. **Try to login** and check if API calls are being made
4. **Look for any failed requests** to http://localhost:8000

---

## **Common Issues & Solutions**

### **❌ Issue: "Cannot connect to backend"**

**Solution**:
1. Make sure backend is running on port 8000
2. Check if port 8000 is not blocked by firewall
3. Try accessing http://localhost:8000/docs directly

### **❌ Issue: "CORS errors"**

**Solution**:
1. Backend is already configured for CORS
2. Make sure backend is running
3. Check that frontend is using correct API URL

### **❌ Issue: "Login not working"**

**Solution**:
1. Check browser console for errors
2. Verify API endpoint is correct
3. Make sure database is initialized with sample users

### **❌ Issue: "Frontend not loading"**

**Solution**:
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Clear cache: `npm run dev -- --force`

---

## **Quick Fix Commands**

```bash
# 1. Check backend
curl http://localhost:8000/health

# 2. Check frontend environment
cd frontend
cat .env

# 3. Restart frontend
npm run dev

# 4. Test login API
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "admin@hrms.com", "password": "admin123"}'
```

---

## **Manual Setup (If Launcher Doesn't Work)**

```bash
# Terminal 1 - Backend
cd backend
python init_database.py
python main.py

# Terminal 2 - Frontend
cd frontend
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
echo "VITE_APP_NAME=HRMS Recruitment System" >> .env
npm run dev
```

---

## **Expected Behavior**

✅ **Working System Should**:
1. **Backend running** on http://localhost:8000
2. **Frontend running** on http://localhost:3000
3. **Login page** loads correctly
4. **Login works** with admin@hrms.com / admin123
5. **Dashboard loads** after successful login
6. **Navigation works** between different pages

---

## **Debug Information**

### **Backend Status**:
- ✅ Health check: http://localhost:8000/health
- ✅ API docs: http://localhost:8000/docs
- ✅ Database: SQLite (no MySQL required)

### **Frontend Status**:
- ✅ Environment: VITE_API_BASE_URL=http://localhost:8000
- ✅ Authentication: JWT tokens
- ✅ Protected routes: All pages except login
- ✅ Auto-logout: On token expiration

### **Sample Users**:
- **Admin**: admin@hrms.com / admin123
- **HR SPOC**: hr.spoc@company.com / hr123
- **Employer**: employer@company.com / emp123
- **Recruiter**: recruiter@company.com / rec123

---

**🎯 If you're still having issues, please share:**
1. **Browser console errors** (F12 → Console)
2. **Network tab requests** (F12 → Network)
3. **Backend terminal output**
4. **Frontend terminal output** 