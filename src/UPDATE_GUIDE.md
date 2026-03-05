# 📋 How to Update Access Denied Messages

## ✅ Already Updated:
- Roll.jsx
- Statistics.jsx
- TextEditer.jsx

## 🔄 Remaining Files to Update (17 files):

1. UsersLog.jsx
2. UsageStatics.jsx
3. TucBanner.jsx
4. ShowAllProperties.jsx
5. SearchedData.jsx
6. SearchCar.jsx
7. RemovedCar.jsx
8. PucNumber.jsx
9. PucCar.jsx
10. PromotorProperty.jsx
11. PreApprovedCar.jsx
12. PostedByProperty.jsx
13. PhotoRequest.jsx
14. Places/State.jsx
15. Places/District.jsx
16. Places/City.jsx
17. Places/Area.jsx
18. PendingCar.jsx
19. PendingAssistant.jsx

---

## 🛠️ How to Update Each File (2 Simple Steps):

### Step 1: Add Import at Top
Find the imports section (usually at the top) and add:
```jsx
import AccessDenied from "./components/AccessDenied";
```

If the file is in a subfolder like `Places/State.jsx`, use:
```jsx
import AccessDenied from "../components/AccessDenied";
```

### Step 2: Replace Error Message
Find this pattern:
```jsx
if (!allowedRoles.includes(fileName)) {
  return (
    <div className="text-center text-red-500 font-semibold text-lg mt-10">
      Only admin is allowed to view this file.
    </div>
  );
}
```

Replace it with:
```jsx
if (!allowedRoles.includes(fileName)) {
  return <AccessDenied userRole={adminRole} fileName={fileName} />;
}
```

---

## ✨ Result

Users will now see:
- ❌ Access Denied
- Your role "marketing" doesn't have permission to access this page.
- Please contact your administrator to grant access to this page.

Instead of the generic:
- "Only admin is allowed to view this file."

---

## 📌 Important Notes:

1. **Make sure `adminRole` variable exists** - It should be defined like:
   ```jsx
   const adminRole = reduxAdminRole || localStorage.getItem("adminRole");
   ```
   Most files already have this.

2. **Check the import path** - If the file is in a subfolder, adjust the import path:
   - Same folder: `./components/AccessDenied`
   - One level back: `../components/AccessDenied`
   - Two levels back: `../../components/AccessDenied`

3. **Also update `fileName` variable** - Make sure each file has:
   ```jsx
   const fileName = "PageName"; // Should match the page's permission name
   ```
