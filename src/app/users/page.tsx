'use client';

import React, { useState, useMemo } from 'react';
import { useSchool } from '@/lib/stateContext';
import {
  UserData,
  UserRole,
  SystemPermissions,
  ROLE_DEFAULT_PERMISSIONS,
  TeacherData,
} from '@/lib/schoolData';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Shield,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
  UserX,
  Mail,
  Phone,
  School,
  Lock,
  Unlock,
  Sparkles,
  Check,
  Building2,
  Bookmark,
  FileSpreadsheet,
  Settings,
  RefreshCw,
} from 'lucide-react';

const EMPTY_USER_FORM: UserData = {
  id: '',
  username: '',
  email: '',
  khmerName: '',
  latinName: '',
  role: 'SUBJECT_TEACHER',
  teacherId: '',
  assignedClassIds: [],
  assignedSubjectCodes: [],
  status: 'ACTIVE',
  permissions: { ...ROLE_DEFAULT_PERMISSIONS.SUBJECT_TEACHER },
  avatarColor: 'from-blue-600 to-indigo-600',
  phoneNumber: '',
};

const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-purple-600 to-indigo-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
  'from-cyan-600 to-blue-600',
  'from-indigo-600 to-violet-600',
];

import { AccessDenied } from '@/components/AccessDenied';

export default function UsersPage() {
  const {
    school,
    classes,
    teachers,
    specializations,
    users,
    currentUser,
    setCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    hasPermission,
    canAccessRoute,
    language,
    t,
  } = useSchool();

  if (!canAccessRoute('/users') && !hasPermission('canManageUsers')) {
    return <AccessDenied />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State: Add / Edit User
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [formData, setFormData] = useState<UserData>(EMPTY_USER_FORM);
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to format role name and color
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'PRINCIPAL':
        return {
          labelKhmer: 'នាយកសាលា / គណៈគ្រប់គ្រង',
          labelEnglish: 'Principal / Admin',
          icon: ShieldCheck,
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'ACADEMIC_OFFICER':
        return {
          labelKhmer: 'ការិយាល័យសិក្សា / រដ្ឋបាល',
          labelEnglish: 'Academic Officer',
          icon: Shield,
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'HOMEROOM_TEACHER':
        return {
          labelKhmer: 'គ្រូបន្ទុកថ្នាក់',
          labelEnglish: 'Homeroom Teacher',
          icon: GraduationCap,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'SUBJECT_TEACHER':
        return {
          labelKhmer: 'គ្រូបង្រៀនតាមមុខវិជ្ជា',
          labelEnglish: 'Subject Teacher',
          icon: BookOpen,
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'STAFF_VIEWER':
      default:
        return {
          labelKhmer: 'បុគ្គលិកជំនួយ / បណ្ណារក្ស',
          labelEnglish: 'Staff / Viewer',
          icon: Eye,
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.khmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phoneNumber && u.phoneNumber.includes(searchQuery));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormMode('ADD');
    const randomColor = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];
    setFormData({
      ...EMPTY_USER_FORM,
      id: `user-${Date.now()}`,
      avatarColor: randomColor,
      permissions: { ...ROLE_DEFAULT_PERMISSIONS.SUBJECT_TEACHER },
    });
    setUserPassword('');
    setShowUserPassword(false);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserData) => {
    setFormMode('EDIT');
    setFormData({ ...user, permissions: { ...user.permissions } });
    setUserPassword(user.passwordHash || '');
    setShowUserPassword(false);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // When teacher is selected in modal, auto-populate user details
  const handleTeacherSelect = (teacherCivilId: string) => {
    if (!teacherCivilId) {
      setFormData((prev) => ({ ...prev, teacherId: '' }));
      return;
    }

    const teacher = teachers.find((t) => t.civilServantId === teacherCivilId);
    if (teacher) {
      // Find classes where this teacher is homeroom teacher
      const homeroomClasses = classes.filter((c) => c.homeroomTeacherId === teacher.civilServantId).map((c) => c.id);
      const isHomeroom = homeroomClasses.length > 0;
      const targetRole: UserRole = isHomeroom ? 'HOMEROOM_TEACHER' : 'SUBJECT_TEACHER';

      // Find matched specialization code
      const matchedSpec = specializations.find((s) => teacher.specialization.includes(s.nameKhmer) || s.nameKhmer.includes(teacher.specialization));
      const targetSubjects = matchedSpec ? [matchedSpec.code] : [];

      // Generate suggested username
      const usernameBase = teacher.latinName.toLowerCase().replace(/\s+/g, '.');
      const suggestedEmail = `${usernameBase}@watphnom-hs.moeys.gov.kh`;

      setFormData((prev) => ({
        ...prev,
        teacherId: teacher.civilServantId,
        khmerName: teacher.khmerName,
        latinName: teacher.latinName,
        phoneNumber: teacher.phoneNumber,
        username: prev.username || usernameBase,
        email: prev.email || suggestedEmail,
        role: targetRole,
        assignedClassIds: homeroomClasses.length > 0 ? homeroomClasses : prev.assignedClassIds,
        assignedSubjectCodes: targetSubjects.length > 0 ? targetSubjects : prev.assignedSubjectCodes,
        permissions: { ...ROLE_DEFAULT_PERMISSIONS[targetRole] },
      }));
    }
  };

  // Handle Role Change in Form
  const handleRoleChange = (newRole: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: { ...ROLE_DEFAULT_PERMISSIONS[newRole] },
    }));
  };

  // Toggle specific permission flag in form
  const handleTogglePermission = (permKey: keyof SystemPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey],
      },
    }));
  };

  // Submit User Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះគណនី (Username)!' : 'Please enter Username!');
      return;
    }
    if (!formData.khmerName.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលគោត្តនាម-នាម!' : 'Please enter Khmer Name!');
      return;
    }
    if (!formData.email.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលអ៊ីមែល!' : 'Please enter Email!');
      return;
    }

    if (formMode === 'ADD') {
      const exists = users.some(
        (u) => u.username.toLowerCase() === formData.username.toLowerCase() || u.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (exists) {
        setFormError(
          language === 'km' ? 'ឈ្មោះគណនី ឬអ៊ីមែលនេះមានក្នុងប្រព័ន្ធរួចហើយ!' : 'Username or Email already exists!'
        );
        return;
      }
      const dataToSave: UserData = {
        ...formData,
        passwordHash: userPassword.trim() ? userPassword.trim() : '123456',
      };
      addUser(dataToSave);
      showToast(
        language === 'km'
          ? `បានបង្កើតគណនី "${formData.khmerName}" ដោយជោគជ័យ!`
          : `User "${formData.latinName}" created successfully!`
      );
    } else {
      const dataToUpdate: UserData = {
        ...formData,
        ...(userPassword.trim() ? { passwordHash: userPassword.trim() } : {}),
      };
      updateUser(formData.id, dataToUpdate);
      showToast(
        language === 'km'
          ? `បានកែសម្រួលគណនី និងសិទ្ធិរបស់ "${formData.khmerName}" ដោយជោគជ័យ!`
          : `User "${formData.latinName}" updated successfully!`
      );
    }

    setIsFormModalOpen(false);
  };

  // Toggle User Active/Inactive Status
  const handleToggleStatus = (user: UserData) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateUser(user.id, { status: newStatus });
    showToast(
      language === 'km'
        ? `បានប្តូរស្ថានភាពគណនី "${user.khmerName}" ទៅជា ${newStatus === 'ACTIVE' ? '«សកម្ម»' : '«អសកម្ម»'}`
        : `User "${user.latinName}" status changed to ${newStatus}!`
    );
  };

  // Generate accounts for all teachers who do not have accounts yet
  const handleGenerateTeacherAccounts = () => {
    let createdCount = 0;
    teachers.forEach((teacher) => {
      const hasAccount = users.some((u) => u.teacherId === teacher.civilServantId);
      if (!hasAccount) {
        const usernameBase = teacher.latinName.toLowerCase().replace(/\s+/g, '.');
        const homeroomClasses = classes.filter((c) => c.homeroomTeacherId === teacher.civilServantId).map((c) => c.id);
        const isHomeroom = homeroomClasses.length > 0;
        const targetRole: UserRole = isHomeroom ? 'HOMEROOM_TEACHER' : 'SUBJECT_TEACHER';

        const matchedSpec = specializations.find((s) => teacher.specialization.includes(s.nameKhmer));
        const assignedSubjects = matchedSpec ? [matchedSpec.code] : [];

        const randomColor = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];

        addUser({
          id: `user-gen-${teacher.civilServantId}`,
          username: usernameBase,
          email: `${usernameBase}@watphnom-hs.moeys.gov.kh`,
          khmerName: teacher.khmerName,
          latinName: teacher.latinName,
          role: targetRole,
          teacherId: teacher.civilServantId,
          assignedClassIds: homeroomClasses,
          assignedSubjectCodes: assignedSubjects,
          status: 'ACTIVE',
          permissions: { ...ROLE_DEFAULT_PERMISSIONS[targetRole] },
          avatarColor: randomColor,
          phoneNumber: teacher.phoneNumber,
          lastLogin: 'Never',
        });
        createdCount++;
      }
    });

    if (createdCount > 0) {
      showToast(
        language === 'km'
          ? `បានបង្កើតគណនីដោយស្វ័យប្រវត្តិចំនួន ${createdCount} គណនី សម្រាប់លោកគ្រូ-អ្នកគ្រូ!`
          : `Generated ${createdCount} teacher accounts successfully!`
      );
    } else {
      showToast(
        language === 'km'
          ? 'លោកគ្រូ-អ្នកគ្រូទាំងអស់មានគណនីរួចរាល់ហើយ!'
          : 'All teachers already have accounts!'
      );
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.role === 'PRINCIPAL' && users.filter((u) => u.role === 'PRINCIPAL').length <= 1) {
        showToast(language === 'km' ? 'មិនអាចលុបគណនីនាយកសាលាចុងក្រោយបានទេ!' : 'Cannot delete the only Principal account!');
        setDeleteTarget(null);
        return;
      }
      deleteUser(deleteTarget.id);
      showToast(
        language === 'km'
          ? `បានលុបគណនី "${deleteTarget.khmerName}" រួចរាល់!`
          : `User "${deleteTarget.latinName}" deleted!`
      );
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-800">
                {t('userManagementTitle')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('userManagementDesc')} • {school.nameKhmer}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Auto-generate teacher accounts */}
          <button
            onClick={handleGenerateTeacherAccounts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/80 cursor-pointer shadow-2xs"
            title={language === 'km' ? 'បង្កើតគណនីសម្រាប់គ្រូទាំងអស់' : 'Generate for all teachers'}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{language === 'km' ? 'បង្កើតគណនីគ្រូស្វ័យប្រវត្តិ' : 'Auto-Gen Teacher Accounts'}</span>
          </button>

          {/* Add New User */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : 'Add New User'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {language === 'km' ? 'អ្នកប្រើប្រាស់សរុប' : 'Total Users'}
          </div>
          <div className="text-2xl font-black text-slate-800">{users.length}</div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {users.filter((u) => u.status === 'ACTIVE').length} {language === 'km' ? 'សកម្ម' : 'Active'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('roleHomeroomTeacher')}
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {users.filter((u) => u.role === 'HOMEROOM_TEACHER').length}
          </div>
          <div className="text-[10px] text-slate-400">
            {language === 'km' ? 'គ្រប់គ្រងថ្នាក់រៀន' : 'Assigned homerooms'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('roleSubjectTeacher')}
          </div>
          <div className="text-2xl font-black text-cyan-600">
            {users.filter((u) => u.role === 'SUBJECT_TEACHER').length}
          </div>
          <div className="text-[10px] text-slate-400">
            {language === 'km' ? 'បញ្ចូលពិន្ទុតាមមុខវិជ្ជា' : 'Subject gradebook'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('currentUserLabel')}
          </div>
          <div className="text-sm font-black text-blue-700 truncate" title={currentUser?.khmerName}>
            {currentUser?.khmerName}
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-500" />
            <span>{currentUser?.role}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">{language === 'km' ? 'តួនាទី:' : 'Role:'}</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[200px]"
            >
              <option value="ALL">{language === 'km' ? 'តួនាទីទាំងអស់' : 'All Roles'}</option>
              <option value="PRINCIPAL">{t('rolePrincipal')}</option>
              <option value="ACADEMIC_OFFICER">{t('roleAcademicOfficer')}</option>
              <option value="HOMEROOM_TEACHER">{t('roleHomeroomTeacher')}</option>
              <option value="SUBJECT_TEACHER">{t('roleSubjectTeacher')}</option>
              <option value="STAFF_VIEWER">{t('roleStaffViewer')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-700 ml-1">{language === 'km' ? 'ស្ថានភាព:' : 'Status:'}</span>
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? t('all')
                  : st === 'ACTIVE'
                  ? language === 'km'
                    ? 'សកម្ម'
                    : 'Active'
                  : language === 'km'
                  ? 'អសកម្ម'
                  : 'Inactive'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះ គណនី ឬអ៊ីមែល...' : 'Search user, name, or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">{language === 'km' ? 'អ្នកប្រើប្រាស់ / ឈ្មោះ' : 'User / Full Name'}</th>
                <th className="p-3 w-36">{t('userRoleLabel')}</th>
                <th className="p-3">{t('assignedClassesLabel')}</th>
                <th className="p-3">{t('assignedSubjectsLabel')}</th>
                <th className="p-3 w-28 text-center">{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="p-3 w-40 text-center">{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u, idx) => {
                const roleConfig = getRoleConfig(u.role);
                const RoleIcon = roleConfig.icon;
                const isCurrentActive = currentUser?.id === u.id;

                // Find assigned class names
                const assignedClassNames = classes.filter((c) => u.assignedClassIds.includes(c.id)).map((c) => c.name);

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isCurrentActive
                        ? 'bg-blue-50/60 hover:bg-blue-50/90'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    {/* Index */}
                    <td className="p-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>

                    {/* User Info & Avatar */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                        >
                          {u.khmerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{u.khmerName}</span>
                            {isCurrentActive && (
                              <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-bold rounded-full">
                                {language === 'km' ? 'កំពុងប្រើ' : 'Current'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            @{u.username} • {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[10px] ${roleConfig.badgeBg}`}>
                        <RoleIcon className="w-3 h-3" />
                        <span>{language === 'km' ? roleConfig.labelKhmer : roleConfig.labelEnglish}</span>
                      </span>
                    </td>

                    {/* Assigned Classes */}
                    <td className="p-3">
                      {assignedClassNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedClassNames.map((name) => (
                            <span key={name} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">
                          {u.role === 'PRINCIPAL' || u.role === 'ACADEMIC_OFFICER'
                            ? language === 'km' ? 'គ្រប់ថ្នាក់ទាំងអស់' : 'All Classes'
                            : 'None'}
                        </span>
                      )}
                    </td>

                    {/* Assigned Subjects */}
                    <td className="p-3">
                      {u.assignedSubjectCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.assignedSubjectCodes.map((code) => {
                            const spec = specializations.find((s) => s.code === code);
                            return (
                              <span key={code} className="px-2 py-0.5 bg-cyan-50 text-cyan-800 rounded text-[10px] font-medium border border-cyan-200">
                                {spec ? spec.nameKhmer : code}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">
                          {u.role === 'PRINCIPAL' || u.role === 'ACADEMIC_OFFICER'
                            ? language === 'km' ? 'គ្រប់មុខវិជ្ជា' : 'All Subjects'
                            : 'None'}
                        </span>
                      )}
                    </td>

                    {/* Status Toggle Badge */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={language === 'km' ? 'ចុចដើម្បីប្តូរស្ថានភាព' : 'Click to toggle status'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{u.status === 'ACTIVE' ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'អសកម្ម' : 'Inactive')}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit User & Permissions */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title={language === 'km' ? 'កែសម្រួលគណនី និងសិទ្ធិ' : 'Edit User & Permissions'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                          title={language === 'km' ? 'លុបគណនី' : 'Delete User'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'km' ? 'មិនមានទិន្នន័យអ្នកប្រើប្រាស់ដែលស្វែងរកទេ' : 'No users found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'km'
              ? 'សូមជ្រើសរើសតម្រងផ្សេង ឬចុចបន្ថែមអ្នកប្រើប្រាស់ថ្មី។'
              : 'Try changing filter criteria or click Add New User.'}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT USER & PERMISSIONS MATRIX                    */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {formMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {formMode === 'ADD'
                      ? language === 'km'
                        ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី'
                        : 'Register New User'
                      : language === 'km'
                      ? 'កែសម្រួលគណនី និងសិទ្ធិប្រើប្រាស់'
                      : 'Edit User & Permissions'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{school.nameKhmer}</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Optional Link to Teacher */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                <label className="block text-blue-950 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>{t('linkToTeacherLabel')} (Optional)</span>
                </label>
                <select
                  value={formData.teacherId || ''}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">{language === 'km' ? '--- ជ្រើសរើសគ្រូបង្រៀនដើម្បីទាញទិន្នន័យស្វ័យប្រវត្តិ ---' : '--- Select Teacher to Auto-Populate ---'}</option>
                  {teachers.map((t) => (
                    <option key={t.civilServantId} value={t.civilServantId}>
                      {t.khmerName} ({t.latinName}) • {t.specialization} ({t.civilServantId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Details: Khmer Name & Latin Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'គោត្តនាម-នាម *' : 'Khmer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.khmerName}
                    onChange={(e) => setFormData({ ...formData, khmerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ឧ. សេង វណ្ណឌី"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឈ្មោះឡាតាំង *' : 'Latin Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.latinName}
                    onChange={(e) => setFormData({ ...formData, latinName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. SENG VANDY"
                  />
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឈ្មោះគណនី (Username) *' : 'Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. vandy.seng"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'អ៊ីមែល (Email) *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="vandy@school.gov.kh"
                  />
                </div>
              </div>

              {/* Password & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('password')} {formMode === 'ADD' ? '*' : language === 'km' ? '(ទុកទទេបើមិនប្តូរ)' : '(Optional)'}</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required={formMode === 'ADD'}
                      placeholder={formMode === 'ADD' ? '••••••••' : language === 'km' ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី...' : 'New password...'}
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('phoneLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="012 345 678"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('userRoleLabel')} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['PRINCIPAL', 'ACADEMIC_OFFICER', 'HOMEROOM_TEACHER', 'SUBJECT_TEACHER', 'STAFF_VIEWER'] as UserRole[]).map((r) => {
                    const cfg = getRoleConfig(r);
                    const isSelected = formData.role === r;
                    const RoleIcon = cfg.icon;

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <RoleIcon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                        <div className="text-[11px] font-bold leading-tight truncate">{language === 'km' ? cfg.labelKhmer.split(' / ')[0] : cfg.labelEnglish.split(' / ')[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Classrooms (Multi-select) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('assignedClassesLabel')}
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {classes.map((cls) => {
                    const isAssigned = formData.assignedClassIds.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            assignedClassIds: isAssigned
                              ? prev.assignedClassIds.filter((id) => id !== cls.id)
                              : [...prev.assignedClassIds, cls.id],
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                          isAssigned
                            ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isAssigned ? '✓ ' : '+ '}
                        {cls.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Subjects (Multi-select) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('assignedSubjectsLabel')}
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {specializations.map((spec) => {
                    const isAssigned = formData.assignedSubjectCodes.includes(spec.code);
                    return (
                      <button
                        key={spec.code}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            assignedSubjectCodes: isAssigned
                              ? prev.assignedSubjectCodes.filter((c) => c !== spec.code)
                              : [...prev.assignedSubjectCodes, spec.code],
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                          isAssigned
                            ? 'bg-cyan-600 text-white border-cyan-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isAssigned ? '✓ ' : '+ '}
                        {spec.nameKhmer} ({spec.code})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-black text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('permissionsMatrixLabel')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        permissions: { ...ROLE_DEFAULT_PERMISSIONS[prev.role] },
                      }));
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{language === 'km' ? 'កំណត់ឡើងវិញតាមតួនាទី' : 'Reset by Role'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                  {[
                    { key: 'canEnterAssignedScoresOnly', label: t('permEnterAssignedScoresOnly') },
                    { key: 'canEnterAllScores', label: t('permEnterAllScores') },
                    { key: 'canLockGrades', label: t('permLockGrades') },
                    { key: 'canTakeAttendance', label: t('permTakeAttendance') },
                    { key: 'canManageStudents', label: t('permManageStudents') },
                    { key: 'canTransferAndPromote', label: t('permTransferAndPromote') },
                    { key: 'canManageClasses', label: t('permManageClasses') },
                    { key: 'canManageTeachers', label: t('permManageTeachers') },
                    { key: 'canViewReports', label: t('permViewReports') },
                    { key: 'canEditSchoolInfo', label: t('permEditSchoolInfo') },
                    { key: 'canManageUsers', label: t('permManageUsers') },
                    { key: 'canExportBackup', label: t('permExportBackup') },
                  ].map((p) => {
                    const isChecked = !!formData.permissions[p.key as keyof SystemPermissions];
                    return (
                      <label
                        key={p.key}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(p.key as keyof SystemPermissions)}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`font-medium ${isChecked ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                          {p.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {formMode === 'ADD'
                    ? language === 'km'
                      ? 'រក្សាទុកអ្នកប្រើប្រាស់ថ្មី'
                      : 'Save User'
                    : language === 'km'
                    ? 'ធ្វើបច្ចុប្បន្នភាព'
                    : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION                                     */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-800">
                {language === 'km' ? 'បញ្ជាក់ការលុបគណនី' : 'Confirm User Deletion'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'km'
                  ? `តើអ្នកពិតជាចង់លុបគណនី "${deleteTarget.khmerName}" (@${deleteTarget.username}) មែនទេ?`
                  : `Are you sure you want to remove user "${deleteTarget.latinName}" (@${deleteTarget.username})?`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">{deleteTarget.khmerName}</span>
                <span className="text-[11px] text-slate-400 block font-mono">{deleteTarget.email}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[10px] rounded-md border border-blue-200">
                {deleteTarget.role}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/25 cursor-pointer"
              >
                {language === 'km' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
