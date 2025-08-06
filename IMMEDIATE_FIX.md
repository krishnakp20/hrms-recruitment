# 🚨 Immediate Fix for Network Error

## **The Issue**
Your frontend is getting a "Network Error" when trying to connect to the backend, even though the backend is running and working.

## **Quick Fix Steps**

### **Step 1: Clear Browser Cache**
1. **Open browser** to http://localhost:3000
2. **Press F12** to open developer tools
3. **Right-click the refresh button** and select "Empty Cache and Hard Reload"
4. **Or press Ctrl+Shift+R** for hard refresh

### **Step 2: Test API Connection**
1. **Click the "Test API Connection" button** on the login page
2. **Check the browser console** (F12 → Console) for results
3. **Look for any error messages**

### **Step 3: Check Environment Variables**
1. **Open browser console** (F12)
2. **Look for this message**: `API_BASE_URL: http://localhost:8000`
3. **If it shows a different URL**, the environment is wrong

### **Step 4: Restart Both Servers**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### **Step 5: Check Ports**
```bash
# Check if backend is on port 8000
curl http://localhost:8000/health

# Check if frontend is on port 3000
curl http://localhost:3000
```

## **Common Solutions**

### **Solution 1: Browser Cache Issue**
- **Hard refresh** the page (Ctrl+Shift+R)
- **Clear browser cache** completely
- **Try incognito/private mode**

### **Solution 2: Port Conflict**
- **Check if port 8000 is free**: `netstat -ano | findstr :8000`
- **Check if port 3000 is free**: `netstat -ano | findstr :3000`
- **Kill conflicting processes** if needed

### **Solution 3: CORS Issue**
- **Backend is already configured** for CORS
- **Make sure both servers are running**
- **Check that frontend URL matches** the allowed origins

### **Solution 4: Environment Variables**
- **Frontend .env file** should contain: `VITE_API_BASE_URL=http://localhost:8000`
- **Restart frontend** after changing .env
- **Check browser console** for the API_BASE_URL message

## **Debug Information**

### **What to Check:**
1. **Browser Console** (F12 → Console)
   - Look for `API_BASE_URL: http://localhost:8000`
   - Look for "Making request to:" messages
   - Look for any error messages

2. **Network Tab** (F12 → Network)
   - Look for requests to `http://localhost:8000`
   - Check if requests are being made
   - Check response status codes

3. **Backend Terminal**
   - Look for incoming requests
   - Check for any error messages

4. **Frontend Terminal**
   - Look for compilation errors
   - Check if server started successfully

## **Expected Console Output**

**✅ Good (Working):**
```
API_BASE_URL: http://localhost:8000
Making request to: /auth/login
Attempting login with: {email: "admin@hrms.com", password: "admin123"}
Response received: 200
```

**❌ Bad (Not Working):**
```
API_BASE_URL: undefined
Network Error
ERR_NETWORK
```

## **If Still Not Working**

1. **Try a different browser** (Chrome, Firefox, Edge)
2. **Disable browser extensions** temporarily
3. **Check Windows Firewall** settings
4. **Try running as administrator**
5. **Restart your computer**

## **Quick Test Commands**

```bash
# Test backend
curl http://localhost:8000/health

# Test login API
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "admin@hrms.com", "password": "admin123"}'

# Check ports
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

---

**🎯 After trying these steps, please share:**
1. **What you see in browser console** (F12 → Console)
2. **What happens when you click "Test API Connection"**
3. **Any error messages** from backend or frontend terminals 