import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Lock, Hash, MessageSquare, Users, 
  Send, Paperclip, Smile, ChevronLeft, FileText, 
  Pin, Plus, X, Check, Crown, Edit3, Camera, Image as ImageIcon
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type UserStatus = 'online' | 'away' | 'dnd' | 'offline' | 'mobile' | 'meeting';
type ChannelType = 'public' | 'private';
type MessageType = 'text' | 'file' | 'image' | 'video' | 'audio';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar: string;
  status: UserStatus;
  role: 'admin' | 'manager' | 'agent' | 'guest' | 'messaging_admin';
  department: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  lastSeen: Date;
  isOnCall?: boolean;
  photoUrl?: string;
}

interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  unread: number;
  description: string;
  memberCount: number;
  members: string[];
  createdBy: string;
  pinnedMessages?: Message[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  fileType: 'image' | 'video' | 'document' | 'audio';
  thumbnail?: string;
}

interface Message {
  id: string;
  userId: string;
  user: User;
  content: string;
  timestamp: Date;
  type: MessageType;
  attachments?: Attachment[];
  isDeleted?: boolean;
  deletedFor?: 'me' | 'all';
  isPinned?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  erpContext?: any;
  replyTo?: Message;
}

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// ============================================================================
// MOCK DATA - PAYROLL USERS
// ============================================================================

const MOCK_USERS: User[] = [
  { 
    id: 'u2', 
    firstName: 'Abyssinia', 
    lastName: 'CyberSec', 
    name: 'Abyssinia CyberSec',
    avatar: 'AC', 
    status: 'online', 
    role: 'admin', 
    department: 'Management',
    email: 'info@abyssinia-cybersec.com',
    phone: '+251 911 234 567',
    position: 'Company Account',
    joinDate: '2022-01-01',
    lastSeen: new Date(),
  },
  { 
    id: 'u3', 
    firstName: 'Abebe', 
    lastName: 'Bikila', 
    name: 'Abebe Bikila',
    avatar: 'AB', 
    status: 'online', 
    role: 'agent', 
    department: 'Sales',
    email: 'abebe.bikila@agrospace.et',
    phone: '+251 933 456 789',
    position: 'Field Agent',
    joinDate: '2023-06-20',
    lastSeen: new Date(),
  },
  { 
    id: 'u4', 
    firstName: 'Tirunesh', 
    lastName: 'Dibaba', 
    name: 'Tirunesh Dibaba',
    avatar: 'TD', 
    status: 'offline', 
    role: 'agent', 
    department: 'HR',
    email: 'tirunesh.dibaba@agrospace.et',
    phone: '+251 944 567 890',
    position: 'HR Coordinator',
    joinDate: '2023-09-01',
    lastSeen: new Date(Date.now() - 86400000),
  },
  {
    id: 'u5',
    firstName: 'Mohammed',
    lastName: 'Hassen',
    name: 'Mohammed Hassen',
    avatar: 'MH',
    status: 'online',
    role: 'manager',
    department: 'Operations',
    email: 'mohammed.hassen@agrospace.et',
    phone: '+251 955 678 901',
    position: 'Operations Manager',
    joinDate: '2021-11-11',
    lastSeen: new Date(),
  }
];

const INITIAL_CHANNELS: Channel[] = [];

const STATUS_LABELS: Record<UserStatus, string> = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
  mobile: 'Mobile',
  meeting: 'In a meeting'
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const Avatar: React.FC<{ user: User; size?: 'sm' | 'md' | 'lg' | 'xl'; showStatus?: boolean }> = ({ 
  user, size = 'md', showStatus = true 
}) => {
  const sizeClasses = { 
    sm: 'w-8 h-8 text-xs', 
    md: 'w-10 h-10 text-sm', 
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden`}>
      {user.photoUrl ? (
        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        user.avatar
      )}
      {showStatus && (
        <span className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
          user.status === 'online' ? 'bg-green-500' : 
          user.status === 'away' ? 'bg-amber-500' : 
          user.status === 'dnd' ? 'bg-red-500' : 'bg-slate-400'
        }`} />
      )}
    </div>
  );
};

// ============================================================================
// USER PROFILE MODAL
// ============================================================================

const ProfileModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  user: User;
  onUpdate: (user: User) => void;
}> = ({ isOpen, onClose, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate({...editedUser, name: `${editedUser.firstName} ${editedUser.lastName}`});
    setIsEditing(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] w-full max-w-lg overflow-hidden border border-white/20"
      >
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-cyan-500">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <div className="relative">
              <Avatar user={editedUser} size="xl" showStatus={false} />
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
                >
                  <Camera size={16} />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </button>
              )}
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                isEditing 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isEditing ? <><Check size={18} /> Save</> : <><Edit3 size={18} /> Edit</>}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{editedUser.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                {isEditing ? (
                  <input 
                    type="text"
                    value={editedUser.lastName}
                    onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{editedUser.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
              {isEditing ? (
                <select 
                  value={editedUser.department}
                  onChange={(e) => setEditedUser({...editedUser, department: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {['Finance', 'Sales', 'HR', 'Operations', 'Marketing'].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              ) : (
                <p className="font-semibold text-slate-800">{editedUser.department}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Position</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={editedUser.position}
                  onChange={(e) => setEditedUser({...editedUser, position: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-slate-600">{editedUser.position}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              {isEditing ? (
                <input 
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-slate-600">{editedUser.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              {isEditing ? (
                <input 
                  type="tel"
                  value={editedUser.phone}
                  onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-slate-600">{editedUser.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Join Date</label>
              <p className="text-slate-600">{new Date(editedUser.joinDate).toLocaleDateString('en-US')}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
              <div className="flex items-center gap-2">
                {editedUser.role === 'messaging_admin' && <Crown size={16} className="text-amber-500" />}
                <span className="capitalize font-medium text-slate-800">{editedUser.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// CHANNEL HEADER
// ============================================================================

interface ChannelHeaderProps {
  channel: Channel;
  users: User[];
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel, users }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const channelMembers = useMemo(() => 
    users.filter(user => channel.members.includes(user.id)),
    [channel.members, users]
  );

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {channel.type === 'private' ? (
            <Lock size={20} className="text-amber-500" />
          ) : (
            <Hash size={20} className="text-blue-500" />
          )}
          <div>
            <h3 className="font-bold text-lg text-slate-800">{channel.name}</h3>
            <p className="text-sm text-slate-500">{channel.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users size={16} />
          <span>{channel.memberCount} members</span>
        </div>
      </div>

      {channelMembers.length > 0 && (
        <div className="relative">
          <div className="text-xs font-medium text-slate-500 mb-2 flex items-center justify-between">
            <span>CHANNEL MEMBERS</span>
            <span className="text-slate-400">{channelMembers.length} people</span>
          </div>
          <div 
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto pb-2"
          >
            {channelMembers.map((member) => (
              <div 
                key={member.id}
                className="group relative flex flex-col items-center shrink-0 w-16 cursor-pointer"
              >
                <div className="relative">
                  <Avatar user={member} size="md" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-125 transform"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-400/50 transition-all duration-300"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {member.name}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 truncate w-full text-center mt-1 group-hover:font-medium group-hover:text-blue-600 transition-all">
                  {member.firstName}
                </p>
                <div className={`text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 ${
                  member.status === 'online' ? 'bg-green-100 text-green-700' :
                  member.status === 'away' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {STATUS_LABELS[member.status]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CREATE CHANNEL MODAL (Admin only)
// ============================================================================

const CreateChannelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreate: (channel: Channel, selectedUserIds: string[]) => void;
  currentUser: User;
}> = ({ isOpen, onClose, users, onCreate, currentUser }) => {
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser.role === 'messaging_admin' || currentUser.role === 'admin';
  
  const filteredUsers = users.filter((u: User) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedUsers(newSet);
  };

  const selectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u: User) => u.id)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    
    const newChannel: Channel = {
      id: `ch-${Date.now()}`,
      name: channelName,
      type: 'public',
      unread: 0,
      description,
      memberCount: selectedUsers.size + 1,
      members: Array.from(selectedUsers),
      createdBy: currentUser.id
    };
    
    onCreate(newChannel, Array.from(selectedUsers));
    onClose();
    setChannelName('');
    setDescription('');
    setSelectedUsers(new Set());
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
      >
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">Create a New Channel</h3>
          <p className="text-sm text-slate-500 mt-1">Only administrators can create channels</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Channel Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              placeholder="e.g.: marketing-team-2024"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1">Free name without special character limitations</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
              placeholder="Describe the purpose of this channel..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-700">Add Members</label>
              <button 
                type="button"
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedUsers.size === users.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            
            <div className="mb-3">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or department..."
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredUsers.map((user: User) => (
                <label 
                  key={user.id} 
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                >
                  <input 
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Avatar user={user} size="sm" showStatus={false} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.department} • {user.position}</p>
                  </div>
                  {user.id === currentUser.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">You</span>}
                </label>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-2">{selectedUsers.size} member(s) selected</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!channelName.trim()}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Channel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

const TopBar: React.FC<{ 
  currentUser: User; 
  onProfileClick: () => void;
}> = ({ currentUser, onProfileClick }) => {
  return (
    <div className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-[5px] border-b border-slate-200 z-40 shrink-0">
      <div className="pl-4">
        <h1 className="text-3xl font-black text-slate-900 mb-1">Chat</h1>
        <p className="text-slate-500">Communication & Collaboration</p>
      </div>
      
      {/* Profile button top right */}
      <button
        onClick={onProfileClick}
        className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all shadow-lg hover:shadow-xl"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
          {currentUser.avatar}
        </div>
      </button>
    </div>
  );
};

const LeftSidebar: React.FC<{
  channels: Channel[];
  users: User[];
  activeChannelId: string;
  onChannelSelect: (id: string) => void;
  onUserSelect: (id: string) => void;
  onCreateChannel: (channel: Channel, selectedUserIds: string[]) => void;
  currentUser: User;
  onlineUsers: User[];
  onProfileClick: () => void;
  searchQuery: string;
  messages: Record<string, Message[]>;
  dmMessages: Record<string, Message[]>;
}> = ({ channels, users, activeChannelId, onChannelSelect, onUserSelect, onCreateChannel, currentUser, onlineUsers, onProfileClick, searchQuery, messages, dmMessages }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isAdmin = currentUser.role === 'messaging_admin' || currentUser.role === 'admin';

  const filteredChannels = channels.filter((c: Channel) => {
    if (!searchQuery) return true;
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const msgMatch = messages[c.id]?.some((m: Message) => 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.attachments && m.attachments.some((a: Attachment) => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    return nameMatch || descMatch || msgMatch;
  });

  const filteredUsers = users.filter((u: User) => {
    if (u.id === currentUser.id) return false;
    if (!searchQuery) return true;
    const nameMatch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch = u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const posMatch = u.position.toLowerCase().includes(searchQuery.toLowerCase());
    const msgMatch = dmMessages[u.id]?.some((m: Message) => 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.attachments && m.attachments.some((a: Attachment) => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    return nameMatch || deptMatch || posMatch || msgMatch;
  });

  return (
    <>
      <CreateChannelModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        users={users}
        onCreate={onCreateChannel}
        currentUser={currentUser}
      />
      
      <div className="w-[240px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Channels */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CHANNELS</span>
              {isAdmin && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title="Create a channel (Admin only)"
                >
                  <Plus size={14} className="text-slate-600" />
                </button>
              )}
            </div>
            
            <div className="space-y-0.5">
              {filteredChannels.length === 0 ? (
                <p className="text-xs text-slate-400 px-3 py-2 italic">No channels created</p>
              ) : (
                filteredChannels.map((channel: Channel) => (
                  <button
                    key={channel.id}
                    onClick={() => onChannelSelect(channel.id)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeChannelId === channel.id 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                        : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {channel.type === 'private' ? <Lock size={14} /> : <Hash size={14} />}
                      <span className="truncate">{channel.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">{channel.members.length} mbrs</span>
                    {channel.unread > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[20px] text-center">
                        {channel.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              DIRECT MESSAGES
            </div>
            <div className="space-y-0.5">
              {filteredUsers.map((user: User) => (
                <button
                  key={user.id}
                  onClick={() => onUserSelect(user.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors ${
                    activeChannelId === `dm-${user.id}` ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <Avatar user={user} size="sm" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={user.status === 'online' ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                        {user.avatar}
                      </span>
                      <span className={user.status === 'online' ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {STATUS_LABELS[user.status as UserStatus]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active People */}
          <div>
            <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ACTIVE PEOPLE
            </div>
            <div className="space-y-0.5">
              {onlineUsers.map((user: User) => (
                <div key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm">
                  <Avatar user={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 truncate">{user.avatar}</span>
                      <span className="font-medium text-slate-800 truncate">{user.firstName} {user.lastName}</span>
                    </div>
                    <p className="text-xs text-green-600">Connected</p>
                  </div>
                </div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-xs text-slate-400 px-3 py-2">No one online</p>
              )}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-200 shrink-0">
          <div onClick={onProfileClick} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
            <Avatar user={currentUser} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Online
              </p>
            </div>
            <Settings size={16} className="text-slate-400 hover:text-slate-600" />
          </div>
        </div>
      </div>
    </>
  );
};

const ChatCenter: React.FC<{
  channel: Channel | null;
  dmUser: User | null;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  onDeleteMessage: (msgId: string, forAll: boolean) => void;
  onPinMessage: (msgId: string) => void;
  searchQuery: string;
  onBack: () => void;
  users: User[];
}> = ({ channel, dmUser, messages, currentUser, onSendMessage, onDeleteMessage, onPinMessage, searchQuery, onBack, users }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter((m: Message) => 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.attachments && m.attachments.some((a: Attachment) => a.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [messages, searchQuery]);

  const pinnedMessages = messages.filter((m: Message) => m.isPinned && !m.isDeleted);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    onSendMessage(input, attachments);
    setInput('');
    setAttachments([]);
    setReplyingTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: reader.result as string,
          fileType: file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('video/') ? 'video' : 
                   file.type.startsWith('audio/') ? 'audio' : 'document'
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const emojis = ['😀', '😂', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '👏', '😭', '😡', '👌', '🙏'];

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden min-h-0">
      {/* Header - Fixed Height */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-[5px] z-10 shrink-0">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {channel ? <Hash size={18} className="text-slate-500" /> : <MessageSquare size={18} className="text-slate-500" />}
            {channel ? `# ${channel.name}` : dmUser ? `Message to ${dmUser.name}` : ''}
          </h2>
          <p className="text-xs text-slate-500 truncate">
            {channel ? channel.description : dmUser ? `${dmUser.department} • ${dmUser.position}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pinnedMessages.length > 0 && (
            <button 
              onClick={() => setShowPinnedMessages(!showPinnedMessages)}
              className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm border border-amber-200 hover:bg-amber-100"
            >
              <Pin size={14} />
              <span>{pinnedMessages.length} pinned</span>
            </button>
          )}
          {channel && (
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Channel Banner */}
      {channel && <ChannelHeader channel={channel} users={users} />}

      {/* Pinned Messages */}
      {showPinnedMessages && pinnedMessages.length > 0 && (
        <div className="bg-amber-50/80 border-b border-amber-200 p-4 max-h-60 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pin size={16} className="text-amber-500" />
              <h3 className="font-semibold text-slate-800">Pinned Messages ({pinnedMessages.length})</h3>
            </div>
            <button 
              onClick={() => setShowPinnedMessages(false)}
              className="p-1 hover:bg-amber-100 rounded-full"
            >
              <X size={16} className="text-amber-600" />
            </button>
          </div>
          <div className="space-y-2">
            {pinnedMessages.map((msg: Message) => (
              <div key={msg.id} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
                <Pin size={16} className="text-amber-500 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-800">{msg.user.name}</span>
                    <span className="text-xs text-slate-400">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm text-slate-600">{msg.content}</p>
                </div>
                <button 
                  onClick={() => onPinMessage(msg.id)}
                  className="text-xs text-slate-400 hover:text-slate-600 shrink-0"
                >
                  Unpin
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES CONTAINER */}
      <div className="flex-1 min-h-0 w-full relative bg-white overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {filteredMessages.length === 0 && searchQuery && (
            <div className="text-center py-12 text-slate-400">
              <p>No messages found for "{searchQuery}"</p>
            </div>
          )}
          
          {filteredMessages.map((msg: Message) => (
            <div key={msg.id} className={`group flex gap-4 ${msg.isDeleted ? 'opacity-50' : ''}`}>
              <Avatar user={msg.user} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900">{msg.user.name}</span>
                  <span className="text-xs text-slate-400">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  {msg.isDeleted && <span className="text-xs text-red-500 italic">(deleted)</span>}
                  {msg.isPinned && <Pin size={12} className="text-amber-500" />}
                </div>
                
                {msg.replyTo && (
                  <div className="mb-2 p-2 bg-slate-100 rounded border-l-2 border-blue-400 text-sm text-slate-600">
                    <span className="font-semibold">Replying to {msg.replyTo.user.name}: </span>
                    {msg.replyTo.content}
                  </div>
                )}

                <div className="text-slate-700 whitespace-pre-wrap break-words">
                  {msg.isDeleted ? 'This message was deleted' : msg.content}
                </div>

                {!msg.isDeleted && msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.attachments.map((att: Attachment) => (
                      <div key={att.id} className="relative group/att">
                        {att.fileType === 'image' ? (
                          <img src={att.url} alt={att.name} className="w-48 h-48 object-cover rounded-lg border border-slate-200" />
                        ) : att.fileType === 'video' ? (
                          <video src={att.url} className="w-48 h-48 rounded-lg border border-slate-200" controls />
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
                            <FileText size={20} className="text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{att.name}</p>
                              <p className="text-xs text-slate-500">{(att.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!msg.isDeleted && (
                  <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setReplyingTo(msg)} className="text-xs text-slate-500 hover:text-blue-600">Reply</button>
                    <button onClick={() => onPinMessage(msg.id)} className="text-xs text-slate-500 hover:text-amber-600">{msg.isPinned ? 'Unpin' : 'Pin'}</button>
                    {msg.userId === currentUser.id && (
                      <>
                        <button onClick={() => onDeleteMessage(msg.id, false)} className="text-xs text-slate-500 hover:text-red-600">Delete for me</button>
                        <button onClick={() => onDeleteMessage(msg.id, true)} className="text-xs text-slate-500 hover:text-red-600">Delete for everyone</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer - Fixed Bottom */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        {replyingTo && (
          <div className="mb-2 p-2 bg-slate-100 rounded-lg flex justify-between items-center text-sm">
            <span className="text-slate-600">Replying to <span className="font-semibold">{replyingTo.user.name}</span></span>
            <button onClick={() => setReplyingTo(null)}><X size={16} /></button>
          </div>
        )}
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="w-full bg-transparent outline-none px-3 py-2 text-slate-700 resize-none h-20 overflow-y-auto"
          />
          
          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 px-2">
            <div className="flex gap-1">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-white rounded-lg transition-all">
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                <Paperclip size={18} />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-white rounded-lg transition-all">
                <ImageIcon size={18} />
              </button>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-500 hover:bg-white rounded-lg transition-all">
                <Smile size={18} />
              </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim() && attachments.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Emoji & Attachments Modals */}
      <AnimatePresence>
        {showEmojiPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowEmojiPicker(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl p-4 w-80" onClick={e => e.stopPropagation()}>
              <div className="grid grid-cols-6 gap-2">
                {emojis.map(emoji => (
                  <button key={emoji} onClick={() => { setInput(input + emoji); setShowEmojiPicker(false); }} className="text-2xl hover:bg-slate-100 p-2 rounded-lg">{emoji}</button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {attachments.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold">Attachments ({attachments.length})</h3>
                <button onClick={() => setAttachments([])}><X size={20} /></button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {attachments.map((att: Attachment) => (
                  <div key={att.id} className="relative group border rounded-xl overflow-hidden">
                    {att.fileType === 'image' ? <img src={att.url} alt={att.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-slate-50 flex flex-col items-center justify-center"><FileText size={32} /></div>}
                    <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button onClick={() => setAttachments([])} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Send</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ChatProps {
  searchTerm?: string;
}

const Chat: React.FC<ChatProps> = ({ searchTerm: globalSearch }) => {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [dmMessages, setDmMessages] = useState<Record<string, Message[]>>({});
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const effectiveSearch = globalSearch || searchQuery;

  const onlineUsers = useMemo(() => 
    MOCK_USERS.filter((u: User) => u.status === 'online' && u.id !== currentUser.id),
    [currentUser]
  );

  const handleCreateChannel = (channel: Channel, selectedUserIds: string[]) => {
    setChannels(prev => [...prev, channel]);
    setMessages(prev => ({ ...prev, [channel.id]: [] }));
    setActiveChannelId(channel.id);
  };

  const handleUserSelect = (userId: string) => {
    setActiveChannelId(`dm-${userId}`);
  };

  const handleSendMessage = (content: string, attachments?: Attachment[]) => {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content,
      timestamp: new Date(),
      type: 'text',
      attachments
    };

    if (activeChannelId.startsWith('dm-')) {
      const userId = activeChannelId.replace('dm-', '');
      setDmMessages(prev => ({ ...prev, [userId]: [...(prev[userId] || []), newMessage] }));
    } else {
      setMessages(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), newMessage] }));
    }
  };

  const handleDeleteMessage = (msgId: string, forAll: boolean) => {
    const deleteFor: 'me' | 'all' = forAll ? 'all' : 'me';
    const updateMessages = (msgs: Message[]): Message[] => msgs.map((m: Message) => 
      m.id === msgId ? { ...m, isDeleted: true, deletedFor: deleteFor, content: '' } : m
    );

    if (activeChannelId.startsWith('dm-')) {
      const userId = activeChannelId.replace('dm-', '');
      setDmMessages(prev => ({ ...prev, [userId]: updateMessages(prev[userId] || []) }));
    } else {
      setMessages(prev => ({ ...prev, [activeChannelId]: updateMessages(prev[activeChannelId] || []) }));
    }
  };

  const handlePinMessage = (msgId: string) => {
    const updateMessages = (msgs: Message[]): Message[] => msgs.map((m: Message) => 
      m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
    );

    if (activeChannelId.startsWith('dm-')) {
      const userId = activeChannelId.replace('dm-', '');
      setDmMessages(prev => ({ ...prev, [userId]: updateMessages(prev[userId] || []) }));
    } else {
      setMessages(prev => ({ ...prev, [activeChannelId]: updateMessages(prev[activeChannelId] || []) }));
    }
  };

  const activeChannel = channels.find((c: Channel) => c.id === activeChannelId);
  const activeDmUser = activeChannelId.startsWith('dm-') 
    ? MOCK_USERS.find((u: User) => u.id === activeChannelId.replace('dm-', '')) 
    : null;
  
  const currentMessages = activeChannelId.startsWith('dm-')
    ? dmMessages[activeChannelId.replace('dm-', '')] || []
    : messages[activeChannelId] || [];

  return (
    <div className="h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col font-sans antialiased bg-white relative">
      <GrainyTexture />
      <div className="flex flex-1 min-h-0 overflow-hidden h-full">
        <LeftSidebar 
          channels={channels}
          users={MOCK_USERS}
          activeChannelId={activeChannelId}
          onChannelSelect={setActiveChannelId}
          onUserSelect={handleUserSelect}
          onCreateChannel={handleCreateChannel}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          onProfileClick={() => setShowProfileModal(true)}
          searchQuery={effectiveSearch}
          messages={messages}
          dmMessages={dmMessages}
        />
        
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          <TopBar currentUser={currentUser} onProfileClick={() => setShowProfileModal(true)} />
          
          <ProfileModal 
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            user={currentUser}
            onUpdate={setCurrentUser}
          />

          {(activeChannel || activeDmUser) ? (
            <ChatCenter 
              channel={activeChannel || null}
              dmUser={activeDmUser || null}
              messages={currentMessages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onPinMessage={handlePinMessage}
              searchQuery={effectiveSearch}
              onBack={() => setActiveChannelId('')}
              users={MOCK_USERS}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50/50 text-slate-400 border-l border-slate-200 h-full">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;