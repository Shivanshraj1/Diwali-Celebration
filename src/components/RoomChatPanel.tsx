import React, { useEffect, useRef, useState } from 'react';
import { CharacterData, RoomChatMessage, UserProfile } from '../types';
import { AvatarImage } from './AvatarImage';
import {
  X,
  Send,
  MessageCircle,
  Sparkles,
  Trash2,
  ArrowDown,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface RoomChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: RoomChatMessage[];
  participants: CharacterData[];
  currentUser: UserProfile;
  hostUid: string;
  initialRecipient?: { uid: string; name: string } | null;
  onSendMessage: (
    text: string,
    kind: 'chat' | 'greeting',
    recipient?: { uid: string; name: string } | null
  ) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

const FESTIVE_QUICK_GREETINGS = [
  '🪔 Shubh Deepavali!',
  '✨ Happy Diwali everyone!',
  '🎆 Awesome fireworks display!',
  '🍬 Mithai time — enjoy everyone!',
  '🙏 Wishing peace, joy & light!'
];

function formatMessageTime(ms: number): string {
  try {
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const RoomChatPanel: React.FC<RoomChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  participants,
  currentUser,
  hostUid,
  initialRecipient,
  onSendMessage,
  onDeleteMessage
}) => {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [recipientUid, setRecipientUid] = useState<string>('');
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const otherFriends = participants.filter((p) => p.uid !== currentUser.uid);

  useEffect(() => {
    if (initialRecipient?.uid) {
      setRecipientUid(initialRecipient.uid);
    }
  }, [initialRecipient]);

  // Clear recipient if that friend left the room
  useEffect(() => {
    if (recipientUid && !otherFriends.some((f) => f.uid === recipientUid)) {
      setRecipientUid('');
    }
  }, [otherFriends, recipientUid]);

  // Scroll to bottom when opening or receiving messages while anchored at bottom
  useEffect(() => {
    if (!isOpen) return;
    const container = listRef.current;
    if (!container) return;
    if (shouldStickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      setShowJumpToBottom(false);
    } else if (messages.length > 0) {
      setShowJumpToBottom(true);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen) {
      shouldStickToBottomRef.current = true;
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedRecipient = recipientUid
    ? otherFriends.find((f) => f.uid === recipientUid) || null
    : null;

  const handleScroll = () => {
    const container = listRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 48;
    shouldStickToBottomRef.current = isNearBottom;
    if (isNearBottom) setShowJumpToBottom(false);
  };

  const scrollToLatest = () => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    shouldStickToBottomRef.current = true;
    setShowJumpToBottom(false);
  };

  const submitMessage = async (textToSend: string, kind: 'chat' | 'greeting') => {
    const clean = textToSend.trim();
    if (!clean || sending) return;

    setSending(true);
    setSendError(null);
    shouldStickToBottomRef.current = true;

    try {
      await onSendMessage(
        clean,
        kind,
        selectedRecipient ? { uid: selectedRecipient.uid || selectedRecipient.id, name: selectedRecipient.name } : null
      );
      if (kind === 'chat') {
        setDraft('');
      }
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      });
    } catch {
      setSendError('Could not deliver message right now. Please check your connection and retry.');
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitMessage(draft, 'chat');
  };

  const isHost = currentUser.uid === hostUid;

  return (
    <aside
      aria-label="Room chat and festive greetings"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="fixed inset-x-2 top-20 bottom-2 sm:inset-x-auto sm:right-4 sm:top-28 sm:bottom-24 sm:w-[390px] max-w-[calc(100vw-1rem)] z-[950] flex flex-col bg-zinc-950/95 border border-amber-500/45 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.88)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/90 bg-zinc-900/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white font-festive truncate">
              Room Chat &amp; Greetings
            </h3>
            <p className="text-[11px] text-zinc-400 truncate tabular-nums">
              {participants.length} {participants.length === 1 ? 'friend' : 'friends'} online · Live sync
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat panel"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recipient Picker Strip (Everyone vs Direct Friend Greeting) */}
      <div className="px-3.5 py-2 border-b border-zinc-800/70 bg-zinc-950/90 flex items-center gap-2 shrink-0">
        <label htmlFor="chat-recipient-select" className="text-[11px] font-semibold text-zinc-400 shrink-0">
          To:
        </label>
        <select
          id="chat-recipient-select"
          value={recipientUid}
          onChange={(e) => setRecipientUid(e.target.value)}
          className="flex-1 min-h-[36px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
        >
          <option value="">Everyone in room</option>
          {otherFriends.map((friend) => (
            <option key={friend.uid || friend.id} value={friend.uid || friend.id}>
              {friend.name} ({friend.isHost ? 'Host' : friend.relation})
            </option>
          ))}
        </select>
      </div>

      {/* Scrollable Message Thread */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-3.5 py-3 space-y-3"
        >
          {messages.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center px-4 gap-2">
              <Sparkles className="w-6 h-6 text-amber-400/80" />
              <p className="text-xs font-semibold text-zinc-200">
                Start the Festive Conversation
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[26ch]">
                Send a Diwali greeting or chat live with friends celebrating in this room.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.uid === currentUser.uid;
              const canDelete = isOwn || isHost;
              const isGreeting = msg.kind === 'greeting';

              return (
                <div
                  key={msg.messageId}
                  className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isOwn && (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-700 shrink-0 bg-zinc-900">
                      <AvatarImage
                        src={msg.senderPhotoURL}
                        name={msg.senderName}
                        characterId={msg.uid}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`group max-w-[82%] flex flex-col gap-0.5 ${
                      isOwn ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 px-1 text-[10px] text-zinc-400">
                      <span className="font-semibold text-zinc-300 truncate max-w-[130px]">
                        {isOwn ? 'You' : msg.senderName}
                      </span>
                      {msg.recipientName && (
                        <>
                          <span aria-hidden="true">→</span>
                          <span className="text-amber-300 font-medium truncate max-w-[100px]">
                            {msg.recipientName}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatMessageTime(msg.createdAtMs)}</span>
                    </div>

                    <div
                      className={`relative px-3 py-2 rounded-2xl text-xs leading-relaxed break-words border ${
                        isGreeting
                          ? 'bg-gradient-to-br from-amber-500/25 via-amber-600/15 to-rose-500/20 border-amber-400/50 text-amber-100'
                          : isOwn
                          ? 'bg-amber-400/15 border-amber-400/40 text-zinc-100'
                          : 'bg-zinc-900/95 border-zinc-800 text-zinc-100'
                      }`}
                    >
                      <span>{msg.text}</span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void onDeleteMessage(msg.messageId)}
                          aria-label="Delete message"
                          title="Delete message"
                          className="ml-2 inline-flex items-center align-middle text-zinc-500 hover:text-rose-400 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showJumpToBottom && (
          <button
            type="button"
            onClick={scrollToLatest}
            className="absolute bottom-2 right-3 min-h-[36px] px-3 py-1 rounded-full bg-amber-400 text-black text-[11px] font-bold shadow-lg flex items-center gap-1 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>
        )}
      </div>

      {/* Festive Quick Greetings Bar */}
      <div className="px-3 py-2 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {FESTIVE_QUICK_GREETINGS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={sending}
            onClick={() => void submitMessage(preset, 'greeting')}
            className="min-h-[38px] px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-400/50 text-[11px] font-medium text-amber-200 whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Send Error Alert */}
      {sendError && (
        <div className="px-3.5 py-2 bg-rose-500/15 border-t border-rose-500/40 flex items-center justify-between gap-2 text-[11px] text-rose-200 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{sendError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSendError(null)}
            className="text-rose-300 hover:text-white font-semibold shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleFormSubmit}
        className="p-2.5 sm:p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2 shrink-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      >
        <div className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            maxLength={400}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              selectedRecipient
                ? `Message ${selectedRecipient.name}...`
                : 'Send a festive greeting or message...'
            }
            className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          {draft.length > 300 && (
            <span className="absolute right-2.5 bottom-1 text-[9px] text-zinc-400 tabular-nums">
              {draft.length}/400
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label="Send message"
          className="min-h-[44px] min-w-[44px] px-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-45 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </aside>
  );
};
