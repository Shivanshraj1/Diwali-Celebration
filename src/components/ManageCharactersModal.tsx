import React, { useState, useRef } from 'react';
import { CharacterData } from '../types';
import { X, UserPlus, Trash2, Edit3, Check, Users, Upload, Link2, Share2, Copy } from 'lucide-react';
import { AvatarImage } from './AvatarImage';
import { aaravImg, priyaImg, kabirImg, ananyaImg } from '../data/constants';
import {
  AARAV_SVG_DATA_URI,
  PRIYA_SVG_DATA_URI,
  KABIR_SVG_DATA_URI,
  ANANYA_SVG_DATA_URI
} from '../assets/demoFaces';

interface ManageCharactersModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterData[];
  onUpdateCharacter: (id: string, newName: string, newRelation: string, newAvatarUrl?: string) => void;
  onAddCharacter: (character: CharacterData) => void;
  onRemoveCharacter: (id: string) => void;
}

export const ManageCharactersModal: React.FC<ManageCharactersModalProps> = ({
  isOpen,
  onClose,
  characters,
  onUpdateCharacter,
  onAddCharacter,
  onRemoveCharacter
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'people' | 'invite'>('people');

  // Edit character state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  // Add character state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Family Member');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);

  // Invite state
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviterName, setInviterName] = useState(characters[0]?.name || 'Friend');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const avatarOptions = [
    {
      avatarUrl: aaravImg || AARAV_SVG_DATA_URI,
      characterId: 'aarav',
      outfitColor: 'from-amber-500 to-yellow-600',
      accentBg: 'border-amber-400',
      label: 'Golden Silk Kurta'
    },
    {
      avatarUrl: priyaImg || PRIYA_SVG_DATA_URI,
      characterId: 'priya',
      outfitColor: 'from-rose-600 to-red-800',
      accentBg: 'border-rose-400',
      label: 'Crimson Zari Saree'
    },
    {
      avatarUrl: kabirImg || KABIR_SVG_DATA_URI,
      characterId: 'kabir',
      outfitColor: 'from-blue-600 to-indigo-900',
      accentBg: 'border-blue-400',
      label: 'Navy Royal Sherwani'
    },
    {
      avatarUrl: ananyaImg || ANANYA_SVG_DATA_URI,
      characterId: 'ananya',
      outfitColor: 'from-emerald-600 to-teal-800',
      accentBg: 'border-emerald-400',
      label: 'Emerald Green Lehenga'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (isEdit) {
          setEditAvatarUrl(result);
        } else {
          setCustomAvatarUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (char: CharacterData) => {
    setEditingId(char.id);
    setEditName(char.name);
    setEditRelation(char.relation);
    setEditAvatarUrl(char.avatarUrl);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdateCharacter(id, editName.trim(), editRelation.trim() || 'Family', editAvatarUrl || undefined);
    }
    setEditingId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const chosen = avatarOptions[selectedAvatarIdx];
    const newChar: CharacterData = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newName.trim(),
      relation: newRelation.trim() || 'Celebration Friend',
      outfitColor: chosen.outfitColor,
      accentBg: chosen.accentBg,
      avatarUrl: customAvatarUrl || chosen.avatarUrl,
      xPercent: 20 + Math.random() * 60,
      yPercent: 72 + Math.random() * 8,
      direction: Math.random() > 0.5 ? 'right' : 'left',
      state: 'idle',
      happiness: 100
    };

    onAddCharacter(newChar);
    setNewName('');
    setCustomAvatarUrl('');
    setIsAdding(false);
  };

  const getInviteUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('join', 'true');
    url.searchParams.set('invitedBy', inviterName);
    return url.toString();
  };

  const handleCopyInviteLink = () => {
    const link = getInviteUrl();
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2600);
    }).catch(() => {
      setCopiedLink(true);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join our Diwali Celebration!',
        text: `${inviterName} has invited you to celebrate Diwali, light fireworks, and share sweets together online!`,
        url: getInviteUrl()
      }).catch(() => {});
    } else {
      handleCopyInviteLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header with Sub-tabs */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-festive">
                People &amp; Invitations
              </h3>
              <p className="text-xs text-zinc-400">
                Manage names, profile pictures, and invite friends
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-zinc-800 px-6 pt-2 bg-zinc-950">
          <button
            onClick={() => setActiveSubTab('people')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'people'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Celebration People ({characters.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invite')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'invite'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Invite Friends with Link</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeSubTab === 'people' && (
            <>
              <div className="space-y-3">
                {characters.map((char) => {
                  const isEditing = editingId === char.id;

                  return (
                    <div
                      key={char.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Profile Picture with Edit Overlay */}
                        <div className="relative group shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 bg-zinc-800 shadow-md">
                            <AvatarImage
                              src={isEditing && editAvatarUrl ? editAvatarUrl : char.avatarUrl}
                              name={char.name}
                              characterId={char.id}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-amber-300 text-[10px] opacity-90 hover:opacity-100 transition-opacity"
                              title="Upload New Photo"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex-1 flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Name (e.g. Rahul)"
                              className="px-2.5 py-1 text-xs bg-zinc-950 border border-amber-400 rounded-lg text-white focus:outline-none"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editRelation}
                              onChange={(e) => setEditRelation(e.target.value)}
                              placeholder="Role (e.g. Brother, Friend)"
                              className="px-2.5 py-1 text-[11px] bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-300 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col truncate">
                            <span className="text-sm font-semibold text-white truncate">
                              {char.name}
                            </span>
                            <span className="text-xs text-amber-300/80 truncate">
                              {char.relation}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(char.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors"
                            title="Save Changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(char)}
                            className="p-2 text-zinc-400 hover:text-amber-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                            title="Edit Name, Photo &amp; Role"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {characters.length > 1 && (
                          <button
                            onClick={() => onRemoveCharacter(char.id)}
                            className="p-2 text-zinc-500 hover:text-rose-400 bg-zinc-800/60 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Remove Person"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hidden file input for editing avatar */}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, true)}
                className="hidden"
              />

              {/* Add Character Form */}
              {isAdding ? (
                <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-3">
                  <div className="text-xs font-semibold text-amber-300">
                    Add Person to Celebration
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter name (e.g. Shivansh)..."
                      className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                    <input
                      type="text"
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      placeholder="Role (e.g. Host, Cousin, Friend)"
                      className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Profile Picture Upload Section */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                      <span>Profile Picture:</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Custom Photo</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />

                    {customAvatarUrl ? (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-amber-400/50">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400">
                          <AvatarImage src={customAvatarUrl} name="Custom preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs text-emerald-400">Custom profile photo uploaded!</div>
                        <button
                          type="button"
                          onClick={() => setCustomAvatarUrl('')}
                          className="text-[11px] text-rose-400 ml-auto hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {avatarOptions.map((opt, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setSelectedAvatarIdx(idx)}
                            className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                              selectedAvatarIdx === idx
                                ? 'border-amber-400 bg-amber-500/20'
                                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-300/60">
                              <AvatarImage
                                src={opt.avatarUrl}
                                name={opt.label}
                                characterId={opt.characterId}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[9px] text-zinc-300 truncate w-full text-center">
                              {opt.label.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-md"
                    >
                      Add Person
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-amber-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Person with Custom Profile Pic</span>
                </button>
              )}
            </>
          )}

          {/* Invite Tab */}
          {activeSubTab === 'invite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300 font-festive">
                  <Share2 className="w-4 h-4" />
                  <span>Send Celebration Invitation Link</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Share this invitation with family and friends so they can join the Diwali celebration, light fireworks together, and share sweets!
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Your Name (as Inviter):</label>
                  <input
                    type="text"
                    value={inviterName}
                    onChange={(e) => setInviterName(e.target.value)}
                    placeholder="Your Name..."
                    className="w-full px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={getInviteUrl()}
                    className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-400 select-all font-mono truncate"
                  />
                  <button
                    onClick={handleCopyInviteLink}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleNativeShare}
                    className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Share via WhatsApp / Messages</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
